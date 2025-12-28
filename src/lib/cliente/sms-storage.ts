// Armazenamento temporário de códigos de verificação SMS
// IMPORTANTE: Em produção, usar Redis ou banco de dados para persistência

// Formato: { cpf: { code: string, expiresAt: Date, attempts: number } }
export const codigosVerificacao = new Map<string, { code: string; expiresAt: Date; attempts: number }>();

// Formato: { token: { cpf: string, expiresAt: Date } }
export const tokensReset = new Map<string, { cpf: string; expiresAt: Date }>();

// Limpar códigos expirados periodicamente (a cada 5 minutos)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const agora = new Date();

    // Limpar códigos expirados
    for (const [cpf, registro] of codigosVerificacao.entries()) {
      if (registro.expiresAt < agora) {
        codigosVerificacao.delete(cpf);
      }
    }

    // Limpar tokens expirados
    for (const [token, registro] of tokensReset.entries()) {
      if (registro.expiresAt < agora) {
        tokensReset.delete(token);
      }
    }
  }, 5 * 60 * 1000);
}
