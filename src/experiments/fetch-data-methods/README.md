# Experimento: Métodos de Fetch de Dados

Este experimento demonstra 10 diferentes métodos de buscar dados em Next.js, incluindo casos de erro comuns.

## Estrutura

```
src/experiments/fetch-data-methods/
├── actions/                 # Server Actions
│   ├── client-prisma-error.ts      # Demonstração de erro (Prisma no cliente)
│   └── get-customer-emails.ts      # Server Actions públicas e protegidas
│
└── components/              # Componentes React
    ├── ClientActionPrismaError.tsx     # Demo de erro: Client Action + Prisma
    ├── ClientFormEmails.tsx            # Form → Server Action pública
    ├── ClientFormEmailsProtected.tsx   # Form → Server Action protegida
    ├── ClientPrismaError.tsx           # Demo de erro: Prisma direto no cliente
    ├── ServerComponentEmails.tsx       # Server Component público
    └── ServerComponentEmailsProtected.tsx  # Server Component protegido

src/app/
├── api/experiments/fetch-data/    # Rotas API
│   ├── emails-protected/         # Rota protegida
│   └── emails-public/            # Rota pública
│
└── experiments/fetch-data/       # Páginas
    └── customer-emails/          # Página principal do experimento
        ├── page.tsx              # Client Component principal
        ├── server-component/     # Server Component puro
        └── server-component-protected/  # Server Component protegido
```

## Métodos Demonstrados

### ✅ Métodos que Funcionam

1. **Client → API Route Pública**: Client Component fazendo fetch para API route
2. **Client → API Route Protegida**: Client Component com autenticação
3. **Client → Server Action**: Client Component chamando Server Action
4. **Client → Server Action Protegida**: Com verificação de autenticação
5. **Server Component**: Fetch direto no servidor (async/await)
6. **Server Component Protegido**: Com autenticação no servidor
7. **Client Form → Server Action**: Formulário com Server Action
8. **Client Form → Server Action Protegida**: Form com auth

### ❌ Métodos que Geram Erro (Demonstrativos)

9. **Client + Prisma Direto**: Tentativa de usar Prisma no cliente
10. **Client Action + Prisma**: Função cliente tentando usar Prisma

## Como Acessar

Navegue para: `/experiments/fetch-data/customer-emails`

## Objetivo

Este experimento ajuda a entender:
- Diferentes formas de buscar dados em Next.js
- Quando usar cada método
- Erros comuns a evitar
- Diferenças entre Server e Client Components
- Como funciona autenticação em diferentes contextos