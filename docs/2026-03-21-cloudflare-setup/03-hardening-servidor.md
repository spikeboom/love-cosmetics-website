# Hardening do Servidor - Firewall e Portas Docker

**Data:** 2026-03-21
**Executado por:** Claude Code (Opus 4.6)

---

## Contexto

Apos a ativacao do Cloudflare, o servidor ainda tinha **7 portas expostas publicamente** que qualquer pessoa podia acessar diretamente pelo IP `147.93.9.224`, bypassando toda a protecao do Cloudflare.

### Portas expostas antes do hardening

| Porta | Servico | Risco |
|---|---|---|
| 1337 | Strapi (CMS) | Acesso direto ao admin do CMS |
| 3001 | Next.js producao | Bypass do Cloudflare/nginx |
| 3002 | Next.js dev | Bypass do Cloudflare/nginx |
| 8000 | Supabase Kong | Acesso direto a API |
| 8080 | GTM Server | Bypass do Cloudflare |
| 8081 | GTM Server Dev | Bypass do Cloudflare |
| 8443 | Supabase HTTPS | Acesso direto |

Nenhuma dessas portas precisava estar exposta, pois todos esses servicos sao acessados via nginx (reverse proxy) que usa a rede Docker interna.

---

## O que foi feito

### 1. Tentativa com UFW

Primeira abordagem: configurar `ufw` para bloquear portas e permitir 80/443 apenas para IPs do Cloudflare.

**Problema encontrado:** O Docker bypassa o ufw. O Docker usa a chain `FORWARD` do iptables e seu proprio `docker-proxy`, enquanto o ufw opera na chain `INPUT`. As portas expostas pelo Docker continuavam acessiveis mesmo com ufw ativo.

### 2. Tentativa com DOCKER-USER chain

Segunda abordagem: usar a chain `DOCKER-USER` do iptables para filtrar trafego destinado a containers Docker.

**Problemas encontrados:**
- A regra padrao `RETURN all -- 0.0.0.0/0` no topo da chain permitia tudo
- O `docker-proxy` escuta diretamente no host e faz forward interno, bypassando ate o DOCKER-USER em alguns casos
- O range `172.16.0.0/12` (Docker interno) conflitava com `172.64.0.0/13` (Cloudflare)

### 3. Descoberta: Next.js nao conectava ao Strapi

Ao restringir as portas, o site caiu com erro 500. Investigacao revelou:

- O Next.js usa `NEXT_PUBLIC_STRAPI_URL=https://strapi.lovecosmeticos.xyz` para buscar dados
- Dentro do container, esse dominio resolve para `147.93.9.224` (IP publico)
- O trafego saia do container → host → Cloudflare → volta ao host
- O firewall bloqueava esse trafego de retorno porque o IP de origem era o da bridge Docker, nao do Cloudflare

**Solucao:** Adicionar regras no ufw e iptables permitindo que as redes Docker (`172.18-21.0.0/16`) acessem as portas 80/443 do host. Tambem adicionada regra para o IP do proprio servidor (`147.93.9.224`).

### 4. Solucao definitiva: remover port bindings do docker-compose

Todas as tentativas com firewall tinham edge cases. A solucao correta foi **remover os port bindings desnecessarios** do `docker-compose.yml`.

O nginx acessa todos os containers pelo **nome DNS interno do Docker** (ex: `proxy_pass http://love-cosmetics-website:3000`), nao pelas portas expostas no host. As portas no docker-compose eram apenas conveniencia de debug, nao necessidade operacional.

#### Portas removidas do docker-compose.yml:

```yaml
# REMOVIDO de love-cosmetics:
ports:
  - "3001:3000"

# REMOVIDO de love-cosmetics-dev:
ports:
  - "3002:3000"

# REMOVIDO de strapi:
ports:
  - "1337:1337"

# REMOVIDO de gtm-server:
ports:
  - "8080:8080"

# REMOVIDO de gtm-server-dev:
ports:
  - "8081:8080"
```

#### Portas mantidas:

```yaml
# webserver (nginx) - necessario para receber trafego do Cloudflare
ports:
  - "80:80"
  - "443:443"

# loki - ja bind em localhost, nao exposto externamente
ports:
  - "127.0.0.1:3100:3100"
```

### 5. Pos-deploy: nginx reload necessario

Apos `docker compose up -d`, os containers foram recriados com novos IPs internos. O nginx precisou de reload para resolver os novos enderecos DNS dos containers:

