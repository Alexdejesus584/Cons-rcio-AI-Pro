const prisma = require('../services/database');
const security = require('../utils/security');
const AuditService = require('../services/AuditService');

const AuthController = {
    /**
     * Gerar Token de Serviço para N8n/Automações
     * Apenas ADMINs podem criar tokens de serviço
     */
    async createServiceToken(req, res) {
        try {
            const { nome, scopes, expiresIn } = req.body;

            if (!nome || !scopes || !Array.isArray(scopes)) {
                return res.status(400).json({
                    error: 'Nome e scopes são obrigatórios. Scopes deve ser um array.'
                });
            }

            // Escopos válidos do sistema
            const validScopes = [
                'ia:execute',
                'knowledge:read',
                'knowledge:write',
                'materiais:write',
                'leads:read',
                'leads:write'
            ];

            // Validar escopos fornecidos
            const invalidScopes = scopes.filter(s => !validScopes.includes(s));
            if (invalidScopes.length > 0) {
                return res.status(400).json({
                    error: 'Escopos inválidos fornecidos',
                    invalid: invalidScopes,
                    valid: validScopes
                });
            }

            // Gerar token de serviço (longa duração por padrão: 1 ano)
            const tokenPayload = {
                id: `service_${Date.now()}`,
                nome,
                role: 'SERVICE',
                scopes,
                type: 'SERVICE_TOKEN'
            };

            const token = security.generateToken(tokenPayload, expiresIn || '365d');

            await AuditService.log({
                usuarioId: req.user.id,
                acao: 'SERVICE_TOKEN_CRIADO',
                identidade: req.user.role,
                detalhes: { nome, scopes },
                ip: req.ip
            });

            res.status(201).json({
                message: 'Token de serviço criado com sucesso',
                nome,
                scopes,
                token,
                uso: 'Adicione no header: Authorization: Bearer <token>',
                exemplo_n8n: {
                    header_name: 'Authorization',
                    header_value: `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar token de serviço' });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await prisma.usuario.findUnique({ where: { email } });

            if (!user || !(await security.comparePassword(password, user.senha_hash))) {
                await AuditService.log({
                    acao: 'LOGIN_FALHA',
                    identidade: 'DESCONHECIDO',
                    detalhes: { email, motivo: 'Credenciais inválidas' },
                    ip: req.ip
                });
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }

            // Converter scopes de String (JSON no SQLite) para Array
            const scopesArray = JSON.parse(user.scopes || '[]');

            const token = security.generateToken({
                id: user.id,
                email: user.email,
                role: user.role,
                scopes: scopesArray
            });

            await AuditService.log({
                usuarioId: user.id,
                acao: 'LOGIN_SUCESSO',
                identidade: user.role,
                ip: req.ip
            });

            res.json({
                token,
                user: {
                    nome: user.nome,
                    email: user.email,
                    role: user.role,
                    scopes: scopesArray
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro no login' });
        }
    },

    async registroInicial(req, res) {
        try {
            const count = await prisma.usuario.count();
            if (count > 0) return res.status(403).json({ error: 'Usuário inicial já existe' });

            const { nome, email, password } = req.body;
            const senha_hash = await security.hashPassword(password);

            // Escopos padrão para o ADMIN inicial conforme spec
            const defaultScopes = [
                "ia:execute",
                "knowledge:write",
                "knowledge:read",
                "materiais:write",
                "leads:read"
            ];

            const user = await prisma.usuario.create({
                data: {
                    nome,
                    email,
                    senha_hash,
                    role: 'ADMIN',
                    scopes: JSON.stringify(defaultScopes)
                }
            });

            await AuditService.log({
                usuarioId: user.id,
                acao: 'REGISTRO_INICIAL',
                identidade: 'ADMIN',
                detalhes: { nome, email },
                ip: req.ip
            });

            res.status(201).json({ message: 'Admin criado com sucesso' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar admin' });
        }
    }
};

module.exports = AuthController;
