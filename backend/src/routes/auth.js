const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../middleware/auth');

router.post('/login', AuthController.login);
router.post('/setup', AuthController.registroInicial);

// Criar token de serviço para N8n (apenas ADMIN)
router.post('/service-token', authMiddleware(), AuthController.createServiceToken);

module.exports = router;

