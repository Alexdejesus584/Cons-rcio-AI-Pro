const { OpenAI } = require('openai');
const prisma = require('./database');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL
});

const AIService = {
    async getKnowledgeBase() {
        const fields = await prisma.knowledgeField.findMany({ where: { ativo: true } });
        const materials = await prisma.material.findMany();

        let context = "INFORMAÇÕES DA BASE DE CONHECIMENTO:\n\n";

        fields.forEach(f => {
            context += `--- ${f.titulo} ---\n${f.conteudo_texto}\n\n`;
        });

        materials.forEach(m => {
            context += `--- Documento: ${m.titulo} ---\nDescrição: ${m.descricao}\nTags: ${m.tags}\nTipo: ${m.tipo}\n\n`;
        });

        return context;
    },

    async processConversation(message, history = []) {
        const knowledgeBase = await this.getKnowledgeBase();

        const systemPrompt = `
Você é um assistente especializado em vendas de consórcios da 'Consorcio AI Knowledge'.
Sua missão é educar o cliente, tirar dúvidas e qualificar o interesse.

REGRAS ABSOLUTAS:
1. Responda APENAS com base na base de conhecimento fornecida abaixo.
2. NUNCA use conhecimento externo ou geral sobre consórcios.
3. NUNCA invente preços, prazos, regras de aprovação ou garantias que não estejam no texto.
4. Se a informação não estiver na base de conhecimento, diga educadamente que não possui essa informação específica.
5. NÃO existe funcionalidade de agendamento.
6. Seu objetivo é qualificar o lead. Se ele demonstrar interesse real (querer contratar, pedir cotação específica, deixar dados), classifique como QUENTE.

BASE DE CONHECIMENTO:
${knowledgeBase}

CLASSIFICAÇÃO DE LEADS:
- FRIO (score 0-40): Apenas curiosidade, perguntas genéricas
- QUENTE (score 41-100): Interesse real, pediu valores, quer contratar, deixou dados

FORMATO DE RESPOSTA (DEVE SER JSON ESTRITO):
{
  "resposta": "Texto da sua resposta para o cliente",
  "status_lead": "FRIO" ou "QUENTE",
  "tipo_consorcio": "Moto", "Carro", "Imóvel", "Serviços" ou null (se não identificado),
  "score_interesse": 0 a 100 (baseado nos critérios acima),
  "motivos": ["razão 1", "razão 2"] (lista de motivos que justificam o score, ex: "pediu valores", "demonstrou interesse em contratar", "apenas curiosidade"),
  "mensagem_especialista": true ou false (true se o lead for QUENTE e você informar que um humano vai assumir)
}
`;

        const messages = [
            { role: "system", content: systemPrompt },
            ...history,
            { role: "user", content: message }
        ];

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo-0125", // Ou gpt-4-turbo-preview para melhor precisão JSON
                messages,
                response_format: { type: "json_object" }
            });

            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error("OpenAI Error:", error);
            throw new Error("Falha ao processar resposta da IA");
        }
    }
};

module.exports = AIService;
