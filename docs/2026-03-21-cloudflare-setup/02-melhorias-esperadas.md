# Melhorias Esperadas com Cloudflare - Love Cosmetics

**Data:** 2026-03-21

---

## 1. Seguranca

### Protecao DDoS
- O Cloudflare absorve ataques volumetricos antes de chegarem ao servidor
- Plano Free inclui protecao DDoS ilimitada para camadas 3, 4 e 7
- Antes: qualquer pessoa com o IP podia atacar diretamente
- Agora: IP real oculto, trafego filtrado pelo Cloudflare

### WAF (Web Application Firewall)
- Scanners automaticos (`.env`, `wp-login`, `xmlrpc`) sao bloqueados **no edge do Cloudflare**, sem consumir recursos do servidor
- Antes: 200+ probes de `.env` por dia chegavam ao Nginx e ao Next.js
- Agora: bloqueados antes de tocar no servidor
- Regra custom criada bloqueia 14 padroes de ataque comuns

### Ocultacao do IP de origem
- Antes: `dig lovecosmetics.com.br` retornava `147.93.9.224` (IP real)
- Agora: retorna IPs do Cloudflare, impossibilitando ataques diretos
- **Atencao:** se o IP ja foi exposto anteriormente, atacantes que o salvaram ainda podem tentar acesso direto. Considerar configurar o firewall do servidor (iptables/ufw) para aceitar conexoes HTTP/HTTPS apenas dos ranges do Cloudflare

### Bot Management
- O Cloudflare identifica e filtra bots maliciosos automaticamente
- Bots legitimos (Google, Facebook, etc.) continuam funcionando
- Antes: 200+ requests de bots por dia consumiam recursos
- Agora: filtrados no edge

### SSL/TLS
- TLS 1.2 minimo aplicado no edge (navegadores antigos/inseguros bloqueados)
- HTTPS forcado em todas as conexoes
- HSTS ativo com preload

---

## 2. Performance

### CDN (Content Delivery Network)
- Assets estaticos (imagens, JS, CSS, SVGs) sao cacheados nos 300+ data centers do Cloudflare no mundo
- **Impacto direto no e-commerce:**
  - Imagens de produtos carregam mais rapido para usuarios em qualquer regiao do Brasil
  - Usuarios vindos de Facebook Ads (maioria do trafego) tem experiencia significativamente melhor
  - `_next/static/*` (JS/CSS do Next.js) servido do edge mais proximo
  - SVGs (icones sociais, badges) cacheados

### Compressao Brotli
- Brotli e 15-20% mais eficiente que gzip para conteudo web
- Reducao no tamanho das paginas HTML, JS e CSS transferidas
- Menor consumo de dados para usuarios mobile (maioria do trafego via Facebook Ads)

### Reducao de carga no servidor
- Requests de assets estaticos servidos pelo Cloudflare, sem chegar ao Nginx/Next.js
- Servidor fica livre para processar apenas requests dinamicos (API, SSR, checkout)
- Menos CPU e memoria consumidos pelo Next.js para servir imagens

### Tempo de resposta (TTFB)
- Usuarios mais distantes do servidor (que esta na Contabo) receberao respostas mais rapido
- DNS resolution mais rapido (Cloudflare tem um dos DNS mais rapidos do mundo, ~11ms)

---

## 3. Confiabilidade

### Always Online
- Se o servidor cair, o Cloudflare pode servir uma versao cacheada do site
- Nao substitui monitoramento, mas evita pagina de erro total

### Failover de DNS
- Cloudflare DNS tem 100% de uptime SLA
- Antes: dependia dos NS da Hostinger/Registro.br

---

## 4. Observabilidade

### Analytics do Cloudflare (gratis)
- Dashboard com metricas de trafego, ameacas bloqueadas, cache hit ratio
- Visibilidade de paises de origem, tipos de dispositivo, bots vs humanos
- Complementa o Loki/Grafana que ja esta configurado

### Logs de seguranca
- Cada request bloqueado pelo WAF fica registrado
- Possibilidade de ver quais IPs estao tentando atacar e de onde

---

## 5. Metricas esperadas

| Metrica | Antes | Esperado |
|---|---|---|
| Probes `.env`/scanners no servidor | 200+/dia | ~0 (bloqueados no edge) |
| Requests de bots no servidor | 200+/dia | Reducao de 80-90% |
| TTFB para assets estaticos | Depende da distancia ao servidor | 10-50ms (edge proximo) |
| Tamanho de transferencia (Brotli) | Baseline | -15 a 20% |
| Carga de CPU no servidor | Baseline | Reducao significativa |
| Cache hit ratio | 0% (sem CDN) | 40-70% esperado |

---

## 6. O que ainda pode ser feito (proximos passos)

### Curto prazo
- **Firewall do servidor:** configurar iptables/ufw para aceitar HTTP/HTTPS apenas dos IPs do Cloudflare (protecao contra acesso direto ao IP)
- **Page Rules / Cache Rules:** configurar cache mais agressivo para uploads do Strapi (`/uploads/*`) e assets do Next.js (`/_next/*`)
- **Certificado Origin CA:** trocar o Let's Encrypt por um Cloudflare Origin Certificate (15 anos de validade, sem renovacao manual)

### Medio prazo
- **Rate Limiting no Cloudflare:** mover o rate limiting do Nginx para o Cloudflare (bloqueia antes de chegar ao servidor)
- **Cloudflare Workers:** possibilidade de fazer redirect, A/B testing, ou manipulacao de headers no edge
- **Bot Fight Mode:** ativar no dashboard para protecao adicional contra bots

### Longo prazo
- **Argo Smart Routing** (pago): otimiza a rota entre o Cloudflare e o servidor de origem, reduzindo latencia em ~30%
- **Cloudflare Images** (pago): servir e transformar imagens diretamente pelo Cloudflare, eliminando `_next/image` do servidor
- **Web Analytics** (gratis): analytics focado em performance (Core Web Vitals) sem JavaScript adicional

---

## 7. Custos

| Item | Custo |
|---|---|
| Plano Free (atual) | R$ 0 |
| Plano Pro (se necessario) | ~US$ 20/mes - inclui WAF managed rules, image optimization, mobile redirect |
| Argo Smart Routing | ~US$ 5/mes + US$ 0.10/GB |

O plano Free cobre todas as necessidades atuais. Upgrade so faz sentido se o trafego crescer significativamente ou se precisar de WAF managed rules (OWASP top 10 automatico).
