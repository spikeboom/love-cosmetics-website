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

## Segunda rodada — regressão de LCP (pós-deploy)

Novo PageSpeed após o commit `0d1ffd6`:
https://pagespeed.web.dev/analysis/https-dev-lovecosmetics-com-br-product-espuma-facial/qqkmyatonp

- Performance: **60** (era 62)
- LCP: **10,4s** (era 2,0s) — piorou 5x
- TBT 340ms · FCP 1,1s · CLS 0 · SI 7,6s

### LCP breakdown (via `window.__LIGHTHOUSE_MOBILE_JSON__`)

| Fase | Duração |
|---|---|
| Time to first byte | 1ms |
| **Resource load delay** | **1.006ms** |
| Resource load duration | 473ms |
| **Element render delay** | **2.452ms** |

Elemento LCP confirmado: `<img alt="Produto Love Cosmeticos">` — a galeria mobile da PDP.

### Causas reais

**1. Preload custom não batia com a URL do `<Image>`**

O `<link rel="preload" imageSrcSet>` que adicionei em `page.tsx` gerava
URLs `/_next/image?...&w=1080&q=85`, mas o `<Image>` mobile tem
`width={803} height={704}` (sem `fill`) e `sizes="100vw"` — o Next calcula
srcset de forma diferente nesse caso. URLs não casavam → preload virou
request desperdiçado + download duplicado. Resource load delay de 1s
veio daí: o browser só descobriu a URL real depois que o React renderizou
o `<Image>`.

**2. `opacity-0` + `onLoad` travavam o LCP**

`ProductGallery.tsx` tinha um skeleton mobile que mantinha o `<Image>`
com `opacity-0` até `setMobileImageLoaded(true)` disparar via `onLoad`.
**LCP só conta o elemento quando ele fica visível pro usuário** — com
`opacity:0` ele não conta. Resultado: a imagem já estava baixada aos
~1,5s, mas o LCP registrou 4s depois quando o `onLoad` rodou e o
`transition-opacity` completou. Isso explica o element render delay de
2,5s que antes era quase zero.

Esse bug era **pré-existente**, mas na primeira auditoria (score 62) o
Lighthouse variou diferente e calhou de marcar LCP=2s. Os dynamic imports
+ hidratação mais tardia pós-commit apenas expuseram o problema real.

### Correções aplicadas — commit `96e8969`

**`src/app/(figma)/(main)/figma/product/[slug]/page.tsx`**
- Removido todo o bloco de preload manual (`<link rel="preload">` + helpers
  `nextImg`/`buildSrcSet`/`mobileWidths`). Com `priority` no `<Image>`,
  o Next 15 já injeta o preload correto automaticamente — casando 100%
  com a URL real do request.

**`src/app/(figma)/(main)/figma/product/[slug]/components/ProductGallery.tsx`**
- Removido `mobileImageLoaded` state, `useEffect` de reset, skeleton
  div e classes de `opacity`/`transition` do `<Image>` mobile. Imagem
  renderiza imediatamente.
- `priority` passou a ser condicional (`selectedImage === 0`) — só o
  primeiro slide precisa, os outros carregam sob demanda do swipe.
- `useEffect` import removido (não é mais usado).

### Lição

`priority` do `next/image` + qualquer `opacity:0` inicial na mesma tag
quebra LCP silenciosamente. O preload do Next só funciona se você não
competir com ele manualmente.

## Terceira rodada — ImageZoom sabotando LCP mobile

Novo PageSpeed após `96e8969`:
https://pagespeed.web.dev/analysis/https-dev-lovecosmetics-com-br-product-espuma-facial/wxe2wgp10q

- Performance: **51** (piorou mais)
- LCP **5,3s** · TBT **1.320ms** · FCP 1,1s · CLS 0 · SI 5,2s

### Novo breakdown LCP

| Fase | Duração |
|---|---|
| TTFB | 1ms |
| **Resource load delay** | **1.192ms** |
| **Resource load duration** | **1.173ms** |
| Element render delay | 54ms ✅ (o fix do opacity funcionou) |

O fix anterior resolveu o render delay (2,5s → 54ms). Mas dois novos
sintomas apareceram: a imagem demora 1,2s pra começar a baixar, e mais
1,2s pra completar o download. Com LCP rotulada como `Low` priority no
`network-requests`, ficou claro que o preload do `priority` não estava
valendo.

### Causa raiz — `ImageZoom.tsx` (galeria desktop)

Mesmo o container `<div className="hidden md:block">` escondendo a
galeria desktop no mobile, o `<Image>` dentro dele ainda estava no DOM.
Três comportamentos combinados sabotavam o LCP:

1. **`priority` no `<Image>` desktop**: injetava `<link rel="preload">`
   da versão desktop no `<head>` do mobile — competindo com o preload
   da imagem mobile real.
2. **`new Image()` em `useEffect`**: pré-carregava a versão zoom/xlarge
   sincronamente na hidratação, rodando mesmo em mobile.
3. **`opacity-0` + `onLoad`** no `<Image>` desktop: réplica exata do
   bug do mobile que já corrigimos — se a imagem desktop fosse a LCP
   (em desktop), o mesmo render delay aconteceria lá.

Resultado: 3 requests concorrentes da mesma imagem em variantes (large
mobile + large desktop + xlarge zoom), saturando a conexão do mobile
throttled do Lighthouse.

### Correções — commit `a77afce`

**`src/app/(figma)/(main)/figma/product/[slug]/components/ImageZoom.tsx`**

- Removido `priority` (desktop nunca é LCP no form factor mobile).
- Adicionado `loading="lazy"` — browser pula o request quando o
  container está `display:none` via CSS.
- Removido `opacity-0` / `transition-opacity` / `onLoad` / `imageLoaded`
  state / skeleton fade (mesmo fix do mobile).
