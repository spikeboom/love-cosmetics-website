# Performance — auditoria PageSpeed e correções

Data: 2026-04-18
URL auditada: https://pagespeed.web.dev/analysis/https-www-lovecosmetics-com-br/q8mxm9kgmb?form_factor=mobile

## Ponto de partida

PageSpeed Insights mobile de `lovecosmetics.com.br`:

- Performance: **49**
- LCP: **6,0s** (meta < 2,5s)
- TBT: **1.280ms** (meta < 200ms)
- FCP 1,2s, CLS 0,001, SI 5,6s
- Accessibility 96, Best Practices 96, SEO 100

Diagnósticos principais levantados pelo Lighthouse:

- `LCP request discovery` falhou
- `Network dependency tree` ruim
- 248 KiB de JS não usado
- 24 KiB de legacy JS
- `Forced reflow`
- Cache curto em assets (178 KiB economizáveis)

## Investigação no código

Stack confirmada: Next **15** (App Router + Turbopack), React 19, Directus como CMS, home em `src/app/(figma)/(main)/figma/design/page.tsx` servida via rewrite `/ → /figma/design`.

### Causas raiz identificadas

1. PagBank SDK carregado em todo o site via `strategy="beforeInteractive"` no `src/app/layout.tsx` — só é usado em `/checkout/pagamento`.
2. Home fazia 6 `await` sequenciais (banners, instagram, depoimentos, 3× produtos) bloqueando uns aos outros.
3. Banner principal servia imagens 2880px desktop / 960px mobile direto do Directus (bypass do `next/image` optimizer), sem prop `sizes`, com `priority` em todos os slides.
4. `VitrineSection` + `InstagramCarousel` importados estaticamente → bundle do Swiper no JS inicial da home.
5. Cards do Instagram renderizavam todos os `<video preload="metadata">` de uma vez, mesmo fora do viewport do Swiper.
6. Dois containers GTM rodando em paralelo — deixado como está por decisão do produto.

## Alterações aplicadas

### Commit `cd9d846` — perf: reduzir LCP/TBT da home

**`src/app/layout.tsx`**
- Removido o `<Script>` do PagBank SDK do root layout.

**`src/app/(figma)/(checkout)/layout.tsx`**
- SDK do PagBank trocado de `strategy="beforeInteractive"` para `afterInteractive`. Agora existe apenas aqui.

**`src/app/(figma)/(main)/figma/design/page.tsx`**
- 6 awaits sequenciais → `Promise.all` único com 6 fetches paralelos.
- `VitrineSection` e `InstagramCarousel` passam a ser importados via `next/dynamic` (com `loading` placeholder de altura fixa pra evitar CLS). SSR mantido.
- Adicionadas tags `<link rel="preload" as="image" fetchPriority="high">` no JSX da home, uma pra mobile (`media="(max-width: 1023px)"`) e outra pra desktop (`media="(min-width: 1024px)"`), apontando pro primeiro banner.

**`src/lib/cms/directus/banners.ts`**
- Largura das imagens do banner reduzida: desktop 2880 → **1600**, mobile 960 → **800**. Tanto no `FALLBACK_BANNERS` quanto na função `assetUrl()` chamada a partir do Directus.

**`src/app/(figma)/(main)/figma/components/BannerPrincipal.tsx`**
- `<Image>` mobile: adicionado `sizes="100vw"`, `priority` e `fetchPriority="high"` **só no primeiro slide** (`idx === 0`).
- `<Image>` desktop: adicionado `sizes="(min-width: 1440px) 1440px, 100vw"`, mesmo tratamento de priority.

### Commit `e4b0aaf` — perf: lazy-load dos vídeos do Instagram

**`src/app/(figma)/(main)/figma/components/InstagramCarousel.tsx`**
- Estratégia "poster-first": `InstagramCard` agora renderiza só `<Image>` da thumbnail por padrão.
- `<video>` só é montado quando o usuário clica em play (state `hasActivated`). Com `autoPlay` pra iniciar na mesma ação.
- Zero request de metadata de vídeo no carregamento inicial, zero conexões HTTP paralelas quando o Swiper hidrata.

### Segunda rodada (dev, após primeiro deploy) — 2026-04-18 tarde

