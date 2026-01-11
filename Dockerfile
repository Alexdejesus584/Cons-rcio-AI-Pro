# Usando imagem Debian-based (mais compatível com Prisma/OpenSSL)
FROM node:18-slim

# Instalar dependências do sistema necessárias para o Prisma (OpenSSL)
RUN apt-get update -y && apt-get install -y openssl ca-certificates

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar todo o código
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Expor porta
EXPOSE 3000

# Comando de inicialização
CMD ["npm", "start"]
