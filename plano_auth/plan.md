Perfeito — vou escolher um conjunto **sólido e simples de manter** para um app Next.js (App Router), com ótima segurança e DX:

> **Stack escolhido**: **Auth.js (NextAuth) + sessão em cookie httpOnly armazenada no banco via Prisma**
> Hash de senha com **Argon2id**, validação com **Zod**, proteção via **middleware**.
> (Depois você pode adicionar OAuth e 2FA/Passkeys.)

Abaixo, o passo-a-passo direto ao ponto.

---

# 0) Pacotes

```bash
# Auth + Prisma
npm i next-auth @auth/prisma-adapter
npm i -D prisma
npm i @prisma/client

# Segurança & utilidades
npm i argon2 zod
```

Crie o Prisma:

```bash
npx prisma init
```

---

# 1) Schema do Prisma (Banco)

No `prisma/schema.prisma` (Postgres como exemplo):

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(cuid())
  name          String?
  email         String?  @unique
  emailVerified DateTime?
  image         String?
  // Campo para credenciais próprias
  passwordHash  String?

  accounts      Account[]
  sessions      Session[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

Depois:

```bash
npx prisma migrate dev -n "auth_base"
```

---

# 2) Variáveis de ambiente

No `.env`:

```
DATABASE_URL="postgresql://user:pass@host:5432/db"
AUTH_SECRET="chave-aleatoria-bem-longa"   # use: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"      # ajuste em prod
```

> **Dica:** em produção, cookies precisam de `Secure` (HTTPS).

---

# 3) Config do Auth.js (App Router)

Estrutura sugerida:

```
/src
  /app
    /api
      /auth
        [...nextauth]
          /route.ts
  /lib
    auth.ts
    prisma.ts
```

`src/lib/prisma.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

`src/lib/auth.ts` (config do NextAuth com sessão em DB + Credentials):

```ts
import NextAuth, { type NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import argon2 from "argon2";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authConfig = {
  // Adapter ativa sessões em banco automaticamente
  adapter: PrismaAdapter(prisma),
  session: {
    // Session em cookie httpOnly + persistida no DB
    strategy: "database",
  },
  // Cookies seguros (NextAuth já seta httpOnly/SameSite)
  // Customize se precisar domínios/subdomínios.
  providers: [
    Credentials({
      name: "Email & Senha",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user || !user.passwordHash) return null;

        const ok = await argon2.verify(user.passwordHash, password);
        if (!ok) return null;

        // Retorne o objeto user mínimo (id obrigatório)
        return {
          id: user.id,
          name: user.name ?? null,
          email: user.email ?? null,
        };
      },
    }),
    // Adicione OAuth (Google, GitHub etc.) quando quiser:
    // Google({ clientId: "", clientSecret: "" }),
  ],
  // Opcional: callbacks para injetar dados no `session.user`
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id; // útil no client
      }
      return session;
    },
  },
  // Boas práticas: defina corretamente a url/base no .env (NEXTAUTH_URL)
  // e AUTH_SECRET para assinatura/criptografia interna.
} satisfies NextAuthConfig;

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
```

`src/app/api/auth/[...nextauth]/route.ts`:

```ts
export { handlers as GET, handlers as POST } from "@/lib/auth";
```

---

# 4) Cadastro seguro (route handler)

Crie um endpoint para registrar usuário com Argon2id:

`src/app/api/register/route.ts`:

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import argon2 from "argon2";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  const { name, email, password } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "Email já registrado" }, { status: 409 });
  }

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    // Pode ajustar memoryCost, timeCost, parallelism conforme infra
  });

  await prisma.user.create({
    data: { name, email, passwordHash },
  });

  return NextResponse.json({ ok: true });
}
```

> Depois do cadastro, você pode redirecionar o usuário para a página de login e usar `signIn("credentials", { email, password })` se quiser **login automático** após registrar.

---

# 5) Login/Logout no cliente (App Router)

Exemplo simples de formulário de login em uma Server Action (sem expor credenciais ao JS do cliente):

