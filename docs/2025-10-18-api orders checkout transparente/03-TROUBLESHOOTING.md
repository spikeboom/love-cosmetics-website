# 🔧 Troubleshooting - Erro no Pagamento

## Erro: "Erro ao processar cartão: [object Object]"

Este erro geralmente acontece quando o SDK do PagBank retorna erros que não estão sendo formatados corretamente.

### ✅ Correções Aplicadas

Já corrigi o código para:
1. ✅ Melhorar tratamento de erros do SDK
2. ✅ Adicionar logs detalhados no console
3. ✅ Validar formato de mês/ano antes de enviar
4. ✅ Adicionar painel de debug (apenas em desenvolvimento)

### 🔍 Como Debugar

**1. Abra o Console do Navegador:**
- Pressione `F12` ou clique com botão direito → "Inspecionar"
- Vá na aba "Console"

**2. Preencha o formulário novamente**

**3. Observe as mensagens no console:**

Você verá algo assim:
```
Iniciando criptografia do cartão... {
  publicKey: "PUB21D327F...",
  holder: "TESTE",
  numberLength: 16,
  expMonth: "12",
  expYear: "2030",
  cvvLength: 3
}

Resultado da criptografia: {
  hasErrors: true/false,
  errors: [...],
  hasEncryptedCard: true/false
}
```

**4. Se `hasErrors: true`, veja o array `errors`** - ele mostrará o problema real

### 🎯 Problemas Comuns e Soluções

#### Problema 1: SDK não está carregado
```
Console: "window.PagSeguro não está disponível"
```

**Solução:**
1. Verificar se o script está no `<head>` do `layout.tsx`
2. Limpar cache: `Ctrl + Shift + R`
3. Reiniciar servidor: `Ctrl + C` e `npm run dev`
4. Verificar se não há bloqueador de ads/scripts

#### Problema 2: Chave pública inválida
```
Console: "Chave pública não encontrada"
```

**Solução:**
1. Verificar `.env` tem: `NEXT_PUBLIC_PAGBANK_PUBLIC_KEY_SANDBOX`
2. Reiniciar servidor (importante!)
3. Verificar se variável começa com `NEXT_PUBLIC_`

#### Problema 3: Formato de data inválido
```
Console: "expMonth" ou "expYear" inválido
```

**Solução:**
- Mês deve ter **2 dígitos**: `01`, `02`, ..., `12`
- Ano deve ter **4 dígitos**: `2025`, `2030`, etc
- Digite no formato: `MM/AAAA`
- Exemplo: `12/2030`

#### Problema 4: Número de cartão inválido
```
Console: Erro de validação no número do cartão
```

**Solução - Use cartões de teste válidos:**
```
✅ APROVADO: 4111 1111 1111 1111
✅ APROVADO: 4539 6206 5992 2097
❌ RECUSADO: 3729 3800 1199 778
```

### 📝 Passo a Passo para Testar

**1. Limpar tudo e começar do zero:**
```bash
# Parar servidor (Ctrl+C)
# Limpar cache
Ctrl + Shift + Delete

# Reiniciar servidor
npm run dev
```

**2. Abrir o site em Aba Anônima:**
- `Ctrl + Shift + N` (Chrome)
- Isso evita problemas de cache

**3. Fazer pedido com dados de teste:**

```
Cartão: 4111 1111 1111 1111
Nome: TESTE APROVADO
Validade: Digite "12/2030" (ou clique e digite: 122030)
CVV: 123
Parcelas: 1x
```

**4. Antes de clicar em "Finalizar", abrir F12 → Console**

**5. Clicar em "Finalizar Pagamento"**

**6. Ver mensagens no console:**

### ✅ Se der certo, você verá:

```
Iniciando criptografia do cartão...
Resultado da criptografia: {
  hasErrors: false,
  hasEncryptedCard: true
}
```

### ❌ Se der erro, você verá detalhes no console:

```
Erros do SDK PagBank: [
  { message: "Descrição do erro real" }
]
```

**Copie e cole o erro aqui para investigarmos!**

### 🔬 Painel de Debug

Durante o desenvolvimento, você verá um painel cinza mostrando:
```
Debug: Mês: 12 (2 dígitos) | Ano: 2030 (4 dígitos)
```

**Isso ajuda a ver se os dados estão sendo capturados corretamente.**

### 🆘 Se Nada Funcionar

**Teste direto no console do navegador:**

1. Abra F12 → Console
2. Cole este código:

```javascript
// Verificar se SDK está carregado
console.log("SDK PagSeguro:", window.PagSeguro);

// Verificar chave pública
console.log("Chave pública:", process.env.NEXT_PUBLIC_PAGBANK_PUBLIC_KEY_SANDBOX);

// Testar criptografia manual
if (window.PagSeguro) {
  const result = window.PagSeguro.encryptCard({
    publicKey: "PUB21D327F285314AD589CB2F85E9E0F493",
    holder: "TESTE",
    number: "4111111111111111",
    expMonth: "12",
    expYear: "2030",
    securityCode: "123"
  });
  console.log("Resultado:", result);
}
```

**Se isso funcionar, o problema está no componente React. Se não funcionar, o problema é o SDK.**

### 📋 Checklist de Verificação

Antes de pedir ajuda, verifique:

- [ ] Servidor rodando (`npm run dev`)
- [ ] Console do navegador aberto (F12)
- [ ] Sem erros no console ao carregar página
- [ ] Script do PagBank carregando (Network tab)
- [ ] `.env` tem `NEXT_PUBLIC_PAGBANK_PUBLIC_KEY_SANDBOX`
- [ ] Servidor foi reiniciado após alterar `.env`
- [ ] Usando cartão de teste válido
- [ ] Formato de data correto (MM/AAAA)
- [ ] Testando em aba anônima (sem cache)

### 💡 Dica Final

O erro `[object Object]` acontece quando tentamos converter um objeto JavaScript para string sem formatação adequada.

**Agora o código está corrigido** para mostrar a mensagem de erro real do SDK!

Se ainda estiver vendo `[object Object]`, significa que o SDK está retornando algo inesperado. Nesse caso:

1. Copie TODO o conteúdo do console (Ctrl+A no console → Ctrl+C)
2. Cole aqui para investigarmos juntos!

---

**Última atualização:** 19/10/2025
