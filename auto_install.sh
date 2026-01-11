#!/bin/bash

# Configurações
SERVER_USER="root"
SERVER_HOST="m2vendas.com.br"
REMOTE_DIR="/opt/consorcio-ai-pro"
REPO_URL="https://github.com/Alexdejesus584/Cons-rcio-AI-Pro.git"
DOMAIN="consorcioaipro.m2vendas.com.br"

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Iniciando Auto-Instalação via Git ===${NC}"

# 1. Verificar .env local
if [ ! -f .env ]; then
    echo "Erro: Arquivo .env local não encontrado!"
    exit 1
fi

# 2. Enviar .env para o servidor (Segurança)
echo -e "${GREEN}--> Enviando arquivo .env para o servidor...${NC}"
ssh $SERVER_USER@$SERVER_HOST "mkdir -p $REMOTE_DIR"
scp .env $SERVER_USER@$SERVER_HOST:$REMOTE_DIR/.env

# 3. Executar instalação remota
echo -e "${GREEN}--> Executando instalação no servidor...${NC}"
ssh $SERVER_USER@$SERVER_HOST << EOF
    # Instalar Git se não existir
    if ! command -v git &> /dev/null; then
        apt-get update && apt-get install -y git
    fi

    # Configurar diretório
    if [ -d "$REMOTE_DIR/.git" ]; then
        echo "Repositorio ja existe. Atualizando..."
        cd $REMOTE_DIR
        git reset --hard
        git pull origin main
    else
        echo "Clonando repositorio..."
        git clone $REPO_URL $REMOTE_DIR
        cd $REMOTE_DIR
    fi

    # Configurar Rede Externa
    docker network inspect network_consorcioaipro >/dev/null 2>&1 || docker network create network_consorcioaipro

    # Exportar variaveis
    export DOMAIN=$DOMAIN
    
    # Subir Containers
    echo "Subindo containers..."
    docker compose up -d --build --remove-orphans

    # Rodar Migrations
    echo "Rodando migracoes..."
    sleep 5
    docker compose exec -T app npx prisma migrate deploy

    echo "Instalacao Concluida!"
EOF

echo -e "${BLUE}=== Sucesso! Acesse: https://$DOMAIN ===${NC}"
