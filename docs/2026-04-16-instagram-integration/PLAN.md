# Instagram Integration — Admin Upload + Auto-Refresh Token

## Contexto

Usuário quer adicionar uma aba `/pedidos?tab=instagram` no admin do site Love Cosmetics que:
1. Recebe uma URL do Instagram (ex: `https://www.instagram.com/p/DQm3SlZjlU1/` ou `/reel/DUYeofNDlqT/`)
2. Baixa o vídeo (se for reel) e a thumbnail
3. Faz upload pro Directus (collection `instagram_posts` — já existe)

Collection `instagram_posts` já tem campos: `status`, `sort`, `tipo` (post/reel), `instagram_url`, `video`, `thumbnail`, `descricao`.
Arquivos existentes (não commitados):
- `src/lib/cms/directus/instagram.ts` — client que lê posts do Directus
- `src/app/(figma)/(main)/figma/components/InstagramCarousel.tsx` — componente que consome
- `scripts/upload-instagram-to-directus.mjs` — script CLI que já faz download+upload (lê JSON pré-gerado)

## Descoberta crítica (16/04/2026)

Testei oEmbed do Instagram — **não serve**. Retorna só iframe HTML, não URL de vídeo.

Resolvemos usando **Instagram Graph API com Business Login** (oficial, legítimo, long-lived).

## Credenciais obtidas

Gerou token via Meta Developers → App "LoveCosmetics" (ID `1233264828780751`). Todos os pré-requisitos já estão em ordem:

- Business Manager "Lové cosmeticos" (ID `757670189118304`) ✅
- Conta IG `@cosmeticoslove_` (IG ID `17841457953590747`, User ID Graph: `24875871458777346`) pertencente ao Business ✅
- Adicionada como "Testador do Instagram" no app ✅ (aceita em `accounts/manage_access/`)
- Permissões concedidas: `instagram_business_basic`, `instagram_business_content_publish`, `instagram_business_manage_insights`, `instagram_business_manage_comments`, `instagram_business_manage_messages`

**App credentials:**
- Instagram App ID: `925711730110124`
- Instagram App Secret: `66d13fecf214c478ccd7796f82923cbc`

**Token ATIVO (long-lived, ~60 dias):**
```
IGAANJ7g7WbqxBZAFl0RUFIanpVY1VDcl94SGlaZA3kzZAUNGVks5OUM5N2R5eGg5Ti1CcU9JNm1MLTFtWDRRV09QelFVTWl3VGZAVc25aYUFwT0hTWnNYMGRUa2N0aTlDZAnJvUjlka0xtSEc2ZAnhVaHVqYVNn
```

Renovado em **2026-04-16** via `GET https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token={TOKEN}` — expira **~2026-06-15**.

**IMPORTANTE**: Esse fluxo de `ig_refresh_token` NÃO precisa de app secret, só do token atual. Pode ser chamado até os 60 dias, retorna novo token de 60 dias. Ideal pra auto-refresh.

Testes feitos com sucesso:
- `GET /me?fields=id,username,account_type` → `BUSINESS` ✅
- `GET /me/media?fields=id,media_type,media_url,permalink,thumbnail_url,caption&limit=3` → retorna MP4 direto do CDN do Instagram, thumbnail, permalink, caption ✅

## Tarefas a executar

### 1. Salvar credenciais em `.env` (gitignored, já verificado)

Adicionar ao final de `C:\Users\Administrator\Documents\Love Drive\NextLove\love-cosmetics-website\.env`:

```
# Instagram Graph API (Business Login)
INSTAGRAM_ACCESS_TOKEN=IGAANJ7g7WbqxBZAFl0RUFIanpVY1VDcl94SGlaZA3kzZAUNGVks5OUM5N2R5eGg5Ti1CcU9JNm1MLTFtWDRRV09QelFVTWl3VGZAVc25aYUFwT0hTWnNYMGRUa2N0aTlDZAnJvUjlka0xtSEc2ZAnhVaHVqYVNn
INSTAGRAM_USER_ID=17841457953590747
INSTAGRAM_APP_ID=925711730110124
INSTAGRAM_APP_SECRET=66d13fecf214c478ccd7796f82923cbc
INSTAGRAM_TOKEN_ISSUED_AT=2026-04-16
```

Repetir pros outros arquivos de env (`.env.dev`, `.env.master`) só se for necessário rodar em dev também — perguntar ao usuário.

### 2. Criar `src/lib/instagram/graph-api.ts`

Client wrapper pro Graph API do Instagram:

```ts
const BASE = "https://graph.instagram.com";

export interface InstagramMediaItem {
  id: string;
  media_type: "VIDEO" | "IMAGE" | "CAROUSEL_ALBUM";
  media_url: string;        // MP4 pra VIDEO, JPG pra IMAGE
  permalink: string;         // instagram.com/p/XXX ou /reel/XXX
  thumbnail_url?: string;    // só pra VIDEO
  caption?: string;
  timestamp?: string;
}

// Procura a media pela URL (shortcode) via /me/media paginado
export async function findMediaByUrl(instagramUrl: string): Promise<InstagramMediaItem | null>

// Lista últimos N medias
export async function listMyMedia(limit = 25): Promise<InstagramMediaItem[]>

// Renova o token (idempotente até 60 dias)
export async function refreshToken(): Promise<{ token: string; expiresIn: number }>
```