```bash
docker exec webserver nginx -s reload
```

Sem o reload, o nginx retornava 502 Bad Gateway porque ainda tentava conectar nos IPs antigos.

---

## Configuracao final do firewall

### iptables (DOCKER-USER chain)

```
1  RETURN  172.18.0.0/16  →  qualquer     (Docker app-network)
2  RETURN  172.19.0.0/16  →  qualquer     (Docker loki)
3  RETURN  172.20.0.0/16  →  qualquer     (Docker default)
4  RETURN  172.21.0.0/16  →  qualquer     (Docker supabase)
5  RETURN  147.93.9.224   →  80,443       (servidor acessando a si mesmo)
6  RETURN  established    →  qualquer     (conexoes ja estabelecidas)
7-21 RETURN  Cloudflare IPs → 80,443      (15 ranges IPv4)
22 DROP    qualquer       →  1337,3001,3002,8000,8080,8081,8443
23 DROP    qualquer       →  80,443       (IPs que nao sao Cloudflare)
24 RETURN  qualquer       →  qualquer     (resto passa)
```

Regras persistidas via `iptables-persistent` / `netfilter-persistent`.

**Nota:** A instalacao do `iptables-persistent` removeu o `ufw` (sao pacotes conflitantes). As regras do ufw ja estavam convertidas em iptables.

---

## Arquivos modificados

| Arquivo | Alteracao |
|---|---|
| `docker-compose.yml` | Removidos port bindings de 5 servicos |
| `docker-compose.yml.bak` | Backup do original |
| `/etc/iptables/rules.v4` | Regras do firewall persistidas |
| `/etc/iptables/rules.v6` | Regras IPv6 persistidas |

---

## Testes realizados

| Teste | Resultado |
|---|---|
| Site via Cloudflare (`https://www.lovecosmetics.com.br`) | OK - carrega completo |
| Strapi direto (`http://147.93.9.224:1337`) | Bloqueado (porta fechada) |
| Next.js direto (`http://147.93.9.224:3001`) | Bloqueado (porta fechada) |
| Next.js dev direto (`http://147.93.9.224:3002`) | Bloqueado (porta fechada) |
| GTM direto (`http://147.93.9.224:8080`) | Bloqueado (porta fechada) |
| GTM dev direto (`http://147.93.9.224:8081`) | Bloqueado (porta fechada) |
| SSH | Funcionando |
| Tuneis SSH (Postgres, Grafana, Supabase Studio) | Funcionando (usam rede Docker interna) |
| Comunicacao entre containers | Funcionando |
| Next.js → Strapi (via dominio externo) | Funcionando |

---

## Licoes aprendidas

1. **UFW nao controla portas do Docker.** O Docker manipula iptables diretamente nas chains FORWARD e DOCKER. O ufw opera em INPUT.

2. **docker-proxy bypassa DOCKER-USER.** Quando o Docker expoe uma porta, o `docker-proxy` escuta no host e faz o forward, ignorando regras de firewall em alguns cenarios.

3. **A melhor seguranca e nao expor.** Em vez de tentar filtrar portas com firewall, a solucao correta e simplesmente nao publicar as portas no docker-compose. Se o servico so precisa ser acessado pela rede Docker interna, nao precisa de `ports:`.

4. **Containers acessando dominios externos passam pelo host.** O Next.js dentro do container acessa `strapi.lovecosmeticos.xyz` que resolve para o IP publico do host. Esse trafego precisa ser permitido no firewall.

5. **Apos recriar containers, recarregar nginx.** O Docker DNS interno atualiza, mas o nginx pode ter cacheado os IPs antigos. Sempre rodar `docker exec webserver nginx -s reload` apos `docker compose up -d`.

---

## Comando para debug futuro

Para verificar tuneis SSH da maquina local (Windows PowerShell):

```powershell
while ($true) { ssh -N -L 5433:172.19.0.8:5432 -L 3003:localhost:3003 -L 4000:localhost:4000 -L 3010:172.20.0.2:3000 -o "ServerAliveInterval=60" -o "ServerAliveCountMax=3" root@147.93.9.224; Write-Host "Reconectando em 5 segundos..."; Start-Sleep -Seconds 5 }
```

Os IPs internos dos containers podem mudar apos `docker compose up -d`. Para verificar os IPs atuais:

```bash
for c in $(docker ps --format "{{.Names}}"); do
  echo -n "$c: "
  docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}" $c
done
```
