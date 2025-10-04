# Use a imagem oficial Node.js como base
FROM node:18-alpine AS builder

# Defina o diretório de trabalho dentro do container
WORKDIR /app

# Copie apenas os arquivos necessários para instalar as dependências
COPY package.json package-lock.json* ./

# Instale as dependências
RUN npm install

# Copie a pasta Prisma para o container
COPY prisma ./prisma

# Gere o cliente Prisma
RUN npx prisma generate

# Copie todo o código do projeto para o container
COPY . ./

# Caso o build precise das variáveis de ambiente, copie o arquivo apropriado aqui
# Utilize o build argument para selecionar qual arquivo usar (padrão: .env)
ARG ENV_FILE=.env
COPY ${ENV_FILE} .env

# Compile o projeto para produção (aqui o .env já estará presente se necessário)
RUN npm run build

# -------------------------
# Imagem para produção
FROM node:18-alpine

# Defina o diretório de trabalho no container
WORKDIR /app

# Configure a variável de ambiente para produção
ENV NODE_ENV=production

# Copie apenas os arquivos necessários do standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Se necessário, copie o .env do estágio de build
ARG ENV_FILE=.env
RUN echo "Dockerfile build argument ENV_FILE: ${ENV_FILE}"
COPY --from=builder /app/.env .env

# Exponha a porta padrão do Next.js
EXPOSE 3000

# Comando para iniciar o servidor Next.js usando standalone
CMD ["node", "server.js"]
