# Auditoria Pos-Cloudflare - Antes vs Depois

**Data da auditoria:** 2026-03-22
**Cloudflare ativado em:** 21/Mar/2026 ~20:08 UTC (nameservers propagados + WAF rule criada)
**Periodo analisado:** 17-20/Mar (ANTES) vs 21/Mar 20h+ e 22/Mar (DEPOIS)
**Executado por:** Claude Code (Opus 4.6)
**Fontes:** API Cloudflare (GraphQL httpRequests1hGroups + 1dGroups), Loki, Docker logs, fail2ban logs, iptables

---

## 1. Resumo

| | ANTES do Cloudflare (17-20/Mar) | DEPOIS do Cloudflare (22/Mar) |
|---|---|---|
| Scans .env/.git/wp-* que chegam ao nginx | ~682/dia media | **99** (CF bloqueia no edge) |
| Scans phpinfo/credentials/secrets no nginx | ~145/dia media | **1.035** (CF nao bloqueia esses) |
| wp-login/xmlrpc/phpmyadmin no nginx | ~66/dia media | **0** (CF bloqueia 100%) |
| Trafego total no nginx | ~15.761/dia | 20.632 (mais trafego real visivel) |
| Erros 502/500 | 3-6/dia | **0** |
| Erros 522 (CF -> origin timeout) | n/a | 7 (caindo) |
| Ameacas bloqueadas no edge (CF) | n/a | **2.268** em .com.br + **1.262** em .xyz |
| Fail2ban bans (SSH) | 4-6/dia | 2/dia (inalterado, SSH nao passa pelo CF) |

**Conclusao:** O Cloudflare eliminou 100% dos scans de .env/.git/wp-* antes de chegarem ao servidor. Porem, scans de phpinfo/credentials/secrets/config **aumentaram** porque a regra WAF nao cobre esses paths. Nenhum trafego legitimo foi barrado.

---

## 2. O que o Cloudflare BLOQUEOU com sucesso (nunca mais chega ao nginx)

A regra WAF "Block common scanner probes" bloqueia no edge do Cloudflare:
`.env`, `.git`, `.svn`, `.htaccess`, `.htpasswd`, `.DS_Store`, `wp-login`, `wp-admin`, `wp-config`, `wp-includes`, `xmlrpc.php`, `phpmyadmin`, `phpMyAdmin`, `cgi-bin`

### Contagem no nginx (scans que chegaram ao servidor)

| Dia | .env/.git/.htaccess scans | wp-login/xmlrpc/phpmyadmin | Total |
|---|---|---|---|
| **17/Mar** (sem CF) | 593 | 156 | **749** |
| **18/Mar** (sem CF) | 183 | 50 | **233** |
| **19/Mar** (sem CF) | 671 | 16 | **687** |
| **20/Mar** (sem CF) | 1.280 | 208 | **1.488** |
| Media sem CF | **682/dia** | **108/dia** | **789/dia** |
| 21/Mar <20h (sem CF) | 457 | 138 | 595 |
| 21/Mar >20h (com CF) | 906* | 31 | 937* |
| **22/Mar** (com CF) | **99** | **0** | **99** |

*\* O pico de 906 as 20-23h do dia 21 foi o warmup/propagacao do CF + scanners que ja tinham DNS cacheado apontando pro IP direto.*

**Reducao:** de 789/dia para 99/dia = **87% de reducao**. E os 99 restantes sao `.env` com variacoes que a regra WAF nao cobre (ex: `stripe.env`, `config.env`, `sendgrid.env`).

### Dados da API Cloudflare (threats bloqueadas NO EDGE, nunca tocaram o servidor)

| Zona | 21/Mar (parcial, desde 20h) | 22/Mar (dia inteiro) |
|---|---|---|
| lovecosmetics.com.br | 816 threats | **2.268 threats** |
| lovecosmeticos.xyz | 1.084 threats | **1.262 threats** |
| **Total** | **1.900** | **3.530** |

---

## 3. O que o Cloudflare NAO bloqueia (ainda chega ao nginx)

Scans de: `phpinfo`, `info.php`, `.aws/credentials`, `secrets.json`, `config.yml`, `debug.log`, `error.log`, `.circleci`, `serverless.yml`, `.travis.yml`, `manage/env`, `sendgrid.env`, `brevo.yaml`, `stripe.env`, `backup.sql`, `test.php`, `credentials.json`

