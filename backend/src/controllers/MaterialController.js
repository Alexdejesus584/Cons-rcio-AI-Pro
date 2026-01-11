const prisma = require('../services/database');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const MaterialController = {
    async upload(req, res) {
        try {
            const { titulo, descricao, tags, contexto_semantico } = req.body;
            const file = req.file;

            if (!file) {
                return res.status(400).json({ error: 'Nenhum arquivo enviado' });
            }

            const tipo = file.mimetype.includes('pdf') ? 'PDF' : 'IMAGE';
            let conteudo_extraido = null;

            // Se for PDF, extrair texto para a IA
            if (tipo === 'PDF') {
                const dataBuffer = fs.readFileSync(file.path);
                const data = await pdfParse(dataBuffer);
                conteudo_extraido = data.text;
            }

            // Para imagens, o contexto semântico é obrigatório para a IA entender
            if (tipo === 'IMAGE' && !contexto_semantico) {
                // Usar descrição como fallback se contexto não for fornecido
                // Mas alertar que o ideal é fornecer contexto semântico
            }

            const material = await prisma.material.create({
                data: {
                    titulo,
                    descricao,
                    tags,
                    tipo,
                    arquivo: file.filename,
                    contexto_semantico: tipo === 'IMAGE' ? (contexto_semantico || descricao) : null
                }
            });

            // Se extraiu texto de PDF, criamos um campo de conhecimento automático para a IA ler
            if (conteudo_extraido) {
                await prisma.knowledgeField.create({
                    data: {
                        titulo: `[PDF] ${titulo}`,
                        conteudo_texto: conteudo_extraido,
                        categoria: 'Documento Técnico',
                        ativo: true
                    }
                });
            }

            // Para imagens com contexto semântico, também criar entrada de conhecimento
            if (tipo === 'IMAGE' && (contexto_semantico || descricao)) {
                await prisma.knowledgeField.create({
                    data: {
                        titulo: `[IMAGEM] ${titulo}`,
                        conteudo_texto: `Imagem: ${titulo}\nDescrição: ${descricao || 'N/A'}\nContexto: ${contexto_semantico || descricao}\nTags: ${tags || 'N/A'}`,
                        categoria: 'Material Visual',
                        ativo: true
                    }
                });
            }

            res.status(201).json(material);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao fazer upload do material' });
        }
    },



    async list(req, res) {
        try {
            const materiais = await prisma.material.findMany({
                orderBy: { createdAt: 'desc' }
            });
            res.json(materiais);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao listar materiais' });
        }
    }
};

module.exports = MaterialController;
