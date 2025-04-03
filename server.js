const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const ejs = require('ejs');
const router = require('./src/routers/router');
// const util = require('./src/utils/util'); // 🔹 Se "util" for um módulo seu, importe aqui!

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware para tratar JSON e formulários grandes
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Configuração de sessão
app.use(session({
    secret: 'keyboard cat',
    cookie: { maxAge: 10 * 60 * 1000 }, // 🔹 Convertido diretamente para milissegundos
    resave: false,
    saveUninitialized: true
}));

// Configuração do EJS como template engine
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/src/views'));

// Definição das rotas
app.use('/', router);

// Inicialização do servidor com verificação de porta
function startServer(port) {
    const server = http.createServer(app);

    server.listen(port, () => {
        console.log(`Servidor rodando na porta ${port}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`A porta ${port} está ocupada, tentando a próxima disponível...`);
            if (port < 5050) { // 🔹 Define um limite de tentativas (aqui, até a porta 5050)
                startServer(port + 1);
            } else {
                console.error("Não há portas disponíveis no intervalo definido.");
            }
        } else {
            console.error(`Erro ao iniciar o servidor: ${err.message}`);
        }
    });
}

startServer(PORT);