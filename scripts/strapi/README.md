# Scripts Strapi

Scripts utilitários para interagir com a API do Strapi e sincronização com Bling.

## 📂 Categorias

### 🔍 Consulta de Dados
- [get-produtos.js](#get-produtosjs) - Busca produtos do Strapi
- [get-dimensoes-bling.js](#get-dimensoes-blingjs) - Lista dimensões e códigos Bling

### 🔄 Sincronização Bling ↔ Strapi
- [sync-bling-to-strapi.js](#sync-bling-to-strapijs) - Mapeia produtos Bling para Strapi
- [update-strapi-bling-numbers.js](#update-strapi-bling-numbersjs) - Atualiza bling_number no Strapi

### 📊 Importação de Planilhas Excel
- [read-excel-dimensions.js](#read-excel-dimensionsjs) - Lê dimensões da planilha
- [update-dimensions-from-excel.js](#update-dimensions-from-exceljs) - Atualiza dimensões no Strapi
- [copy-planilha.ps1](#copy-planilhaps1) - Copia planilha para o projeto

### 📁 Arquivos de Dados
- `excel-data.json` - Dados exportados da planilha Excel
- `mapping-result.json` - Resultado do mapeamento Bling ↔ Strapi
- `planilha-produtos.xlsx` - Planilha com dimensões dos produtos

---

## 🔍 Consulta de Dados

### get-produtos.js

Busca produtos do Strapi via API.

**Uso:**
```bash
node scripts/strapi/get-produtos.js
```

**O que faz:**
- Lê credenciais do arquivo `.env`
- Faz requisição GET para `/api/produtos`
- Lista os primeiros 10 produtos com ID, nome e preço
- Retorna resposta completa em JSON

**Variáveis necessárias (.env):**
- `NEXT_PUBLIC_STRAPI_URL` - URL base do Strapi
- `STRAPI_API_TOKEN` - Token de autenticação

**Saída:**
- IDs dos produtos (ex: 266, 267, 268...)
- Campos: `nome`, `slug`, `preco`, `preco_de`, `unidade`, `descricaoResumida`
- Resposta JSON completa formatada

---

### get-dimensoes-bling.js

Busca produtos do Strapi e exibe dimensões e código Bling.

**Uso:**
```bash
node scripts/strapi/get-dimensoes-bling.js
```

**O que faz:**
- Lista produtos com `bling_number`, `largura`, `altura`, `comprimento`, `peso_gramas`
- Mostra campos disponíveis no schema

---

## 🔄 Sincronização Bling ↔ Strapi

### sync-bling-to-strapi.js

Sincroniza produtos do Bling para Strapi (mapeia por nome).

**Uso:**
```bash
node scripts/strapi/sync-bling-to-strapi.js
```

**O que faz:**
1. Busca token ativo do Bling no banco de dados (Prisma)
2. Lista todos os produtos do Bling via API v3
3. Lista todos os produtos do Strapi
4. Mapeia produtos por similaridade de nome (>80%)
5. Salva resultado em `mapping-result.json`

**Saída:**
- `mapping-result.json` - arquivo com mapeamento Strapi ↔ Bling
- Produtos mapeados com dimensões e códigos

---

### update-strapi-bling-numbers.js

Atualiza campo `bling_number` no Strapi com base no mapeamento.

**Uso:**
```bash
node scripts/strapi/update-strapi-bling-numbers.js
```

**O que faz:**
1. Lê `mapping-result.json`
2. Atualiza cada produto no Strapi com o `bling_number` correspondente
3. Aguarda 500ms entre requisições para não sobrecarregar a API

**Resultado:**
- 5 produtos atualizados com sucesso:
  - Manteiga Corporal (ID: 16341911314)
  - Máscara de Argila (ID: 16341911315)
  - Sérum Facial (ID: 16341911316)
  - Espuma Facial (ID: 16341911311)
  - Hidratante Facial (ID: 16341911312)

---

## 📊 Importação de Planilhas Excel

### read-excel-dimensions.js

Lê e analisa planilha Excel com dimensões dos produtos.

**Uso:**
```bash
node scripts/strapi/read-excel-dimensions.js
```

**O que faz:**
- Lê arquivo `planilha-produtos.xlsx`
- Converte dados para JSON
- Mostra estrutura das colunas
- Salva em `excel-data.json`

---

### update-dimensions-from-excel.js

Atualiza dimensões e peso no Strapi a partir da planilha Excel.

**Uso:**
```bash
node scripts/strapi/update-dimensions-from-excel.js
```

**O que faz:**
1. Lê `planilha-produtos.xlsx`
2. Busca produtos do Strapi
3. Mapeia por nome (com normalização)
4. Atualiza `largura`, `altura`, `comprimento`, `peso_gramas`
5. Converte mm → cm automaticamente

**Resultado:**
- 5 produtos atualizados com dimensões da planilha

---

### copy-planilha.ps1

Script PowerShell para copiar planilha Excel para o projeto.

**Uso:**
```powershell
powershell -ExecutionPolicy Bypass -File scripts/strapi/copy-planilha.ps1
```

**O que faz:**
- Busca arquivo com "*PLANILHA*" no nome em `Documents`
- Copia para `scripts/strapi/planilha-produtos.xlsx`

---

## 🔧 Fluxos Completos

### Fluxo Completo de Sincronização Bling

```bash
# 1. Mapear produtos Bling → Strapi
node scripts/strapi/sync-bling-to-strapi.js

# 2. Atualizar bling_number no Strapi
node scripts/strapi/update-strapi-bling-numbers.js

# 3. Verificar atualização
node scripts/strapi/get-dimensoes-bling.js
```

---

### Fluxo Completo de Importação de Planilha Excel

```bash
# 1. Copiar planilha para o projeto (Windows)
powershell -ExecutionPolicy Bypass -File scripts/strapi/copy-planilha.ps1

# 2. Ler e verificar estrutura da planilha
node scripts/strapi/read-excel-dimensions.js

# 3. Atualizar dimensões no Strapi
node scripts/strapi/update-dimensions-from-excel.js

# 4. Verificar atualização
node scripts/strapi/get-dimensoes-bling.js
```

---

## 📝 Notas

- **Dimensões no Bling**: Estão vazias no ERP - precisam ser preenchidas manualmente
- **Dimensões na Planilha**: Foram importadas com sucesso (5 produtos)
- **Cache**: Scripts usam cache de 5 minutos para reduzir requisições
- **Mapeamento**: Produtos são mapeados por similaridade de nome (>80%)
