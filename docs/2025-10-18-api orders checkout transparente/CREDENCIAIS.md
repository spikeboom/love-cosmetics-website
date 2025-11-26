# 🔑 Credenciais PagBank - Ambiente Sandbox

## 🏦 Vendedor Principal

**Email:** lovecosmetic23@gmail.com

### 🔐 Credenciais API

```
Token de Autenticação:
F16C5EDC1A054248814D449EA5495369

Chave Pública (Public Key):
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr+ZqgD892U9/HXsa7XqBZUayPquAfh9xx4iwUbTSUAvTlmiXFQNTp0Bvt/5vK2FhMj39qSv1zi2OuBjvW38q1E374nzx6NNBL5JosV0+SDINTlCG0cmigHuBOyWzYmjgca+mtQu4WczCaApNaSuVqgb8u7Bd9GCOL4YJotvV5+81frlSwQXralhwRzGhj/A57CGPgGKiuPT+AOGmykIGEZsSD9RKkyoKIoc0OS8CPIzdBOtTQCIwrLn2FxI83Clcg55W8gkFSOS6rWNbG5qFZWMll6yl02HtunalHmUlRUL66YeGXdMDC2PuRcmZbGO5a/2tbVppW6mfSWG3NPRpgwIDAQAB

API URL (Sandbox):
https://sandbox.api.pagseguro.com
```

### 📝 Configuração no .env

```env
PAGBANK_TOKEN_SANDBOX=F16C5EDC1A054248814D449EA5495369
NEXT_PUBLIC_PAGBANK_PUBLIC_KEY_SANDBOX=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr+ZqgD892U9/HXsa7XqBZUayPquAfh9xx4iwUbTSUAvTlmiXFQNTp0Bvt/5vK2FhMj39qSv1zi2OuBjvW38q1E374nzx6NNBL5JosV0+SDINTlCG0cmigHuBOyWzYmjgca+mtQu4WczCaApNaSuVqgb8u7Bd9GCOL4YJotvV5+81frlSwQXralhwRzGhj/A57CGPgGKiuPT+AOGmykIGEZsSD9RKkyoKIoc0OS8CPIzdBOtTQCIwrLn2FxI83Clcg55W8gkFSOS6rWNbG5qFZWMll6yl02HtunalHmUlRUL66YeGXdMDC2PuRcmZbGO5a/2tbVppW6mfSWG3NPRpgwIDAQAB
PAGBANK_API_URL=https://sandbox.api.pagseguro.com
```

### 🌐 Painel de Acesso

**URL:** https://sandbox.pagseguro.uol.com.br

**Login:** lovecosmetic23@gmail.com
**Senha:** (verificar com administrador)

---

## 👤 Vendedor Alternativo (Aplicação)

**Email:** v28541694563001983244@sandbox.pagseguro.com.br

### 🔐 Credenciais

```
Email: v28541694563001983244@sandbox.pagseguro.com.br
Senha: C63828142Mt3U11J

Chave Pública:
PUB21D327F285314AD589CB2F85E9E0F493

App ID: app1917528666
App Key: 4B50AA43F6F6FA1DD4CA5F937DD62285
```

### ⚠️ Nota

Este vendedor é criado automaticamente pelo PagBank para testes.
Recomendamos usar o **Vendedor Principal** (lovecosmetic23@gmail.com) por ser mais fácil de gerenciar.

---

## 🔄 Como a Chave Pública Foi Gerada

A chave pública do vendedor principal foi gerada automaticamente via API usando o script:

```bash
node scripts/get-public-key.js
```

Este script:
1. Consulta se já existe uma chave pública
2. Se não existir, cria uma nova via API
3. Retorna a chave para configurar no .env

---

## 📋 Checklist de Configuração

- [x] Token configurado no .env
- [x] Chave pública configurada no .env
- [x] API URL configurada
- [ ] Chave PIX cadastrada no painel (necessário para testes PIX)
- [ ] Webhook configurado (quando disponível)

---

## 🆘 Problemas com Credenciais?

### Token ou Chave Pública Inválidos

Se as credenciais não funcionarem:

1. Execute o script novamente:
   ```bash
   node scripts/get-public-key.js
   ```

2. Ou acesse o painel e gere novas credenciais:
   - https://sandbox.pagseguro.uol.com.br
   - Menu → Integrações → Credenciais

### Esqueceu a Senha?

- Acesse: https://pagseguro.uol.com.br/esqueci-senha
- Use o email: lovecosmetic23@gmail.com

---

**Última atualização:** 19/10/2025
**Status:** ✅ Credenciais validadas e funcionando
