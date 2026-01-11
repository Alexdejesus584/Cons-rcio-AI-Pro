const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

/**
 * Middleware de Autenticação com Escopos
 * @param {string[]} requiredScopes - Lista de escopos necessários para a rota
 */
const authMiddleware = (requiredScopes = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Tipo de autenticação inválido' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      // Armazena a identidade no request
      req.user = decoded;

      // Se não houver escopos requeridos, apenas valida o token
      if (requiredScopes.length === 0) {
        return next();
      }

      // Verifica se o token tem os escopos necessários
      // Assume-se que decoded.scopes é um array de strings
      const userScopes = Array.isArray(decoded.scopes) ? decoded.scopes : [];

      const hasAccess = requiredScopes.every(scope => userScopes.includes(scope));

      if (!hasAccess) {
        return res.status(403).json({
          error: 'Escopo insuficiente para realizar esta operação',
          required: requiredScopes,
          provided: userScopes
        });
      }

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expirado' });
      }
      return res.status(401).json({ error: 'Token inválido' });
    }
  };
};

module.exports = authMiddleware;
