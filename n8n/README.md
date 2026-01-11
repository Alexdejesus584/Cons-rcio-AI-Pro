# 🔄 Integração N8n - Consórcio AI Knowledge

Este guia explica como configurar o fluxo N8n para integração com o sistema Consórcio AI Knowledge.

## 📋 Visão Geral do Fluxo

```
Webhook WhatsApp → Filtrar Texto → Extrair Dados → Consultar IA → Lead Quente?
                                                                      ↓
                                                            ┌────────┴────────┐
                                                            ↓                 ↓
                                                    Notificar Admin    Responder Cliente
                                                    + Responder
```

## 🚀 Instalação

### 1. Importar Workflow

1. No N8n, vá em **Workflows** → **Importar**
2. Selecione o arquivo `workflow-consorcio-whatsapp.json`
3. O workflow será criado com todos os nós configurados

### 2. Criar Credencial do Consórcio AI

1. Vá em **Credentials** → **New**
2. Selecione **Header Auth**
3. Configure:
   - **Name**: `Consorcio AI Token`
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer SEU_TOKEN_AQUI`

> 💡 **Gerar Token**: Acesse o painel admin → ⚙️ Configurações → Gerar Token de Serviço
> 
> Escopos necessários: `ia:execute`, `leads:read`

### 3. Criar Credencial da Evolution API (WhatsApp)

1. Vá em **Credentials** → **New**
2. Selecione **Header Auth**
3. Configure:
   - **Name**: `Evolution API`
   - **Header Name**: `apikey`
   - **Header Value**: `SUA_APIKEY_EVOLUTION`

### 4. Configurar URLs

Edite os seguintes nós e substitua as URLs:

| Nó | URL Padrão | Substituir por |
|----|------------|----------------|
| Consultar IA Consórcio | `http://localhost:3000/api/ia/conversa` | URL do seu servidor |
| Enviar Resposta WhatsApp | `https://api.evolution.com.br/message/sendText/INSTANCIA` | Sua URL Evolution |
| Notificar Admin | `https://api.evolution.com.br/message/sendText/INSTANCIA` | Sua URL Evolution |
| Enviar Resposta (Lead Frio) | `https://api.evolution.com.br/message/sendText/INSTANCIA` | Sua URL Evolution |

### 5. Configurar Número do Admin

No nó **Notificar Admin (Lead Quente)**, edite o JSON e substitua:
```
SEU_NUMERO_ADMIN@s.whatsapp.net
```
Pelo seu número real (ex: `5511999999999@s.whatsapp.net`)

## 🔗 Configurar Webhook na Evolution API

1. Na Evolution API, vá em **Webhooks**
2. Configure o webhook de mensagens recebidas:
   - **URL**: `https://seu-n8n.com/webhook/whatsapp-webhook`
   - **Events**: `messages.upsert`

## 📊 Fluxo de Dados

### Entrada (Webhook)
```json
{
  "body": {
    "data": {
      "key": {
        "remoteJid": "5511999999999@s.whatsapp.net"
      },
      "message": {
        "type": "text",
        "conversation": "Quero saber sobre consórcio de carro"
      },
      "pushName": "João Silva"
    }
  }
}
```

### Resposta da IA
```json
{
  "resposta": "Olá! O consórcio de carro é uma excelente opção...",
  "status_lead": "QUENTE",
  "tipo_consorcio": "Carro",
  "nivel_interesse": 4,
  "mensagem_especialista": true,
  "lead_id": 123
}
```

## 🔥 Comportamento por Status do Lead

| Status | Ações |
|--------|-------|
| **QUENTE** | 1. Envia resposta ao cliente<br>2. Notifica admin com dados do lead |
| **FRIO** | 1. Apenas envia resposta ao cliente |

## ⚙️ Endpoints da API

| Endpoint | Método | Descrição | Escopo |
|----------|--------|-----------|--------|
| `/api/ia/conversa` | POST | Processa mensagem com IA | `ia:execute` |
| `/api/leads/quentes` | GET | Lista leads quentes | `leads:read` |
| `/api/leads` | GET | Lista todos os leads | `leads:read` |

## 🛠️ Troubleshooting

### Erro 401 - Token não fornecido
- Verifique se a credencial está configurada corretamente
- Confirme que o header é `Authorization` (não `authorization`)

### Erro 403 - Escopo insuficiente
- O token precisa ter o escopo `ia:execute`
- Gere um novo token com os escopos corretos

### Mensagens não chegam
- Verifique se o webhook está ativo no N8n
- Confirme a URL do webhook na Evolution API

## 📝 Exemplo de Teste

Use o **Postman** ou **curl** para testar:

```bash
curl -X POST http://localhost:3000/api/ia/conversa \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "telefone": "5511999999999",
    "nome": "Teste",
    "mensagem": "Quero saber sobre consórcio de imóvel"
  }'
```

---

**Versão**: 1.0.0  
**Compatível com**: N8n v1.0+, Evolution API v2.0+
