#!/bin/bash

# Configurações do Servidor
SERVER_USER="root" # Ajuste se necessário, geralmente root ou um usuário com sudo
SERVER_HOST="m2vendas.com.br"
REMOTE_DIR="/opt/consorcio-ai-pro"
DOMAIN="consorcioaipro.m2vendas.com.br" # Ajuste o subdomínio aqui

# Cores
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}=== Iniciando Deploy do Consórcio AI Pro ===${NC}"

# 1. Verificar se o .env existe
if [ ! -f .env ]; then
    echo "Erro: Arquivo .env não encontrado. Crie um antes de fazer deploy."
    exit 1
fi

# 2. Copiar arquivos para o servidor
echo -e "${GREEN}--> Copiando arquivos para o servidor...${NC}"
ssh $SERVER_USER@$SERVER_HOST "mkdir -p $REMOTE_DIR"
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' \
    ./ $SERVER_USER@$SERVER_HOST:$REMOTE_DIR

# 3. Executar comandos remotos
echo -e "${GREEN}--> Executando comandos no servidor...${NC}"
ssh $SERVER_USER@$SERVER_HOST << EOF
    cd $REMOTE_DIR
    
    # Criar rede externa se não existir
    docker network inspect network_consorcioaipro >/dev/null 2>&1 || docker network create network_consorcioaipro

    # Exportar variável de domínio para o docker-compose
    export DOMAIN=$DOMAIN
    
    # Subir containers (Build e Detach)
    docker compose up -d --build --remove-orphans
    
    # Executar migrações do banco de dados (aguarda o banco subir um pouco)
    echo "Aguardando banco de dados iniciar..."
    sleep 10
    docker compose exec -T app npx prisma migrate deploy
    
    echo "Deploy concluído!"
EOF

echo -e "${GREEN}=== Sucesso! Sistema disponível em https://$DOMAIN ===${NC}"
