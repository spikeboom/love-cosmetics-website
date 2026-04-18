# Performance — auditoria PageSpeed PDP `/product/espuma-facial`

Data: 2026-04-18 (segunda rodada, após otimizações da home)
URL auditada: https://pagespeed.web.dev/analysis/https-dev-lovecosmetics-com-br-product-espuma-facial/jtg73bifmu?form_factor=mobile

## Ponto de partida

PageSpeed Insights mobile:

- Performance: **62**
- FCP 0,3s · LCP **2,0s** · TBT **20ms** · CLS **0** · SI 1,7s

Ou seja: as três Core Web Vitals já passam. O score está travado pelas
auditorias "Unscored" (LCP discovery, Network dependency tree, Forced reflow)
que contam pra nota mesmo sem número, e por diagnósticos de oportunidade.

## Investigação

Extração via `window.__LIGHTHOUSE_MOBILE_JSON__` na página do PSI.

**Bootup time — top ofensores**

| Recurso | Total | Scripting |
|---|---|---|
| `chunks/3636-*.js` | 617ms | 525ms |
| `gtm.lovecosmetics.com.br/gtm.js` | 224ms | 155ms |
| `clarity.ms/clarity.js` | 148ms | 119ms |
| `webpack-*.js` | 143ms | 136ms |
| `googletagmanager.com/gtm.js` | 94ms | 35ms |

**Unused JavaScript — 129 KiB economizáveis**

| Origem | Transfer | Wasted | % |
|---|---|---|---|
| `googletagmanager.com/gtm.js` | 117 KB | 69 KB | 59% |
| `gtm.lovecosmetics.com.br/gtm.js` | 133 KB | 63 KB | 48% |

**Long tasks na thread principal — 8 encontradas**
GTM 119ms, webpack 98ms, chunk 3636 95ms, GTM 93ms, Clarity 91ms, chunk 7162 84ms.

**Main thread work**
Script Evaluation 1358ms, Other 537ms, Style & Layout 333ms, Parsing 254ms, Rendering 164ms.

### Causas raiz identificadas no código

1. `src/app/(figma)/(main)/figma/product/[slug]/page.tsx` fazia **4 awaits
   sequenciais** (produto → vitrine → depoimentos → instagram). Mesmo
   anti-pattern da home, corrigido em `cd9d846`.
2. `ProductPageClient.tsx` importava estaticamente `YouMayLikeSection`,
   `InstagramCarousel` e `CertificadosSection` → bundle Swiper entrava no
   JS inicial da PDP.
3. `ProductGallery.tsx` usava `<img>` nativo nas thumbnails do desktop, com
   URLs cruas do Strapi (bypass do `next/image`). Pagina por isso ~48 KiB
   em "Improve image delivery".
4. Sem `<link rel="preload">` casando com a URL `/_next/image?...` do
   primeiro slide da galeria → "LCP request discovery" marcado como falha,
   mesmo com LCP já OK em 2,0s.
5. Dois GTMs rodando em paralelo — 249 KB combinados, ~130 KB unused.
   Mantido como está por decisão de produto (mesma da home).

## Alterações aplicadas

### `src/app/(figma)/(main)/figma/product/[slug]/page.tsx`
- 4 awaits sequenciais → um `Promise.all` com os 4 fetches paralelos.
- Adicionado `<link rel="preload" as="image" imageSrcSet>` server-side, com
  URL `/_next/image?...` e `srcset` nos mesmos breakpoints que o
  `<Image>` da galeria mobile (`sizes="100vw"`). Formato idêntico ao da
  home (`cd9d846` + fix do "Resource load delay").
- Preload usa `media="(max-width: 767px)"` — só carrega no mobile, não
  compete com a imagem desktop (que é zoom, não é o LCP desktop).

### `src/app/(figma)/(main)/figma/product/[slug]/ProductPageClient.tsx`
- `YouMayLikeSection`, `InstagramCarousel` e `CertificadosSection` agora
  importados via `next/dynamic` com SSR mantido (sem `ssr: false`), cada
  um com placeholder de altura fixa (480px, 360px, 200px) pra evitar CLS.

### `src/app/(figma)/(main)/figma/product/[slug]/components/ProductGallery.tsx`
- Thumbnails desktop: `<img>` nativo → `next/image` com `width={94}`,
  `height={94}`, `sizes="94px"`, `quality={80}`. Garante formato moderno
  (AVIF/WebP) e resizing correto no pipeline do Next.

## Ganhos estimados (lab)

- Performance score: 62 → **85-95** (os dois GTMs continuam puxando)
- LCP mobile: 2,0s → **1,2-1,5s** (preload casa com a URL real)
- TBT: mantém ~20ms (já estava ótimo)
- Unused JS via dynamic import: reduz bundle inicial da PDP em ~40-60 KB
  (Swiper do Instagram não entra mais)

## Pendências (fora do escopo executado)

- **Consolidar os 2 GTMs** — continua descartado por produto. Esse é o
  maior ofensor remanescente (~130 KB unused, 212ms blocking combinado).
- **Microsoft Clarity** — 148ms bootup. Considerar carregamento lazy
  após `load` ou remover se o uso for baixo.
- **Chunk `3636-*.js`** — 525ms de scripting. Rodar
  `@next/bundle-analyzer` pra ver o que está dentro (provavelmente MUI
  Snackbar + AuthContext + utilidades do carrinho importadas no layout).
- **Cache lifetimes** (12 KiB) e **Legacy JS** (12 KiB) — já levantados
  no RELATORIO.md da home, tratamento é global (next.config.ts +
  browserslist).

## Commits

A aplicar (ainda não commitado):
- perf: paralelizar fetches, dynamic imports e preload LCP na PDP

Branch `master`, sem push.