`src/app/(auth)/login/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false, // controle manual
    });
    setLoading(false);
    if (res?.error) setErr("Credenciais inválidas");
    else window.location.href = "/dashboard"; // ou use router.push
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-sm space-y-3">
      <h1 className="text-xl font-semibold">Entrar</h1>
      <input
        className="w-full border p-2"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full border p-2"
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {err && <p className="text-red-600">{err}</p>}
      <button disabled={loading} className="bg-black px-4 py-2 text-white">
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
```

Para **logout** em qualquer componente cliente:

```ts
import { signOut } from "next-auth/react";
// ...
await signOut({ callbackUrl: "/" });
```

---

# 6) Proteção de rotas (middleware)

Crie `src/middleware.ts`:

```ts
export { auth as middleware } from "next-auth/middleware";

// Defina quais rotas exigem auth:
export const config = {
  matcher: [
    "/dashboard/:path*", // exemplo de área autenticada
    "/api/private/:path*", // APIs privadas
  ],
};
```

> O middleware vai ler o cookie de sessão httpOnly e bloquear quem não estiver autenticado (302 para a página de login padrão do NextAuth ou sua própria).

---

# 7) Acessando o usuário no servidor (RSC/API)

Em um **Server Component** ou **Route Handler**, use `auth()`:

```ts
// exemplo em server component
import { auth } from "@/lib/auth";

export default async function Dashboard() {
  const session = await auth(); // lê cookie no servidor
  // se usar middleware, aqui já vem autenticado
  const userId = (session?.user as any)?.id;
  return <div>Olá, {session?.user?.name ?? "usuário"}!</div>;
}
```

---

# 8) Recuperação de senha (reset) — esqueleto

Fluxo seguro clássico:

1. POST `/api/auth/forgot` → gera **token de uso único** (VerificationToken) com expiração curta (ex.: 30 min) e envia e-mail com link.
2. GET `/reset?token=...` → mostra formulário.
3. POST `/api/auth/reset` → valida token, seta nova senha (Argon2id), invalida sessões antigas.

> Você já tem a tabela `VerificationToken`; use-a para esse fluxo. Se quiser, integro com seu provedor de e-mail depois (ex.: Resend).

---

# 9) Config de cookies, CSRF e cabeçalhos

- **Cookies**: NextAuth já define **httpOnly + SameSite=Lax + Secure (em HTTPS)**.
- **CSRF**: NextAuth aplica proteções nos endpoints de auth; em formulários personalizados cross-site, inclua token CSRF (há helpers em NextAuth).
- **Headers**: use algo como `next-safe` (ou configure manualmente) para `Content-Security-Policy`, `X-Frame-Options`, `Referrer-Policy` etc.

---

# 10) Rate limiting e lockout (recomendado)

Adicione um limitador no `/api/auth/*` (por IP + por email). Você pode:

- Persistir contagem em Redis (Upstash/Valkey) ou no próprio DB.
- Bloquear por alguns minutos após N falhas.

_(Posso te dar um snippet pronto quando disser qual store prefere.)_

---

# 11) Extensões fáceis depois

- **OAuth**: adicione Google/GitHub em `providers: []` e campos no `.env`.
- **Passkeys (WebAuthn)**: dá pra integrar (via rota própria usando **simplewebauthn** ou libs específicas; mantém a sessão em cookie).
- **2FA/TOTP**: tabela de `UserMfa` com segredo e verificação por código.
- **RBAC**: crie `Role`, `UserRole` e use `callbacks.session` para expor no `session.user`.

---

## TL;DR

- **Agora**: Auth.js + Prisma (sessão em DB), Credentials provider (email/senha), cookies httpOnly, middleware de proteção.
- **Segurança**: Argon2id, rate limit, reset de senha com token, headers de segurança.
- **Evolução**: OAuth e Passkeys quando quiser, sem trocar de arquitetura.

Se quiser, eu já te **gero os arquivos completos** (copiáveis) pro seu projeto (App Router), incluindo um reset de senha básico e um limiter simples em Redis.