Novo PageSpeed: `https://pagespeed.web.dev/analysis/https-dev-lovecosmetics-com-br/gv6z5kyp7e`
- Mobile **76** (LCP 5,3s · TBT 160ms) · Desktop **93**.

**1. Fontes — `src/app/layout.tsx`**

Layout carregava 5 famílias Google (Geist, Geist Mono, Lato, Playfair, Poppins). Auditoria mostrou que só **Poppins** é usada em código ativo; as outras aparecem apenas em `deprecated/`. Removidas 4 famílias, mantida Poppins com `display: "swap"`. Menos arquivos `.woff2` render-blocking.

**2. Home antiga — `src/app/_global/(main)/home/page.tsx`**

Adicionado comentário no topo avisando que a home real agora é `src/app/(figma)/(main)/figma/page.tsx` (rewrite `/ → /figma/design`). Editado poster/preload de vídeo lá por engano antes de perceber que a rota não é mais servida — mudanças ficam mas não afetam prod.

**3. Preload do banner hero — `src/app/(figma)/(main)/figma/design/page.tsx` ← principal**

O `<link rel="preload">` já existia, mas apontava pra URL crua do Directus. Como o `<Image>` do Next faz fetch via `/_next/image?url=…&w=…&q=75`, as URLs não batiam → o preload era desperdiçado e o browser só descobria a imagem real depois da hidratação (Resource load delay = **890ms** no breakdown LCP).

Corrigido: preload agora gera `href` e `imageSrcSet` no mesmo formato do `/_next/image` que o `<Image sizes="100vw" fill />` solicita, com `imageSizes` casando (`100vw` mobile, `(min-width: 1440px) 1440px, 100vw` desktop). O browser reutiliza o recurso preloaded em vez de baixar duas vezes.

**Analogia curta:** o motoboy estava buscando pizza na Pizzaria A, mas a cozinha ia pedir da Pizzaria B → pedido desperdiçado. Agora as duas pontas apontam pra mesma URL.

### Commit `2d9d2eb` — fix: UX dos vídeos

**`src/app/(figma)/(main)/figma/components/InstagramCarousel.tsx`**
- Botão play esconde imediatamente quando o usuário aperta (estado `isPlaying` setado como `true` na hora, sem esperar o evento `onPlay`).
- `hover:opacity-100` movido pra `lg:hover:` — no mobile, sem hover, o botão fica realmente invisível enquanto o vídeo roda.
- `pointer-events-none` no `<video>` e no `<Image>` da thumbnail → os eventos de touch/mouse caem todos no `<button>` overlay, permitindo que o Swiper detecte arrasto e faça drag do carrossel mesmo com o dedo/mouse começando em cima da mídia.

## Ganhos estimados (lab)

- LCP mobile: 6s → 2,5–3,5s
- TBT: 1.280ms → 400–600ms
- Performance score: 49 → 75–85

Field data no PageSpeed só muda com 28 dias de CrUX, mas os valores do lab mudam imediatamente após deploy.

## Pendências (fora do escopo executado)

- **Consolidar os 2 GTMs** em um — descartado por decisão de produto.
- **`@next/bundle-analyzer`** pra confirmar que MUI/recharts/xlsx não vazam pro bundle client.
- **`async headers()`** no `next.config.ts` (ou rota proxy) pra controlar `Cache-Control` dos assets do Directus — resolve os 178 KiB de economia de cache apontados pelo Lighthouse.
- **Revisar `browserslist`** pra eliminar os 24 KiB de polyfills legacy.
- **Contraste insuficiente** (accessibility) — localizar o elemento e corrigir.
- **Console errors em produção** (best practices 96) — revisar o que o `MyLogFrontError` captura.
- **Infra de vídeo**: se os MP4 do Directus forem grandes (10–15MB), a reprodução ainda vai ser pesada. Caminhos: transcoding na ingestão (ffmpeg) ou CDN de vídeo (Cloudflare Stream, Mux, Bunny).

## Commits

```
2d9d2eb fix: esconder botão play durante reprodução e permitir drag do carrossel
e4b0aaf perf: carregar vídeos do Instagram apenas após clique
cd9d846 perf: reduzir LCP/TBT da home conforme PageSpeed
```

Branch `master`, não feito push.
