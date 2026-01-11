# Consórcio AI Knowledge

Sistema de IA para vendas de consórcio com base de conhecimento controlada.

## Como Iniciar (Desenvolvimento)

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure o arquivo `.env` com sua `OPENAI_API_KEY`.

3. Inicialize o banco de dados:
   ```bash
   npx prisma migrate dev --name init
   ```

4. Inicie o servidor:
   ```bash
   npm run dev
   ```

5. O painel administrativo estará acessível via `http://localhost:3000/admin` (Sugerimos servir a pasta frontend).

## Integração N8n

Aponte seu webhook para:
`POST http://seu-dominio/api/ia/conversa`

Use o Header de Autorização:
`Authorization: Bearer token-servico-n8n-padrao`

## Regras do Sistema

- A IA só responde o que estiver cadastrado em **Gerenciamento de Conhecimento** ou **Materiais**.
- Leads são classificados automaticamente.
- Apenas leads **QUENTES** devem acionar notificações humanas no N8n.
