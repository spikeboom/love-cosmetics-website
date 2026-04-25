# Performance real vs Lighthouse — 2026-04-24

Comparação entre nota Lighthouse (lab, com throttling simulado) e Core Web Vitals reais via Cloudflare Web Analytics (RUM, últimos 30 dias).

## TL;DR

**A nota baixa do Lighthouse não reflete a realidade.** Todos os Web Vitals dos usuários reais estão no **verde**. O único problema real é a rota `/search`.

## Lighthouse (lab — com throttling artificial)

Rodado via `unlighthouse-ci` de `C:\Users\Administrator` contra produção, após criar regra Skip no Cloudflare para o IPv6 de teste (o WAF/SBFM estava bloqueando o probe com managed_challenge).

### Mobile (Slow 4G: 600ms RTT, 1.6 Mbps)
| Rota | Perf | A11y | Best Pract | SEO | LCP | FCP | TBT |
|---|---|---|---|---|---|---|---|
| `/` | 0.63 | 0.96 | 0.54 | 1.00 | 9.4s | 3.5s | 40ms |
| `/product/espuma-facial` | 0.60 | 0.91 | 0.54 | 1.00 | 9.9s | 4.2s | 30ms |

### Desktop (sem throttle CPU; rede padrão Lighthouse)
| Rota | Perf | A11y | Best Pract | SEO | LCP | FCP | TBT |
|---|---|---|---|---|---|---|---|
| `/` | 0.32 | 0.96 | 0.54 | 1.00 | 10.6s | 4.1s | 550ms |
| `/product/espuma-facial` | 0.55 | 0.96 | 0.54 | 1.00 | 11.3s | 4.2s | 60ms |

### Best Practices 0.54 — auditorias falhando (todas rotas)
- `errors-in-console` — requests 401 e 404 (investigar asset/endpoint quebrado)
- `third-party-cookies` — GTM, GA4, Meta Pixel, Clarity
- `deprecations` — Shared Storage API + StorageType.persistent (vêm das ad-techs)
- `inspector-issues` — relacionado aos itens acima

## RUM real (Cloudflare Web Analytics — últimos 30 dias)

siteTag `81318c5fd0484cae8e3db3306ecda1fe`, requestHost `lovecosmetics.com.br`. Volume: 80 amostras de Web Vitals em 30 dias.

### Por dispositivo
| Métrica | Mobile (n=30) | Desktop (n=50) | Meta (bom) |
|---|---|---|---|
| **LCP p75** | 1.68s | 0.89s | ≤ 2.5s ✅ |
| **FCP p75** | 1.56s | 1.06s | ≤ 1.8s ✅ |
| **CLS p75** | 0 | 0 | ≤ 0.1 ✅ |
| **INP p75** | 96ms | 72ms | ≤ 200ms ✅ |
| **TTFB p75** | 654ms | 587ms | ≤ 800ms ✅ |

### Por rota
| Rota | Views | LCP p75 | FCP p75 | INP p75 | TTFB p75 |
|---|---|---|---|---|---|
| `/` | 30 | 1.68s ✅ | 1.56s | 96ms | 654ms |
| `/fale-conosco` | 10 | 0.89s ✅ | 0.89s | 72ms | 587ms |
| `/sobre` | 10 | 0.55s ✅ | 0.55s | 64ms | 338ms |
| `/search` | 10 | **6.24s** ❌ | **4.02s** ❌ | — | **1.36s** ❌ |
| `/pedidos/login` | 10 | 0.50s ✅ | 0.50s | 32ms | 362ms |
| `/pedidos` | 10 | 0.30s ✅ | 0.20s | — | 99ms |

CrUX (Google): **insufficient data** — site não atinge o volume mínimo para publicação pública. Por isso PageSpeed Insights não mostra dados de campo.

## Por que a divergência lab × real?

1. **Throttling artificial:** Lighthouse mobile simula 600ms de latência/request + 1.6 Mbps. Um TTFB real de 300ms vira 900ms no relatório.
2. **TTFB real é bom:** 250–500ms direto na origem, ~590–650ms p75 em usuários reais (Brasil).
3. **HTML `cf-cache-status: DYNAMIC`:** não está cacheado no Cloudflare. Cada hit bate no Next.js no VPS — mesmo assim é rápido, mas sobra margem para ganho.
4. **Bootup JS dominado por ad-tech:** GTM + GA4 + Meta Pixel + Clarity + CF Bot Mgmt challenge somam ~600ms de scripting. ~222KB de JS não usado é ad-tech.

## Causa do 403 no probe (resolvido)

Cloudflare Super Bot Fight Mode estava servindo `managed_challenge` para o IP de teste nas rotas `/` e `/product/espuma-facial` (ruleId `874a3e315c344b1281ad4f00046aab6f`). Clientes HTTP sem JS interpretam como 403. Resolvido criando regra Skip:

- Ruleset: `56d18373471e4a05b1485c9386aa53b7` (http_request_firewall_custom)
- Rule: `3bf3dc503ac24092a148d0863c67bf38` — "TEMP - Skip WAF/Bot for Lighthouse testing IP"
- Expressão: `(ip.src in {2804:1b68:c027:b700::/64})`
- Ação: skip nas phases `http_ratelimit`, `http_request_sbfm`, `http_request_firewall_managed`

⚠ Regra temporária — remover quando não precisar mais testar daqui.

## Próximos passos sugeridos

1. **`/search`** — única rota com problema real (LCP 6.2s, TTFB 1.36s). Investigar o que roda no SSR.
2. **`errors-in-console` (401/404)** — rastrear o asset/endpoint quebrado.
3. **Cache Rule no Cloudflare para HTML** — HTML não está cacheado (`cf-cache-status: DYNAMIC`). Cache Rule com bypass por cookie de carrinho tiraria ~300ms do TTFB.
4. **Adiar GTM/Pixel/Clarity** via `next/script strategy="lazyOnload"` ou `requestIdleCallback`. Maior alvo para reduzir TBT de desktop (550ms → <200ms) e bootup JS.
5. **Não obsessivar com a nota Lighthouse mobile** — distorcida pelo throttling. Usar RUM como termômetro.

## Como reproduzir

### Lighthouse lab
```bash
cd love-cosmetics-website
# config em unlighthouse.config.ts define as URLs
npx unlighthouse@0.17.9 unlighthouse-ci --output-path .unlighthouse-mobile --reporter jsonExpanded
npx unlighthouse@0.17.9 unlighthouse-ci --output-path .unlighthouse-desktop --desktop --throttle false --reporter jsonExpanded
```

Requer regra Skip no Cloudflare se rodar do mesmo IP, ou testar da rede pública.

### RUM via API Cloudflare
GraphQL endpoint `https://api.cloudflare.com/client/v4/graphql`, token com `Account Analytics: Read`, filtro por siteTag.

Exemplo (últimos 30d, por dispositivo):

```graphql
query {
  viewer {
    accounts(filter: {accountTag: "97008e90cc32bf8287f526961fd8a961"}) {
      rumWebVitalsEventsAdaptiveGroups(
        limit: 10
        filter: {
          date_geq: "2026-03-25"
          date_leq: "2026-04-24"
          siteTag: "81318c5fd0484cae8e3db3306ecda1fe"
          requestHost: "lovecosmetics.com.br"
        }
      ) {
        count
        dimensions { deviceType requestPath }
        quantiles {
          largestContentfulPaintP75
          firstContentfulPaintP75
          cumulativeLayoutShiftP75
          interactionToNextPaintP75
          timeToFirstByteP75
        }
      }
    }
  }
}
```

Valores vêm em microssegundos — dividir por 1000 para ms.
