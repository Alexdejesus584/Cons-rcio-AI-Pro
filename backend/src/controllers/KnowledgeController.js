const prisma = require('../services/database');

const KnowledgeController = {
    async create(req, res) {
        try {
            const { titulo, conteudo_texto, categoria } = req.body;
            const knowledge = await prisma.knowledgeField.create({
                data: { titulo, conteudo_texto, categoria }
            });
            res.status(201).json(knowledge);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar campo de conhecimento' });
        }
    },

    async list(req, res) {
        try {
            const fields = await prisma.knowledgeField.findMany({
                where: { ativo: true }
            });
            res.json(fields);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao listar conhecimentos' });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const { titulo, conteudo_texto, categoria, ativo } = req.body;

            // Buscar versão atual para salvar no histórico
            const current = await prisma.knowledgeField.findUnique({
                where: { id: parseInt(id) }
            });

            if (!current) {
                return res.status(404).json({ error: 'Conhecimento não encontrado' });
            }

            // Salvar versão atual no histórico antes de atualizar
            await prisma.knowledgeHistory.create({
                data: {
                    knowledgeFieldId: current.id,
                    conteudo_texto: current.conteudo_texto,
                    versao: current.versao
                }
            });

            // Atualizar com nova versão
            const updated = await prisma.knowledgeField.update({
                where: { id: parseInt(id) },
                data: {
                    titulo,
                    conteudo_texto,
                    categoria,
                    ativo,
                    versao: current.versao + 1
                }
            });

            res.json(updated);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao atualizar conhecimento' });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            await prisma.knowledgeField.delete({ where: { id: parseInt(id) } });
            res.json({ message: 'Conhecimento removido com sucesso' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao remover conhecimento' });
        }
    }
};

module.exports = KnowledgeController;