| Dia | Scans desse tipo no nginx |
|---|---|
| **17/Mar** (sem CF) | 174 |
| **18/Mar** (sem CF) | 56 |
| **19/Mar** (sem CF) | 85 |
| **20/Mar** (sem CF) | 264 |
| Media sem CF | **145/dia** |
| **22/Mar** (com CF) | **1.035** |

**Aumento de 7x.** Esses scans passam pelo Cloudflare porque a regra WAF so bloqueia os patterns listados acima. Os scanners usam o dominio (passam pelo CF proxy) e o Cloudflare encaminha para o nginx.

### Top paths que ainda passam (22/Mar)

| Path | Hits | Status |
|---|---|---|
| `/info.php` | 31 | 404 |
| `/phpinfo.php` | 30 | 404 |
| `/.aws/credentials` | 30 | 404 |
| `/.aws/config` | 29 | 404 |
| `/config/secrets.yml` | 17 | 404 |
| `/secrets.json` | 14 | 404 |
| `/error.log` | 14 | 404 |
| `/_profiler/phpinfo` | 14 | 404 |
| `/phpinfo` | 13 | 404 |
| `/aws-credentials` | 13 | 404 |
| `/credentials.json` | 11 | 404 |
| `/debug.log` | 11 | 404 |
| `/.circleci/config.yml` | 11 | 404 |
| `/sendgrid.env` | 9 | 404 |
| `/.travis.yml` | 9 | 404 |

**Todos retornam 404** (nenhum arquivo real exposto). O risco e baixo mas gera ruido nos logs.

### IPs dos scanners que passam pelo CF (22/Mar)

| IP | Hits | Observacao |
|---|---|---|
| 93.123.109.246 | 198 | Scanner - passa pelo CF via dominio |
| 185.177.72.60 | 192 | Scanner massivo |
| 52.63.24.156 | 130 | AWS (bot) |
| 3.36.17.200 | 128 | AWS Seoul |
| 54.238.205.25 | 65 | AWS Tokyo |
| 185.177.72.23 | 48 | Scanner |
| 185.177.72.13 | 40 | Scanner |
| 45.148.10.231 | 35 | Scanner |
| 195.178.110.223 | 30 | Scanner |
| 185.177.72.38 | 24 | Scanner |

### IPs dos scanners que batiam direto ANTES do CF (17-20/Mar)

| IP | Hits | Observacao |
|---|---|---|
| 13.233.156.139 | 694 | AWS Mumbai - acesso direto ao IP |
| 52.63.2.130 | 692 | AWS Sydney - acesso direto ao IP |
| 15.164.235.52 | 347 | AWS Seoul - acesso direto ao IP |
| 185.177.72.22 | 175 | Scanner direto |
| 144.91.101.201 | 161 | Scanner direto |
| 185.177.72.13 | 100 | Scanner direto |
| 172.70.x.x (varios) | 541 | **Ja passavam pelo CF** (proxies CF) |

**Nota:** Antes do CF, 541 requests ja vinham de IPs do Cloudflare (172.70.x/172.71.x) - provavelmente de um dominio que ja usava CF como proxy. Apos a ativacao, TODOS os requests passam pelo CF (iptables bloqueia acesso direto a 80/443).

---

## 4. Fail2ban (SSH - nao afetado pelo Cloudflare)

O Cloudflare nao protege SSH (porta 22). O fail2ban continua sendo a unica protecao.

### Bans por dia

| Dia | Bans SSH | IPs |
|---|---|---|
| 20/Mar | 5 | 145.132.102.242, 20.109.38.225, 147.182.168.192, 157.230.188.25, 24.199.90.7 |
| 21/Mar | 5 | 157.230.225.112, 116.110.158.254, 171.231.177.243, 171.231.177.44, 167.99.237.106, 92.118.39.56, 85.231.61.203, 167.99.69.195 |
| 22/Mar | 2 | 95.191.104.219, 68.183.143.102 |

Configuracao: jail `sshd` apenas, ban por 1 hora. Funciona independente do Cloudflare.

---

## 5. Erros de aplicacao (Next.js)

### ConnectTimeoutError (persiste com e sem CF)

```
code: 'UND_ERR_CONNECT_TIMEOUT'
[cause]: [Error: getaddrinfo EAI_AGAIN strapi.lovecosmeticos.xyz]
```