- `new Image()` do zoom agora:
  - Guardado por `matchMedia("(max-width: 767px)").matches` → não roda
    em mobile.
  - Envolto em `requestIdleCallback` (fallback `setTimeout 1500ms`) →
    não compete com hidratação nem com LCP em desktop.

### Lição acumulada

O `next/image` `priority` é global — ele injeta preload no `<head>`
independentemente de o componente estar visível ou não. Em galerias com
variantes mobile/desktop renderizadas lado a lado com `hidden md:block`,
**apenas uma** das tags pode ter `priority`, e deve ser a que
corresponde ao form factor auditado (neste caso, mobile). A outra
precisa de `loading="lazy"` explícito pra evitar request duplicado.

## Quarta rodada — o vilão real eram as FONTES

Novo PageSpeed após `a77afce`:
https://pagespeed.web.dev/analysis/https-dev-lovecosmetics-com-br-product-espuma-facial/xvryix1uu7

- Performance: **68** (melhorou de 51)
- LCP **5,7s** · TBT **380ms** · FCP 1,1s · CLS 0 · SI 4,0s
- Resource load delay ainda **794ms**

Ainda longe do ideal. O usuário apontou: "não precisa todas as imagens em
boa qualidade no início". Verdade, mas o diagnóstico network revelou que
o dominante não eram imagens, e sim **fontes**.

### Inventário de fontes servidas na PDP

Extraído via `network-requests` audit, agrupado por priority:

| Tipo | Qtd | KB |
|---|---|---|
| Fontes `.ttf` (Cera Pro) | 6 | ~380 KB |
| Fontes `.otf` (Cera Pro Italic) | 2 | ~200 KB |
| Fontes `.woff2` (Poppins/Roboto/Baskerville) | 9 | ~108 KB |
| **Total fontes** | **15** | **~688 KB** |
| Imagem LCP (única relevante) | 1 | 52 KB |

**688 KB de fontes com `priority=High` render-blocking** competindo com
52 KB da imagem LCP. O browser prioriza fontes → imagem LCP entra na
fila atrás → `resource load delay` de 794ms.

### Causa raiz — `src/lib/fonts/index.ts`

Arquivo definia Cera Pro em **9 variantes** (Thin 100, Light 300,
Regular 400, Medium 500, Bold 600, Bold 700, Black 900, Italic 400,
Italic 900) carregadas via `next/font/local`. Problemas:

1. Os arquivos no disco eram `.ttf` (e 2 `.otf`), não `.woff2`.
   `next/font/local` não converte automaticamente — serve o que
   estiver no disco. TTFs têm ~72% mais bytes que woff2 equivalentes.
2. Variantes nunca usadas (Thin, Black, Bold 600 duplicado, italics)
   foram identificadas via grep no codebase: italic aparece só em
   `sobre/page.tsx`, Thin/Black/Semibold (600) em zero arquivos de
   produção.
3. `layout.tsx` do grupo `(figma)` importa `fontClasses` que dispara
   **todas as 9 variantes em toda PDP**, mesmo as não referenciadas
   no CSS.

### Correções aplicadas — commit `_` (próximo)

**Frente 1 — Conversão `.ttf` → `.woff2`**

Script `scripts/convert-fonts.py` usa `fontTools` (Python) + `brotli`
para converter 4 fontes essenciais:

| Arquivo | TTF | WOFF2 | Redução |
|---|---|---|---|
| CeraPro-Light | 159 KB | 45 KB | 72% |
| CeraPro-Regular | 159 KB | 45 KB | 72% |
| CeraPRO-Medium | 70 KB | 23 KB | 68% |
| Cera Pro Bold | 156 KB | 45 KB | 72% |
| **Total** | **546 KB** | **159 KB** | **71%** |

**Frente 2 — `src/lib/fonts/index.ts`**

- Removidas variantes Thin (100), Bold 600 (duplicado de 700), Black
  (900), Italic 400, Italic 900. Restam apenas `300/400/500/700`
  normal.
- Apontadas pros novos `.woff2`.
- Italic nos 2 locais de `sobre/page.tsx` ficam via `font-style:italic`
  CSS (browser sintetiza oblique a partir do regular) — diferença
  visual mínima, ninguém reclama em block de texto curto.

**Frente 3 — `Header.tsx`**

- `priority` removido do logo do header. Logo é pequeno (<5 KB),
  aparece em todas as páginas, estava competindo com a imagem LCP
  da PDP mobile. Mantém `sizes` para o Next escolher o tamanho certo.

Resultado esperado na próxima rodada:

| Métrica | Antes | Esperado |
|---|---|---|
| Bytes de fontes | 688 KB | ~200 KB |
| Fontes render-blocking | 15 | ~9 |
| Resource load delay LCP | 794ms | <200ms |
| LCP | 5,7s | 1,5-2s |
| Score | 68 | 85-95 |

### Nota sobre a intuição do usuário

O palpite "não precisa todas as imagens em boa qualidade no início" era
direcionalmente correto, e já tínhamos consertado a galeria no commit
`a77afce`. Mas o dado de network mostrou que **a galeria já estava
correta** (1 imagem de 52 KB com priority), e o gargalo ficou
invisível até a gente olhar todos os requests agrupados por tipo. Lição:
sempre olhar `network-requests` agrupado por `resourceType`, não só as
auditorias de imagem.

## Commits

- `0d1ffd6` — perf: paralelizar fetches, dynamic imports e preload LCP na PDP
- `96e8969` — fix: LCP da PDP — remover opacity-0 inicial e preload manual
- `a77afce` — fix: ImageZoom não compete mais com LCP mobile
- a commitar — perf: converter fontes para woff2, remover variantes e priority do logo

Branch `master`, sem push.
