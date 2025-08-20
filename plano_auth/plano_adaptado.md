# Plano de Autenticação para Clientes - Love Cosmetics

## 📋 Contexto Real do Projeto

### Sistema Atual:
- **Login admin**: Página `/login` protege apenas `/pedidos` (área administrativa)
- **Credenciais fixas**: admin/123love para gestão interna
- **E-commerce público**: Clientes compram sem cadastro
- **Checkout guest**: Formulário coleta dados a cada compra

### Necessidade Real:
- **Sistema de contas para clientes** do e-commerce
- **Manter área admin** separada e simples como está
- **Benefícios para clientes**: Histórico, dados salvos, programa de fidelidade

## 🎯 Estratégia: Dois Sistemas Separados

### 1. Admin (manter como está)
- `/login` → `/pedidos` 
- Continua com admin/123love
- Não mexer agora (funciona bem)

### 2. Cliente (novo sistema)
- `/conta/login` → área do cliente
- Cadastro de clientes
- Integração com checkout

## 🏗️ Arquitetura Proposta

```
AUTENTICAÇÃO
├── Admin (existente)
│   ├── /login
│   ├── /api/login
│   └── middleware protege /pedidos
│
└── Cliente (novo)
    ├── /conta/entrar
    ├── /conta/cadastrar
    ├── /conta/minha-conta
    ├── /api/cliente/auth/*
    └── middleware protege /conta/*
```

## 📦 Fase 1: Estrutura Base para Clientes
**Tempo: 3-4 horas**

### 1.1 Schema do Banco
```prisma
// Adicionar ao schema.prisma:

model Cliente {
  id              String    @id @default(uuid())
  email           String    @unique
  nome            String
  sobrenome       String
  cpf             String?   @unique
  telefone        String?
  passwordHash    String
  
  // Dados salvos do checkout
  cep             String?
  endereco        String?
  numero          String?
  complemento     String?
  bairro          String?
  cidade          String?
  estado          String?
  
  // Preferências
  receberWhatsapp Boolean   @default(false)
  receberEmail    Boolean   @default(true)
  
  // Relacionamentos
  pedidos         PedidoCliente[]
  sessoes         SessaoCliente[]
  cuponsUsados    CupomUsado[]
  
  // Controle
  emailVerificado Boolean   @default(false)
  ativo           Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model SessaoCliente {
  id           String    @id @default(uuid())
  token        String    @unique
  clienteId    String
  cliente      Cliente   @relation(fields: [clienteId], references: [id], onDelete: Cascade)
  expiresAt    DateTime
  createdAt    DateTime  @default(now())
  
  @@index([token])
  @@index([clienteId])
}

model PedidoCliente {
  id           String    @id @default(uuid())
  pedidoId     String    @unique
  clienteId    String
  cliente      Cliente   @relation(fields: [clienteId], references: [id])
  pedido       Pedido    @relation(fields: [pedidoId], references: [id])
  createdAt    DateTime  @default(now())
}

model CupomUsado {
  id           String    @id @default(uuid())
  clienteId    String
  cliente      Cliente   @relation(fields: [clienteId], references: [id])
  cupom        String
  valorDesconto Float
  usadoEm      DateTime  @default(now())
}

// Atualizar modelo Pedido para ter relação opcional
// Adicionar: pedidoCliente PedidoCliente?
```

### 1.2 Dependências Necessárias
```bash
# Só o que ainda não tem
npm i jsonwebtoken argon2
npm i -D @types/jsonwebtoken
```

### 1.3 Estrutura de Pastas
```
src/
  lib/
    cliente/
      auth.ts         # Funções de autenticação cliente
      session.ts      # Gerenciamento de sessão
      validation.ts   # Schemas Zod específicos
    
  app/
    api/
      cliente/
        auth/
          cadastrar/route.ts
          entrar/route.ts
          sair/route.ts
          verificar/route.ts
          recuperar-senha/route.ts
        conta/
          dados/route.ts
          pedidos/route.ts
          enderecos/route.ts
    
    (loja)/           # Grupo para páginas da loja
      conta/
        entrar/page.tsx
        cadastrar/page.tsx
        esqueci-senha/page.tsx
        
    (cliente-logado)/ # Grupo protegido
      minha-conta/
        page.tsx
        pedidos/page.tsx
        enderecos/page.tsx
        cupons/page.tsx
```

## 📦 Fase 2: Implementação Core
**Tempo: 4-5 horas**

### 2.1 Utilitários de Autenticação
```typescript
// src/lib/cliente/auth.ts
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function hashPassword(password: string) {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}

export async function createSession(clienteId: string) {
  const token = jwt.sign(
    { clienteId, type: 'cliente' },
    process.env.JWT_SECRET_CLIENTE!,
    { expiresIn: '30d' }
  );
  
  await prisma.sessaoCliente.create({
    data: {
      token,
      clienteId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  });
  
  return token;
}
```

### 2.2 API de Cadastro
```typescript
// src/app/api/cliente/auth/cadastrar/route.ts
- Validar dados com Zod
- Verificar duplicidade (email/CPF)
- Hash da senha
- Criar cliente
- Gerar sessão
- Retornar token
```

### 2.3 API de Login
```typescript
// src/app/api/cliente/auth/entrar/route.ts
- Validar credenciais
- Verificar senha
- Gerar nova sessão
- Retornar dados do cliente + token
```