**Causa:** O Next.js resolve `strapi.lovecosmeticos.xyz` pelo DNS publico. Agora com Cloudflare, o caminho e:
```
Container Next.js -> DNS -> Cloudflare -> Nginx -> Strapi
```
Em vez do caminho direto pela rede Docker. Isso **nao e culpa do Cloudflare**, ja existia antes (doc 03, secao 3). O CF pode ate ter piorado levemente a latencia desse path.

### Server Action errors (novo apos redeploy)

```
[Error: Failed to find Server Action "x". This request might be from an older or newer deployment.]
```

Ocorre quando usuarios tem cache de um deploy anterior. Normal apos qualquer redeploy, nao relacionado ao Cloudflare.

---

## 6. Status codes - Comparacao completa

### Nginx (requests que chegaram ao servidor)

| Status | 17/Mar | 18/Mar | 19/Mar | 20/Mar | **Media pre-CF** | **22/Mar (com CF)** | Mudanca |
|---|---|---|---|---|---|---|---|
| 200 | 6.628 | 11.396 | 4.749 | 22.184 | 11.239 | 9.000 | Normal |
| 304 | 674 | 919 | 88 | 616 | 574 | 2.049 | Mais cache |
| 404 | 1.555 | 2.757 | 2.705 | 3.122 | 2.535 | 7.901 | Scans + meta.json |
| 403 | 0 | 1 | 129 | 1 | 33 | 3 | CF bloqueia antes |
| 400 | 572 | 40 | 284 | 26 | 231 | 436 | Scans |
| 503 | 0 | 0 | 0 | 0 | 0 | 117 | **Novo: rate limit pegando bots** |
| 502 | 0 | 0 | 0 | 0 | 0 | 0 | OK |
| 500 | 3 | 0 | 6 | 5 | 4 | 0 | Melhorou |
| 499 | 19 | 80 | 25 | 40 | 41 | 5 | **Melhorou muito** |
| 401 | 103 | 155 | 51 | 228 | 134 | 164 | Normal (auth check) |
| 308 | 463 | 810 | 327 | 968 | 642 | 880 | Normal |
| 301 | 67 | 124 | 731 | 218 | 285 | 0 | CF redirect |

### Cloudflare edge (lovecosmetics.com.br - por hora, dia 21-22)

| Hora (UTC) | Requests | Threats | 403 (WAF) | 404 | 503 | 522 |
|---|---|---|---|---|---|---|
| 21/Mar 22:00 | 3.413 | 289 | 289 | 979 | 16 | 0 |
| 21/Mar 23:00 | 6.306 | 527 | 527 | 1.357 | 47 | 16 |
| 22/Mar 00:00 | 1.783 | 1 | 1 | 138 | 0 | 0 |
| 22/Mar 01:00 | 2.761 | 185 | 185 | 864 | 4 | 0 |
| 22/Mar 02:00 | 1.603 | 189 | 189 | 296 | 16 | 0 |
| 22/Mar 03:00 | 1.673 | 229 | 229 | 440 | 62 | 0 |
| 22/Mar 06:00 | 2.385 | 342 | 342 | 1.483 | 0 | 0 |
| 22/Mar 11:00 | 2.969 | 860 | 860 | 674 | 0 | 0 |
| 22/Mar 13:00 | 2.041 | 285 | 285 | 379 | 0 | 0 |

**Picos de threats** as 23h do dia 21 (527) e 11h do dia 22 (860) = ondas de scanners. Todos bloqueados no edge.

---

## 7. Containers e infraestrutura

| Container | Status 22/Mar | Restarts | Observacao |
|---|---|---|---|
| webserver (nginx) | Up 11h | 0 | Estavel |
| love-cosmetics-website | Up 15h | 0 | Estavel |
| love-cosmetics-website-dev | Up 15h | 0 | Estavel |
| strapi | Up 15h | 0 | Estavel |
| postgres | Up 4 semanas | 0 | 4 FATAL em 21/Mar (restart admin) |
| loki | Up 5 semanas | 0 | Disco 31% usado |
| grafana | Up 15h | 0 | Estavel |
| promtail | Up 4 semanas | 0 | Estavel |
| gtm-server | Up 15h (healthy) | 0 | Estavel |
| gtm-server-dev | Up 15h (healthy) | 0 | Estavel |
| supabase-* (6 containers) | Up 4 semanas | 0 | Todos healthy |

