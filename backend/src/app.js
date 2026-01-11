const express = require('express');
const cors = require('cors');
const path = require('path');
const { apiLimiter } = require('./middleware/security');

// Importar rotas
const authRoutes = require('./routes/auth');
const knowledgeRoutes = require('./routes/knowledge');
const materialRoutes = require('./routes/materiais');
const iaRoutes = require('./routes/ia');
const leadRoutes = require('./routes/leads');

const app = express();

// Middlewares Globais
app.use(cors());
app.use(express.json());
app.use(apiLimiter); // Rate limiting global/baseado em token

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../../../uploads')));
app.use('/', express.static(path.join(__dirname, '../../frontend')));

// Rota de Health Check (Saúde do Sistema)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        sistema: 'Consórcio AI Knowledge',
        idioma: 'pt-br',
        timestamp: new Date().toISOString()
    });
});

// Registrar rotas modulares
app.use('/api/auth', authRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/materiais', materialRoutes);
app.use('/api/ia', iaRoutes);
app.use('/api/leads', leadRoutes);

// Middleware de tratamento de erros global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Erro interno no servidor',
        mensagem: err.message
    });
});

module.exports = app;
