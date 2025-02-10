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

# Caso o build precise das variáveis de ambiente, copie o arquivo apropriado aqui
# Utilize o build argument para selecionar qual arquivo usar (padrão: .env)
ARG ENV_FILE=.env
COPY ${ENV_FILE} .env

# Gere o cliente Prisma
RUN npx prisma generate

# Copie todo o código do projeto para o container
COPY . ./

# Compile o projeto para produção (aqui o .env já estará presente se necessário)
RUN npm run build

# -------------------------
# Imagem para produção
FROM node:18-alpine

# Defina o diretório de trabalho no container
WORKDIR /app

# Copie as dependências instaladas e a build do estágio anterior
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public

# Se necessário, copie o .env do estágio de build (pode ser redundante se já foi utilizado no build)
# Aqui podemos também fazer o log do argumento, se quiser:
ARG ENV_FILE=.env
RUN echo "Dockerfile build argument ENV_FILE: ${ENV_FILE}"
COPY --from=builder /app/.env .env

# Configure a variável de ambiente para produção
ENV NODE_ENV=production

# Exponha a porta padrão do Next.js
EXPOSE 3000

# Comando para iniciar o servidor Next.js
CMD ["npm", "start"]
