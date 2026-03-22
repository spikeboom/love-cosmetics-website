# Implementacao Cloudflare - Love Cosmetics

**Data:** 2026-03-21
**Executado por:** Claude Code (Opus 4.6)

---

## Contexto

Analise dos logs do Loki (ultimas 24h) revelou:

- **200+ probes de `.env`** por scanners (IPs: `38.240.48.188`, `159.65.170.51`, `172.71.144.x`)
- **200+ requests de bots** (scrapers, crawlers)
- **7 tentativas de xmlrpc**, **3 de wp-login**
- **301 respostas 404** desnecessarias
- Todas as imagens servidas diretamente pelo servidor, sem CDN
- **Bug:** protecao contra scanners (`.env`, `wp-login`) existia apenas no server block do Strapi, faltando no server block de producao

---

## O que foi feito

### 1. Cloudflare - Criacao das Zones

Duas zones criadas via API (`POST /zones`):

| Dominio | Zone ID | Nameservers |
|---|---|---|
| `lovecosmeticos.xyz` | `d009844674bd5e1dc8e8756fd1c59624` | `coen.ns.cloudflare.com`, `iris.ns.cloudflare.com` |
| `lovecosmetics.com.br` | `bb47d0c72e4db9265195867f090918f3` | `isaac.ns.cloudflare.com`, `veda.ns.cloudflare.com` |

### 2. DNS Records

Todos os registros DNS replicados no Cloudflare com proxy ativo:

**lovecosmeticos.xyz:**

| Tipo | Nome | Valor | Proxy |
|---|---|---|---|
| A | `@` | 147.93.9.224 | Sim |
| A | `www` | 147.93.9.224 | Sim |
| A | `v2.0` | 147.93.9.224 | Sim |
| A | `next` | 147.93.9.224 | Sim |
| A | `dev` | 147.93.9.224 | Sim |
| A | `strapi` | 147.93.9.224 | Sim |
| A | `gtm` | 147.93.9.224 | Sim |
| A | `gtm-dev` | 147.93.9.224 | Sim |
| A | `supabase` | 147.93.9.224 | Sim |
| A | `supabase-studio` | 147.93.9.224 | Sim |

**lovecosmetics.com.br:**

| Tipo | Nome | Valor | Proxy |
|---|---|---|---|
| A | `@` | 147.93.9.224 | Sim |
| A | `www` | 147.93.9.224 | Sim |
| A | `dev` | 147.93.9.224 | Sim |
| A | `gtm` | 147.93.9.224 | Sim |
| A | `gtm-dev` | 147.93.9.224 | Sim |
| MX | `@` | `smtp.google.com` (prioridade 1) | - |
| TXT | `@` | `google-site-verification=uCpIhyPCRXTG-UhKKsjzHFUBfqXP0tGM3wpFuhB5W5A` | - |
| CNAME | `bajxgz2pf64r` | `gv-oa42c7julmiiky.dv.googlehosted.com` | Nao |

### 3. Configuracoes do Cloudflare (ambas zones)

| Configuracao | Valor |
|---|---|
| SSL Mode | Full |
| Always Use HTTPS | On |
| Brotli | On |
| Min TLS Version | 1.2 |
| Security Level | Medium |
| Browser Cache TTL | Respect Origin |

### 4. WAF - Custom Rules (ambas zones)

Regra **"Block Scanners"** criada via Rulesets API (`http_request_firewall_custom`):

Bloqueia requests contendo:
- `/.env`, `/.git`, `/.svn`, `/.htaccess`, `/.htpasswd`, `/.DS_Store`
- `/wp-login`, `/wp-admin`, `/wp-config`, `/wp-includes`
- `/xmlrpc.php`, `/phpMyAdmin`, `/phpmyadmin`
- `/cgi-bin`

### 5. Troca de Nameservers

| Dominio | Registrador | Metodo |
|---|---|---|
| `lovecosmeticos.xyz` | Hostinger | API (`PUT /domains/v1/portfolio/lovecosmeticos.xyz/nameservers`) |
| `lovecosmetics.com.br` | Registro.br | Manual (painel) |

### 6. Nginx - Adaptacoes no servidor

**Arquivo criado:** `nginx-conf-http/cloudflare-realip.conf`
- Configura `set_real_ip_from` com todos os ranges de IP do Cloudflare (IPv4 + IPv6)
- Define `real_ip_header CF-Connecting-IP`
- Carregado automaticamente pelo wildcard `include /etc/nginx/conf.d/*.conf`

**Arquivo modificado:** `nginx-conf-http/default.conf`
- Adicionada protecao contra scanners no server block de **producao** (antes so existia no Strapi)
- Bloqueio de `.env`, `.git`, `wp-login`, `xmlrpc.php`, etc. com `return 403`
- Backup salvo em `default.conf.bak`

---

## APIs utilizadas

| API | Token | Uso |
|---|---|---|
| Cloudflare | `cfut_WCRD...` | Zones, DNS, Settings, WAF |
| Hostinger | `JwPTP3...` | Troca de nameservers |

### Permissoes do token Cloudflare necessarias

- Zone > Zone > Edit
- Zone > Zone Settings > Edit
- Zone > DNS > Edit
- Zone > Zone WAF > Edit
- Zone > Cache Purge > Purge
- Zone > Firewall Services > Edit
- Zone > Cache Rules > Edit

---

## Arquitetura resultante

```
Usuario -> Cloudflare (CDN/WAF/SSL) -> Nginx (reverse proxy) -> Containers Docker
```

O IP real do servidor (`147.93.9.224`) agora esta oculto atras do Cloudflare.
