# Use a imagem oficial Node.js como base
FROM node:18-alpine AS builder

# Defina o diretório de trabalho dentro do container
WORKDIR /app

# Copie apenas os arquivos necessários para instalar as dependências
COPY package.json package-lock.json* ./

# Instale as dependências
RUN npm install

# Gere o cliente Prisma
RUN npx prisma generate

# Copie todo o código do projeto para o container
COPY . ./

# Compile o projeto para produção
RUN npm run build

# Use uma imagem mais leve para o ambiente de produção
FROM node:18-alpine

# Defina o diretório de trabalho no container
WORKDIR /app

# Copie as dependências instaladas e a build do estágio anterior
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public

# Copie o arquivo .env para o ambiente de produção
COPY --from=builder /app/.env ./

# Configure a variável de ambiente para produção
ENV NODE_ENV=production

# Exponha a porta padrão do Next.js
EXPOSE 3000

# Comando para iniciar o servidor Next.js
CMD ["npm", "start"]