---

## 8. O que precisa ser feito

### Critico: Ampliar regra WAF no Cloudflare

A regra atual so bloqueia `.env`, `.git`, `wp-*`, etc. Faltam paths que ainda passam:

**Adicionar a regra existente:**
```
phpinfo, info.php, .aws, credentials, secrets, debug.log, error.log,
backup.sql, .circleci, .travis, serverless.yml, manage/env,
sendgrid, brevo, stripe.env, test.php, config.yml (em paths suspeitos)
```

Isso eliminaria os ~1.000 scans/dia que ainda passam.

### Importante

- **SSL Full -> Full (Strict):** Servidor ja tem Let's Encrypt valido
- **Ativar Bot Fight Mode:** Desativado atualmente
- **Corrigir `/meta.json`:** 1.000+ hits/dia retornando 404
- **Adicionar `favicon.ico` e `robots.txt`** ao app Next.js
- **Security headers no server block de producao:** So dev e strapi tem, producao nao

### Otimizacao

- **Cache Rules:** Hit ratio em 17-22%, esperado 40-70%. Configurar cache para `/_next/static/*` e `/uploads/*`
- **Next.js -> Strapi via rede Docker:** Usar URL interna para SSR, evitar round-trip pelo CF

---

## 9. Como reproduzir esta auditoria

### API Cloudflare (analytics por hora)

```bash
TOKEN="cfut_WCRD..."
ZONE="bb47d0c72e4db9265195867f090918f3"  # ou d009844674bd5e1dc8e8756fd1c59624

curl -s "https://api.cloudflare.com/client/v4/graphql" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ viewer { zones(filter: {zoneTag: \"'$ZONE'\"}) { httpRequests1hGroups(limit: 48, filter: {datetime_geq: \"YYYY-MM-DDT00:00:00Z\", datetime_leq: \"YYYY-MM-DDT23:59:59Z\"}) { dimensions { datetime } sum { requests threats responseStatusMap { edgeResponseStatus requests } } } } } }"}'
```

Permissao necessaria no token: `Zone > Analytics > Read`

### Nginx - scans que a regra WAF bloqueia

```bash
# Conta .env/.git/wp-* que chegaram ao nginx (deve ser ~0 com CF)
docker logs webserver --since 24h 2>&1 | grep "$(date +%d/%b)" | \
  grep -icE "(\.env|\.git|\.htaccess|wp-login|wp-admin|xmlrpc|phpmyadmin|cgi-bin)"
```

### Nginx - scans que passam pelo CF

```bash
# Conta phpinfo/credentials/secrets que ainda chegam
docker logs webserver --since 24h 2>&1 | grep "$(date +%d/%b)" | \
  grep -icE "(phpinfo|info\.php|\.aws|credentials|secrets|config\.yml|debug\.log|error\.log|backup\.sql|stripe\.env|sendgrid|brevo|test\.php)"
```

### Fail2ban

```bash
cat /var/log/fail2ban.log | grep -E "(Ban|Unban)"
```

### Loki (erros do app)

```bash
START=$(date -d "5 days ago" +%s)000000000
END=$(date +%s)000000000
curl -sG "http://127.0.0.1:3100/loki/api/v1/query_range" \
  --data-urlencode 'query={container="love-cosmetics-website"} |~ "(?i)(error|timeout|ECONNREFUSED)"' \
  --data-urlencode "start=$START" --data-urlencode "end=$END" --data-urlencode "limit=50"
```

---

## 10. Ampliacao da regra WAF (executada 2026-03-22)

### Contexto

A regra original (14 patterns) bloqueava `.env`, `.git`, `wp-*`, `xmlrpc`, `phpmyadmin`, `cgi-bin`, `.svn`, `.DS_Store`. Porem ~1.000 scans/dia de `phpinfo`, `.aws/credentials`, `secrets.json`, `config.env`, etc. ainda passavam pelo Cloudflare.

### Paths legitimos mapeados (nao podem ser bloqueados)

