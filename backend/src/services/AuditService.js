const prisma = require('./database');

const AuditService = {
    /**
     * Registra uma ação no log de auditoria
     * @param {Object} data 
     * @param {number} [data.usuarioId] - ID do usuário (opcional para SERVICE)
     * @param {string} data.acao - LOGIN, IA_EXECUTE, KNOWLEDGE_CHANGE, etc
     * @param {string} data.identidade - 'ADMIN' ou 'SERVICE' (ou o ID/Nome do serviço)
     * @param {Object} [data.detalhes] - Detalhes adicionais da operação
     * @param {string} [data.ip] - IP de origem
     */
    async log({ usuarioId, acao, identidade, detalhes, ip }) {
        try {
            return await prisma.auditLog.create({
                data: {
                    usuarioId,
                    acao,
                    identidade,
                    detalhes: detalhes ? JSON.stringify(detalhes) : null,
                    ip
                }
            });
        } catch (error) {
            console.error('Falha ao gravar log de auditoria:', error);
            // Não bloqueia a execução principal por falha no log,
            // mas em produção isso deve ser monitorado de perto.
        }
    }
};

module.exports = AuditService;