### 2.4 Middleware para Clientes
```typescript
// src/middleware.ts (atualizar o existente)
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  // ADMIN - manter como está
  const adminPaths = ["/pedidos", "/api/pedidos"];
  const isAdmin = adminPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );
  
  if (isAdmin) {
    const token = request.cookies.get("auth_token")?.value;
    if (!token || token !== "sktE)7381J1") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // CLIENTE - novo
  const clientePaths = ["/minha-conta", "/api/cliente/conta"];
  const isClienteArea = clientePaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );
  
  if (isClienteArea) {
    const clienteToken = request.cookies.get("cliente_token")?.value;
    if (!clienteToken) {
      return NextResponse.redirect(new URL("/conta/entrar", request.url));
    }
    // Validar token JWT aqui ou em cada rota
  }

  return NextResponse.next();
}
```

## 📦 Fase 3: Integração com Checkout
**Tempo: 3-4 horas**

### 3.1 Checkout Híbrido
```typescript
// Atualizar checkout existente:
- Detectar se cliente está logado
- Pré-preencher formulário com dados salvos
- Opção "Criar conta" durante checkout
- Vincular pedido ao cliente se logado
```

### 3.2 Benefícios para Cliente Logado
- Aplicar cupons exclusivos
- Pontos de fidelidade
- Frete grátis após X compras
- Desconto progressivo

### 3.3 Componente de Login Rápido
```typescript
// Durante checkout, mostrar:
"Já é cliente? [Entrar] para usar seus dados salvos"
"Primeira compra? [x] Criar conta para próximas compras"
```

## 📦 Fase 4: Área do Cliente
**Tempo: 4-5 horas**

### 4.1 Dashboard
- Resumo de pedidos
- Pontos/Cashback
- Cupons disponíveis
- Dados pessoais

### 4.2 Histórico de Pedidos
- Lista de pedidos
- Status de cada pedido
- Recomprar com 1 clique
- Baixar nota fiscal

### 4.3 Gestão de Dados
- Editar informações pessoais
- Múltiplos endereços
- Alterar senha
- Preferências de comunicação

## 🔐 Segurança Específica

### Separação de Contextos
```typescript
// Cookies diferentes
admin: auth_token (manter)
cliente: cliente_token (novo)

// Secrets diferentes
ADMIN_SECRET=atual
JWT_SECRET_CLIENTE=novo_secret_para_clientes

// Rotas completamente separadas
/api/login → admin
/api/cliente/auth/* → clientes
```

### Rate Limiting por Tipo
```typescript
// Admin: mais restritivo (5 tentativas)
// Cliente: mais permissivo (10 tentativas)
// Reset senha: muito restritivo (3 tentativas)
```

## 📊 Benefícios de Negócio

### Para o Cliente
- ✅ Compra mais rápida (dados salvos)
- ✅ Histórico de compras
- ✅ Programa de fidelidade
- ✅ Cupons personalizados
- ✅ Status do pedido

### Para a Loja
- ✅ Taxa de recompra maior
- ✅ Email marketing direcionado
- ✅ Análise de comportamento
- ✅ Redução de abandono de carrinho
- ✅ Upsell/Cross-sell melhor

## 🚀 Cronograma Sugerido

### Sprint 1 (1 semana)
- **Dia 1-2**: Schema + migrations + estrutura
- **Dia 3-4**: APIs de cadastro e login
- **Dia 5**: Testes e ajustes

### Sprint 2 (1 semana)
- **Dia 6-7**: Integração com checkout
- **Dia 8-9**: Área do cliente básica
- **Dia 10**: Testes de integração

### Sprint 3 (1 semana)
- **Dia 11-12**: Features avançadas
- **Dia 13-14**: Segurança e otimização
- **Dia 15**: Deploy e monitoramento

## ✅ Checklist de Implementação

### Base de Dados
- [ ] Criar modelos Cliente, SessaoCliente, etc
- [ ] Migration e seed de teste
- [ ] Índices para performance

### APIs Essenciais
- [ ] POST /api/cliente/auth/cadastrar
- [ ] POST /api/cliente/auth/entrar
- [ ] POST /api/cliente/auth/sair
- [ ] GET /api/cliente/auth/verificar

### Páginas Cliente
- [ ] /conta/entrar (login)
- [ ] /conta/cadastrar (registro)
- [ ] /minha-conta (dashboard)
- [ ] /minha-conta/pedidos

### Integração Checkout
- [ ] Detectar cliente logado
- [ ] Pré-preencher dados
- [ ] Vincular pedido ao cliente
- [ ] Opção criar conta

### Segurança
- [ ] Hash seguro de senhas
- [ ] Tokens JWT com expiração
- [ ] Rate limiting
- [ ] Validação de dados

### UX/UI
- [ ] Loading states
- [ ] Mensagens de erro claras
- [ ] Feedback de sucesso
- [ ] Responsivo mobile

## 🎯 KPIs para Medir Sucesso

- Taxa de cadastro: >30% dos compradores
- Taxa de login: >60% dos cadastrados/mês
- Recompra: +40% para clientes logados
- Tempo checkout: -50% com dados salvos
- NPS: aumento de 10 pontos

## 💡 Dicas Importantes

1. **Não misture os sistemas**: Admin e Cliente são contextos diferentes
2. **Guest checkout sempre**: Nunca force cadastro para comprar
3. **Incentive, não obrigue**: Ofereça benefícios claros para cadastro
4. **Mobile first**: Maioria acessa pelo celular
5. **Senha simples**: Não exija senhas complexas demais

---

**Resumo**: Este plano cria um sistema de autenticação para clientes do e-commerce, completamente separado do login administrativo existente, focado em melhorar a experiência de compra e aumentar a retenção de clientes.