// Armazenamento temporário de códigos de verificação SMS
// IMPORTANTE: Em produção, usar Redis ou banco de dados para persistência
// NOTA: Tokens de reset de senha são armazenados no banco (TokenRecuperacao)

// Formato: { cpf: { code: string, expiresAt: Date, attempts: number } }
export const codigosVerificacao = new Map<string, { code: string; expiresAt: Date; attempts: number }>();

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
  }, 5 * 60 * 1000);
}
