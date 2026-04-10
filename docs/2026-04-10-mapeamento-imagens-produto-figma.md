# Mapeamento de Imagens de Produto — Rotas /figma/

**Data:** 2026-04-10  
**Escopo:** `src/app/(figma)/` — todos os componentes que renderizam imagens de produto

---

## Componentes que renderizam imagens diretamente

| Arquivo | `sizes`? | `quality`? | Tag | Dimensões | Notas |
|---|---|---|---|---|---|
| `figma/components/CardProduto.tsx` | **Sim** `(max-width: 1024px) 77vw, 230px` | Não | `<Image>` | `fill` | Dois slots: mini-banner e produto completo |
| `product/[slug]/components/ImageZoom.tsx` | Não | Não | `<Image>` + CSS `backgroundImage` | 803×704 | Usa `src` para display e `zoomSrc` para hover (alta resolução) |
| `product/[slug]/components/ProductGallery.tsx` | Não | Não | `<img>` (thumbs) / `<Image>` (mobile main) | 94×94 thumbs | Thumbnails fora do next/image — sem otimização |
| `product/[slug]/components/ImageLightbox.tsx` | Não | Não | `<Image>` | 1200×1200 hardcoded | Lightbox fullscreen, tem `priority` |
| `cart/CartProductCard.tsx` | Não | Não | `<Image>` | 80×80 hardcoded | Miniatura no carrinho, tem `priority` |
| `minha-conta/pedidos/.../PedidoCard.tsx` | Não | Não | `<Image>` | `fill` | Histórico de pedidos |
| `experimento/.../CardProduto.tsx` | Não | Não | `<img>` nativo | sem dimensão | Variante experimento — sem otimização nenhuma |

---

## Componentes que delegam para CardProduto

Estes não renderizam imagens diretamente — passam `imagem` como prop para `CardProduto`:

- `figma/components/VitrineSection.tsx`
- `figma/components/MaisVendidosSection.tsx`
- `figma/components/YouMayLikeSection.tsx`
- `figma/components/ProductGrid.tsx`
- `figma/search/SearchPageClient.tsx`

---

## Campos de origem da imagem

| Contexto | Campo CMS |
|---|---|
| Vitrine / listagem | `imagem` (string URL já transformada por `transformProdutosStrapi`) |
| PDP — display principal | `carouselImagensPrincipal[].imagem.formats.large` → `xlarge` → `url` |
| PDP — zoom (hover) | `carouselImagensPrincipal[].imagem.formats.xlarge` → `large` → `url` |
| PDP — thumbnails | `carouselImagensPrincipal[].imagem.formats.thumbnail` → `small` → `url` |
| Carrinho | `produto.imagem` ou `carouselImagensPrincipal[].imagem.formats.medium` → `thumbnail` |
| Pedidos | `produtosImagens[].image_url` |

---

## Pontos de atenção

- **`sizes` faltando** em quase todos — o Next.js faz download de `w=1920` por padrão quando `fill` é usado sem `sizes`
- **`quality` não definido** em nenhum componente (usa o default 75 implícito)
- **`<img>` nativo** em dois lugares sem otimização: thumbnails do `ProductGallery` e `CardProduto` do experimento
- **`ImageLightbox`** usa 1200×1200 fixo — pode ser revisto dependendo da resolução real das imagens do Directus
