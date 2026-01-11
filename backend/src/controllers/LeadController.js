const prisma = require('../services/database');

const LeadController = {
    async listHotLeads(req, res) {
        try {
            const leads = await prisma.lead.findMany({
                where: { status: 'QUENTE' },
                orderBy: { createdAt: 'desc' }
            });
            res.json(leads);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao listar leads quentes' });
        }
    },

    async listAll(req, res) {
        try {
            const leads = await prisma.lead.findMany({
                orderBy: { createdAt: 'desc' }
            });
            res.json(leads);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao listar leads' });
        }
    },

    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const lead = await prisma.lead.update({
                where: { id: parseInt(id) },
                data: { status }
            });
            res.json(lead);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao atualizar status do lead' });
        }
    }
};

module.exports = LeadController;
