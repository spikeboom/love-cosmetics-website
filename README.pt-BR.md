# Love Cosmetics

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)](https://www.prisma.io/)

[English](./README.md)

Plataforma de e-commerce para cosméticos e produtos de beleza, construída com Next.js 15, React 19 e tecnologias web modernas.

## Funcionalidades

- **Catálogo de Produtos** - Navegue por produtos com filtros dinâmicos por categoria
- **Carrinho de Compras** - Adicione produtos, aplique cupons e gerencie quantidades
- **Fluxo de Checkout** - Checkout em etapas: identificação, entrega e pagamento
- **Autenticação de Usuários** - Cadastro, login e recuperação de senha
- **Painel do Cliente** - Gerencie dados, endereços, pedidos e configurações de segurança
- **Integração de Pagamento** - PagBank com suporte a PIX e cartão de crédito
- **Painel Administrativo** - Gerenciamento de pedidos e geração de notas fiscais
- **Cálculo de Frete** - Integração com API Frenet para cotações de frete
- **Integração ERP** - API Bling para emissão de NF-e

## Stack Tecnológica

- **Framework**: Next.js 15 com App Router e Turbopack
- **Linguagem**: TypeScript 5
- **Estilização**: Tailwind CSS 3.4 + Material UI 6
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Autenticação**: JWT com biblioteca jose
- **Formulários**: React Hook Form + validação Zod
- **Testes**: Playwright para testes E2E
- **Gerenciamento de Estado**: React Context + Cookies

## Início Rápido

### Pré-requisitos

- Node.js 18+
- Banco de dados PostgreSQL
- npm, yarn, pnpm ou bun

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/spikeboom/love-cosmetics-website.git
cd love-cosmetics-website
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Configure as seguintes variáveis:
- `DATABASE_URL` - String de conexão PostgreSQL
- `JWT_SECRET` - Segredo para tokens JWT
- `PAGBANK_TOKEN` - Credenciais da API PagBank
- `BLING_CLIENT_ID` / `BLING_CLIENT_SECRET` - Credenciais do ERP Bling
- `FRENET_TOKEN` - Token da API Frenet para frete

4. Execute as migrações do banco:
```bash
npx prisma migrate dev
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) para visualizar a aplicação.

## Estrutura do Projeto

```
src/
├── app/                    # Páginas do Next.js App Router
│   ├── (admin)/           # Rotas do painel administrativo
│   ├── (global)/          # Rotas principais da loja
│   │   ├── (cliente-logado)/  # Área do cliente autenticado
│   │   ├── (loja)/        # Páginas da loja (login, cadastro)
│   │   └── (main)/        # Páginas principais (home, checkout, PDP)
│   └── api/               # Rotas de API
│       ├── cliente/       # Autenticação e dados do cliente
│       ├── pagbank/       # Processamento de pagamentos
│       ├── pedido/        # Gerenciamento de pedidos
│       └── bling/         # Integração ERP
├── components/            # Componentes React reutilizáveis
├── contexts/              # Providers de React Context
├── hooks/                 # Hooks React customizados
├── lib/                   # Bibliotecas utilitárias
├── services/              # Serviços de APIs externas
└── types/                 # Definições de tipos TypeScript
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento com Turbopack |
| `npm run build` | Build para produção |
| `npm run start` | Inicia servidor de produção |
| `npm run lint` | Executa ESLint |
| `npm run test` | Executa testes Playwright |
| `npm run test:headed` | Executa testes com interface do navegador |
| `npm run test:ui` | Abre interface de testes do Playwright |

## Rotas da API

### Autenticação
- `POST /api/cliente/auth/cadastrar` - Cadastrar novo cliente
- `POST /api/cliente/auth/entrar` - Login do cliente
- `POST /api/cliente/auth/sair` - Logout
- `POST /api/cliente/auth/recuperar-senha` - Recuperação de senha

### Pedidos
- `POST /api/pedido` - Criar novo pedido
- `GET /api/pedido/admin` - Listar pedidos (admin)
- `POST /api/pedidos/[id]/gerar-nota` - Gerar nota fiscal

### Pagamentos
- `POST /api/pagbank/create-order` - Criar pagamento PagBank
- `POST /api/pagbank/webhook` - Notificações de pagamento

## Licença

Privado - Todos os direitos reservados.