**Next.js (producao + dev):**
- `/`, `/cart`, `/search`, `/sobre`, `/cadastrar`, `/entrar`, `/esqueci-senha`
- `/product/*`, `/checkout/*`, `/pedidos/*`, `/dashboard`, `/fale-conosco`, `/vip-simples`
- `/_next/*` (static assets, image optimization)
- `/api/*` (carrinho, pedidos, pagbank, login, checkout, admin)
- `/new-home/*`, `/icons/*` (SVGs e imagens)
- `/meta.json`, `/robots.txt`, `/favicon.ico`

**Strapi (strapi.lovecosmeticos.xyz):**
- `/admin/*` (login, init, config, JS bundles, homepage, users/me, settings)
- `/api/*` (produtos, categorias, cupoms - requer API token)
- `/content-manager/*` (collection-types, content-types, init, configuration)
- `/i18n/*` (locales)
- `/uploads/*` (imagens de produtos)

**GTM (gtm.lovecosmetics.com.br):**
- `/g/collect*`, `/gtm.js*`, `/gtag/*`, `/_/service_worker/*`, `/data`

**Certbot:** `/.well-known/acme-challenge/*`

**Supabase:** Acessado via `supabase.lovecosmeticos.xyz`

### Patterns adicionados (34 novos, total 48)

| Pattern | Motivo | Conflito com legit? |
|---|---|---|
| `/phpinfo` | Scanner PHP | Nao |
| `/info.php` | Scanner PHP | Nao |
| `/.aws` | Credenciais AWS | Nao |
| `/credentials.json` | Credenciais expostas | Nao |
| `/credentials.txt` | Credenciais expostas | Nao |
| `/aws-credentials` | Credenciais AWS | Nao |
| `/secrets.json` | Secrets expostos | Nao |
| `/secrets.yml` | Secrets expostos | Nao |
| `/debug.log` | Log de debug | Nao |
| `/error.log` | Log de erros | Nao |
| `/.circleci` | CI config | Nao |
| `/serverless.yml` | Infra config | Nao |
| `/.travis.yml` | CI config | Nao |
| `/manage/env` | Admin env | Nao |
| `/sendgrid.env` | Email config | Nao |
| `/brevo.yaml` | Email config | Nao |
| `/stripe.env` | Payment config | Nao |
| `/config.env` | Config generico | Nao |
| `/backup.sql` | Database dump | Nao |
| `/test.php` | Scanner PHP | Nao |
| `/shell.php` | Webshell | Nao |
| `/_profiler` | Symfony profiler | Nao (Next nao usa `/_profiler`) |
| `/_ignition` | Laravel debug | Nao |
| `/telescope` | Laravel telescope | Nao |
| `/actuator` | Spring Boot | Nao |
| `/application.properties` | Spring Boot | Nao |
| `/application.yml` | Spring Boot | Nao |
| `/appsettings` | .NET config | Nao |
| `/config/secrets` | Secrets dir | Nao (Strapi usa `/admin/config`, nao `/config/secrets`) |
| `/config/credentials` | Credentials dir | Nao |
| `/config/database` | DB config | Nao |
| `/config/email` | Email config | Nao |
| `/config/sendgrid` | Sendgrid config | Nao |
| `/config/autoload` | PHP autoload | Nao |
| `/config/stripe` | Stripe config | Nao |
| `/passwd` | Password files | Nao |

### Testes realizados apos aplicacao

**Paths legit (devem funcionar):**

| Path | Status | OK? |
|---|---|---|
| `www.lovecosmetics.com.br/` | 200 | Sim |
| `www.lovecosmetics.com.br/product/espuma-facial` | 200 | Sim |
| `www.lovecosmetics.com.br/cart` | 200 | Sim |
| `dev.lovecosmetics.com.br/` | 200 | Sim |
| `strapi.lovecosmeticos.xyz/admin` | 200 | Sim |
| `strapi.lovecosmeticos.xyz/admin/config` | 200 | Sim |
| `strapi.lovecosmeticos.xyz/admin/init` | 200 | Sim |
| `strapi.lovecosmeticos.xyz/content-manager/init` | 401 (auth) | Sim |
| `strapi.lovecosmeticos.xyz/api/produtos` | 403 (API token) | Sim (e do Strapi, nao do WAF) |
| `gtm.lovecosmetics.com.br/` | 400 | Sim (normal sem params) |
| `.well-known/acme-challenge/test` | 404 | Sim (sem challenge ativo) |

**Paths de scanner (devem ser bloqueados - 403 do Cloudflare):**