**Importante**: a Graph API do Instagram não tem endpoint "get media by URL" — só dá pra buscar listando `/me/media` e filtrando pelo `permalink`. Mas `/me/media` retorna TODOS os posts, então listar 25 mais recentes e buscar por match do shortcode resolve 99% dos casos. Pra posts antigos, paginação com `after` cursor.

Alternativa: extrair o shortcode da URL (`/p/DQm3SlZjlU1/` → `DQm3SlZjlU1`) e comparar com `permalink` de cada item.

### 3. Criar `src/app/api/admin/instagram/import/route.ts`

POST endpoint que recebe `{ instagramUrl }`, chama `findMediaByUrl`, baixa vídeo+thumb com fetch direto (sem headers especiais — URLs do CDN do Instagram vêm assinadas), faz upload pro Directus via `POST /files` + cria item na collection `instagram_posts`.

**Auth**: verificar se o admin está autenticado. Checar como o admin atual do `/pedidos` autentica (provavelmente cookie/session). Se for rota admin-only, adicionar o mesmo check.

**Reutilizar lógica** do `scripts/upload-instagram-to-directus.mjs` — a parte de `uploadToDirectus` e `createItem` está certa, só trocar a fonte dos dados (JSON → Graph API).

Response:
```json
{ "success": true, "itemId": 42, "thumbId": "uuid", "videoId": "uuid" }
```

### 4. Criar aba `/pedidos?tab=instagram` no admin

Descobrir primeiro como o `/pedidos` já lida com tabs. Já é dito que tem outras tabs (dashboard/funil). Procurar em `src/app/(main)/pedidos/` ou similar. Sem abrir arquivos antes, o padrão Next 14 é `searchParams.tab` + conditional render.

Adicionar tab "Instagram" que contém:
- Input textarea pra colar URL(s) do Instagram (uma por linha, permite batch)
- Botão "Importar"
- Lista de posts já no Directus com thumb preview + botão "Remover"
- Status live do upload (pending / downloading / uploading / done / error)

Pode reaproveitar padrões de UI do resto do admin. **Não inventar design** — espelhar o que já existe nas outras tabs.

### 5. Auto-refresh do token

**Opção A (recomendada): Next.js cron via Vercel Cron Jobs**
Adicionar em `vercel.json`:
```json
{
  "crons": [
    { "path": "/api/cron/instagram-refresh-token", "schedule": "0 3 * * 1" }
  ]
}
```
(Segunda às 3h UTC — a cada semana. Token dura 60 dias, margem gigante.)

Criar `src/app/api/cron/instagram-refresh-token/route.ts`:
- Chama `GET /refresh_access_token`
- Atualiza variável de ambiente na Vercel via **Vercel API** (PATCH em `/v10/projects/{id}/env/{envId}`)
- Precisa de `VERCEL_TOKEN` com scope no projeto

**Opção B: Salvar em arquivo/DB em vez de env var**
Guardar o token + `issuedAt` no Directus (collection `secrets` ou similar), ou em KV store se existir. Mais flexível — refresh sem deploy.

Discutir com usuário qual opção. Opção B é mais limpa mas adiciona storage.

**Enquanto não automatiza**: o token atual expira em ~60 dias (meados de junho/2026). Basta chamar `refresh_access_token` antes disso. Pode ser manualmente via endpoint de admin.

### 6. Testes manuais

Depois de criar tudo:
1. Dev server up
2. Logar no admin
3. Ir em `/pedidos?tab=instagram`
4. Colar `https://www.instagram.com/p/DQm3SlZjlU1/` (posts existentes conhecidos) e `https://www.instagram.com/reel/DUYeofNDlqT/`
5. Verificar que:
   - Vídeo e thumb aparecem no Directus
   - Item criado em `instagram_posts` com `status=published`, `sort` incrementado, `tipo` correto
   - `InstagramCarousel.tsx` (frontend) renderiza o novo post

## Coisas a NÃO esquecer

- `.env` já tá em `.gitignore` (verificado). Não commitar credenciais.
- O CDN do Instagram retorna MP4 com URL assinada (contém `_nc_*`, `oh=...`, `oe=...`). Essas URLs **expiram** em horas. Por isso é essencial baixar+subir pro Directus imediatamente, não salvar a URL.
- `thumbnail_url` só existe pra VIDEO. Pra IMAGE use `media_url` como thumb.
- Pra CAROUSEL_ALBUM: `media_url` é da primeira imagem. Se o usuário quiser capa de carrossel, basta usar isso. Se quiser todos os itens, teria que chamar `GET /{id}/children`.
- Shortcode extraction: regex `/\/(p|reel)\/([A-Za-z0-9_-]+)/` — usar group 2.

## Memory sugerida (salvar com auto-memory)

- **project**: Admin do Love Cosmetics tem tabs em `/pedidos` (dashboard, funil, etc.). Tab `instagram` adicionada em abril/2026 pra importar posts do Instagram para o Directus via Graph API.
- **reference**: Instagram Graph API — endpoint `graph.instagram.com/me/media` lista mídias. `refresh_access_token` renova long-lived de 60 dias sem app secret. App "LoveCosmetics" no Meta Developers: `1233264828780751`.
