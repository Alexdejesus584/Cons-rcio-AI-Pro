const rateLimit = require('express-rate-limit');

// Rate limit por IP (padrão seguro)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Limite de 100 requisições por janela
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false }, // Ajustar para true se atrás de proxy
    message: {
        error: 'Muitas requisições deste IP, tente novamente após 15 minutos.'
    }
});

// Allowlist de IP para escopo SERVICE
const ipAllowlist = (allowedIps = []) => {
    return (req, res, next) => {
        // Apenas aplica se for escopo SERVICE
        if (req.user?.role === 'SERVICE') {
            const clientIp = req.ip || req.connection.remoteAddress;
            // Se a lista estiver vazia, permite todos (configuração inicial)
            if (allowedIps.length > 0 && !allowedIps.includes(clientIp)) {
                return res.status(403).json({
                    error: 'Acesso negado: IP não autorizado para este serviço.'
                });
            }
        }
        next();
    };
};

module.exports = {
    apiLimiter,
    ipAllowlist
};