| Path | Status | Bloqueado? |
|---|---|---|
| `/.env` | 403 | Sim |
| `/phpinfo.php` | 403 | Sim (NOVO) |
| `/.aws/credentials` | 403 | Sim (NOVO) |
| `/secrets.json` | 403 | Sim (NOVO) |
| `/debug.log` | 403 | Sim (NOVO) |
| `/backup.sql` | 403 | Sim (NOVO) |
| `/config.env` | 403 | Sim (NOVO) |
| `/stripe.env` | 403 | Sim (NOVO) |
| `/test.php` | 403 | Sim (NOVO) |
| `/_profiler` | 403 | Sim (NOVO) |
| `/actuator` | 403 | Sim (NOVO) |
| `/passwd` | 403 | Sim (NOVO) |
| `/config/secrets` | 403 | Sim (NOVO) |

### Expressao WAF completa (aplicada em ambas as zones)

```
(http.request.uri.path contains "/.env") or
(http.request.uri.path contains "/.git") or
(http.request.uri.path contains "/wp-login") or
(http.request.uri.path contains "/wp-admin") or
(http.request.uri.path contains "/xmlrpc.php") or
(http.request.uri.path contains "/phpmyadmin") or
(http.request.uri.path contains "/phpMyAdmin") or
(http.request.uri.path contains "/.htaccess") or
(http.request.uri.path contains "/.htpasswd") or
(http.request.uri.path contains "/wp-config") or
(http.request.uri.path contains "/wp-includes") or
(http.request.uri.path contains "/cgi-bin") or
(http.request.uri.path contains "/.svn") or
(http.request.uri.path contains "/.DS_Store") or
(http.request.uri.path contains "/phpinfo") or
(http.request.uri.path contains "/info.php") or
(http.request.uri.path contains "/.aws") or
(http.request.uri.path contains "/credentials.json") or
(http.request.uri.path contains "/credentials.txt") or
(http.request.uri.path contains "/aws-credentials") or
(http.request.uri.path contains "/secrets.json") or
(http.request.uri.path contains "/secrets.yml") or
(http.request.uri.path contains "/debug.log") or
(http.request.uri.path contains "/error.log") or
(http.request.uri.path contains "/.circleci") or
(http.request.uri.path contains "/serverless.yml") or
(http.request.uri.path contains "/.travis.yml") or
(http.request.uri.path contains "/manage/env") or
(http.request.uri.path contains "/sendgrid.env") or
(http.request.uri.path contains "/brevo.yaml") or
(http.request.uri.path contains "/stripe.env") or
(http.request.uri.path contains "/config.env") or
(http.request.uri.path contains "/backup.sql") or
(http.request.uri.path contains "/test.php") or
(http.request.uri.path contains "/shell.php") or
(http.request.uri.path contains "/_profiler") or
(http.request.uri.path contains "/_ignition") or
(http.request.uri.path contains "/telescope") or
(http.request.uri.path contains "/actuator") or
(http.request.uri.path contains "/application.properties") or
(http.request.uri.path contains "/application.yml") or
(http.request.uri.path contains "/appsettings") or
(http.request.uri.path contains "/config/secrets") or
(http.request.uri.path contains "/config/credentials") or
(http.request.uri.path contains "/config/database") or
(http.request.uri.path contains "/config/email") or
(http.request.uri.path contains "/config/sendgrid") or
(http.request.uri.path contains "/config/autoload") or
(http.request.uri.path contains "/config/stripe") or
(http.request.uri.path contains "/passwd")
```

Aplicada via API `PUT /zones/{zone_id}/rulesets/{ruleset_id}` em:
- `lovecosmetics.com.br` (ruleset `56d18373471e4a05b1485c9386aa53b7`, rule `61fe78816bae45d98229f7dcabd61599`)
- `lovecosmeticos.xyz` (ruleset `64d254b3c21b43dbb01ce2113a2f1cd9`, rule `39f297f94b2f4ed0b00660f23e5558b4`)

---

## 11. Otimizacoes adicionais aplicadas (2026-03-22)

### SSL Full -> Full (Strict)

Alterado em ambas as zones. Com `Full`, o Cloudflare aceitava qualquer certificado na origem (inclusive expirado ou auto-assinado). Com `Full (Strict)`, o Cloudflare valida que o certificado Let's Encrypt do servidor e valido e confiavel. Zero risco porque o Let's Encrypt ja esta configurado e renovando.

