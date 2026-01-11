const AIService = require('../services/AIService');
const prisma = require('../services/database');

const IAController = {
    async getContext(req, res) {
        try {
            const context = await AIService.getKnowledgeBase();
            res.json({ context });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao obter contexto' });
        }
    },

    async processConversation(req, res) {
        try {
            const { nome, telefone, mensagem } = req.body; // Removemos 'historico' do input

            if (!mensagem || !telefone) {
                return res.status(400).json({ error: 'Mensagem e telefone são obrigatórios' });
            }

            // 1. Garantir que o Lead existe
            let lead = await prisma.lead.upsert({
                where: { telefone },
                update: { nome: nome || undefined },
                create: {
                    nome: nome || 'Cliente WhatsApp',
                    telefone
                }
            });

            // 2. Salvar mensagem do usuário
            await prisma.message.create({
                data: {
                    role: 'user',
                    content: mensagem,
                    leadId: lead.id
                }
            });

            // 3. Recuperar histórico (últimas 10 mensagens)
            const oldMessages = await prisma.message.findMany({
                where: { leadId: lead.id },
                orderBy: { createdAt: 'desc' },
                take: 10
            });
            // Reverter para ordem cronológica corret
            const history = oldMessages.reverse().map(m => ({
                role: m.role,
                content: m.content
            }));

            // 4. Processar com a IA (passando o histórico recuperado do BD)
            const aiResponse = await AIService.processConversation(mensagem, history);

            // 5. Salvar resposta da IA
            await prisma.message.create({
                data: {
                    role: 'assistant',
                    content: aiResponse.resposta,
                    leadId: lead.id
                }
            });

            // 6. Atualizar status do Lead com a nova qualificação
            lead = await prisma.lead.update({
                where: { id: lead.id },
                data: {
                    tipo_consorcio: aiResponse.tipo_consorcio,
                    score_interesse: aiResponse.score_interesse || 0,
                    status: aiResponse.status_lead,
                    motivos: aiResponse.motivos ? JSON.stringify(aiResponse.motivos) : null
                }
            });

            res.json({
                ...aiResponse,
                lead_id: lead.id
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro interno na conversa da IA' });
        }
    }
};

module.exports = IAController;
