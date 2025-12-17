# Deploy Local para VPS

## Requisitos
- Docker Desktop instalado e rodando
- Acesso SSH configurado para `root@147.93.9.224`

## Passo a Passo

### 1. Build da imagem (na pasta do projeto)
```powershell
# DEV
docker build --platform linux/amd64 -t love-cosmetics-dev:latest --build-arg ENV_FILE=.env.dev .

# PROD
docker build --platform linux/amd64 -t love-cosmetics:latest --build-arg ENV_FILE=.env.master .
```

### 2. Salvar imagem como .tar
```powershell
# DEV
docker save love-cosmetics-dev:latest -o "C:\Users\Administrator\Documents\Love Drive\NextLove\tar_to_vps\love-cosmetics-dev.tar"

# PROD
docker save love-cosmetics:latest -o "C:\Users\Administrator\Documents\Love Drive\NextLove\tar_to_vps\love-cosmetics.tar"
```

### 3. Enviar para VPS
```powershell
# DEV
scp "C:\Users\Administrator\Documents\Love Drive\NextLove\tar_to_vps\love-cosmetics-dev.tar" root@147.93.9.224:/root/wordpress/tar_to_vps/

# PROD
scp "C:\Users\Administrator\Documents\Love Drive\NextLove\tar_to_vps\love-cosmetics.tar" root@147.93.9.224:/root/wordpress/tar_to_vps/
```

### 4. Carregar e subir na VPS
```bash
# DEV
ssh root@147.93.9.224 "docker load < /root/wordpress/tar_to_vps/love-cosmetics-dev.tar && cd /root/wordpress && docker-compose up -d love-cosmetics-dev webserver"

# PROD
ssh root@147.93.9.224 "docker load < /root/wordpress/tar_to_vps/love-cosmetics.tar && cd /root/wordpress && docker-compose up -d love-cosmetics webserver"
```

## Comando Completo (DEV)
```powershell
docker build --platform linux/amd64 -t love-cosmetics-dev:latest --build-arg ENV_FILE=.env.dev . && docker save love-cosmetics-dev:latest -o "C:\Users\Administrator\Documents\Love Drive\NextLove\tar_to_vps\love-cosmetics-dev.tar" && scp "C:\Users\Administrator\Documents\Love Drive\NextLove\tar_to_vps\love-cosmetics-dev.tar" root@147.93.9.224:/root/wordpress/tar_to_vps/ && ssh root@147.93.9.224 "docker load < /root/wordpress/tar_to_vps/love-cosmetics-dev.tar && cd /root/wordpress && docker-compose up -d love-cosmetics-dev webserver"
```

## URLs
- DEV: https://dev.lovecosmetics.com.br
- PROD: https://lovecosmetics.com.br