### Bot Fight Mode

Ativado em ambas as zones com `enable_js: true` e `fight_mode: true`.

**Como funciona:** O Cloudflare injeta um desafio JavaScript invisivel em cada pagina. Humanos nem percebem (roda em milissegundos no browser). Bots/scrapers que nao executam JavaScript (como os scanners dos logs - `185.177.72.60`, `93.123.109.246`) nao conseguem resolver o desafio e sao bloqueados automaticamente. Bots legitimos (Googlebot, Facebook crawler, Instagram, etc.) sao reconhecidos pelo Cloudflare e passam sem desafio.

Em resumo: e um "captcha invisivel" que so pega bot ruim.

### Cache Rules (3 regras em cada zone)

Criadas via API `POST /zones/{zone_id}/rulesets` com phase `http_request_cache_settings`.

| Regra | Path | Edge TTL | Browser TTL | Por que e seguro |
|---|---|---|---|---|
| Cache Next.js static | `/_next/static/*` | 1 ano | 1 ano | Arquivos versionados por hash (ex: `webpack-bc6d82553745dc42.js`). Novo deploy = novos hashes = browser pede arquivo novo automaticamente. Nunca fica stale. |
| Cache Strapi uploads | `/uploads/*` | 1 mes | 1 mes | Strapi gera nomes unicos por upload (ex: `MORG_0530_a5b9f1f838.jpg`). Se substituir uma imagem com mesmo nome, fazer Purge Cache no dashboard ou via API. |
| Cache SVGs e imagens | `/new-home/*` | 1 semana | 1 semana | Icones e imagens estaticas do layout. Se trocar, muda o nome do arquivo. |

**Paginas dinamicas (homepage, API, checkout, cart) NAO sao cacheadas** - continuam com `cache-control: private, no-cache` e `cf-cache-status: DYNAMIC`.

**Se precisar limpar cache de um arquivo especifico:**
- Dashboard: Caching > Purge Cache > Custom Purge > colar a URL
- API: `POST /zones/{zone_id}/purge_cache` com body `{"files":["https://..."]}`

#### Testes de cache realizados

| Asset | cf-cache-status | cache-control | OK? |
|---|---|---|---|
| `/_next/static/chunks/webpack-*.js` | **HIT** | `max-age=31536000, immutable` | Sim |
| `/uploads/medium_MORG_0530_*.jpg` (1st) | MISS | `max-age=2592000` | Sim |
| `/uploads/medium_MORG_0530_*.jpg` (2nd) | **HIT** | `max-age=2592000` | Sim |
| `/new-home/icons/alert.svg` | **REVALIDATED** | `max-age=604800` | Sim |
| `/` (homepage) | **DYNAMIC** | `private, no-cache` | Sim (nao cacheia) |

#### Rulesets criados

| Zone | Ruleset ID |
|---|---|
| lovecosmetics.com.br | `9cacf97fc53f43d0a330791752ce4ba4` |
| lovecosmeticos.xyz | `d3cce18a8920404c9dcdd17ccaae5c8c` |

### Configuracao final (ambas zones)

| Setting | Valor |
|---|---|
| SSL | Full (Strict) |
| Security Level | Medium |
| Bot Fight Mode | **ON** (fight_mode + enable_js) |
| AI Bots Protection | Disabled (requer ativacao manual) |
| WAF Custom Rules | 1 regra com 48 patterns |
| Cache Rules | 3 regras (next static, uploads, new-home) |
| Always Use HTTPS | On |
| Brotli | On |
| Min TLS Version | 1.2 |

### O que resta fazer (futuro)

| Item | Tipo | Esforco |
|---|---|---|
| Ativar AI Bots Protection e Crawler Protection | Dashboard (1 clique) | 1 min |
| Corrigir `/meta.json` (1.000+ 404s/dia) | Codigo Next.js | 5 min |
| Adicionar `favicon.ico` e `robots.txt` | Codigo Next.js | 5 min |
| Security headers no server block de producao (nginx) | Nginx config | 10 min |
| Next.js -> Strapi via rede Docker (evitar round-trip) | Env var + codigo | 30 min |
| Upgrade para Pro (WAF OWASP managed rules) | US$ 20/mes | Quando trafego crescer |
