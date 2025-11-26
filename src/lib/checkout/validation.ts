import { z } from "zod";

// Validacao de CPF (checksum)
function validarCPF(cpf: string): boolean {
  const cpfLimpo = cpf.replace(/\D/g, "");

  if (cpfLimpo.length !== 11) return false;

  // Verificar se todos os digitos sao iguais
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;

  // Validar primeiro digito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo[i]) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo[9])) return false;

  // Validar segundo digito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo[i]) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo[10])) return false;

  return true;
}

// Validacao de telefone brasileiro
function validarTelefone(telefone: string): boolean {
  const telefoneLimpo = telefone.replace(/\D/g, "");
  // Aceita 10 ou 11 digitos (com ou sem 9)
  return telefoneLimpo.length >= 10 && telefoneLimpo.length <= 11;
}

// Validacao de CEP
function validarCEP(cep: string): boolean {
  const cepLimpo = cep.replace(/\D/g, "");
  return cepLimpo.length === 8;
}

// Validacao de data de nascimento (DD/MM/AAAA)
function validarDataNascimento(data: string): boolean {
  const partes = data.split("/");
  if (partes.length !== 3) return false;

  const [dia, mes, ano] = partes.map(Number);

  if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return false;
  if (dia < 1 || dia > 31) return false;
  if (mes < 1 || mes > 12) return false;
  if (ano < 1900 || ano > new Date().getFullYear()) return false;

  // Verificar data valida
  const dataObj = new Date(ano, mes - 1, dia);
  return (
    dataObj.getDate() === dia &&
    dataObj.getMonth() === mes - 1 &&
    dataObj.getFullYear() === ano
  );
}

// Schema de Identificacao
export const identificacaoSchema = z.object({
  cpf: z
    .string()
    .min(1, "CPF e obrigatorio")
    .refine((val) => validarCPF(val), "CPF invalido"),
  dataNascimento: z
    .string()
    .min(1, "Data de nascimento e obrigatoria")
    .refine((val) => validarDataNascimento(val), "Data de nascimento invalida"),
  nome: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .refine((val) => val.trim().includes(" "), "Informe nome e sobrenome"),
  email: z.string().email("E-mail invalido"),
  telefone: z
    .string()
    .min(1, "Telefone e obrigatorio")
    .refine((val) => validarTelefone(val), "Telefone invalido"),
});

// Schema de Entrega
export const entregaSchema = z.object({
  cep: z
    .string()
    .min(1, "CEP e obrigatorio")
    .refine((val) => validarCEP(val), "CEP invalido"),
  rua: z.string().min(3, "Rua e obrigatoria"),
  numero: z.string().optional(),
  semNumero: z.boolean().default(false),
  complemento: z.string().min(1, "Complemento e obrigatorio"),
  bairro: z.string().min(2, "Bairro e obrigatorio"),
  cidade: z.string().min(2, "Cidade e obrigatoria"),
  estado: z.string().min(2, "Estado e obrigatorio"),
  informacoesAdicionais: z.string().optional(),
  tipoEntrega: z.enum(["normal", "expressa"]),
});

// Schema de Cartao
export const cartaoSchema = z.object({
  numero: z
    .string()
    .min(1, "Numero do cartao e obrigatorio")
    .refine((val) => val.replace(/\s/g, "").length >= 13, "Numero do cartao invalido"),
  nome: z.string().min(3, "Nome no cartao e obrigatorio"),
  validade: z
    .string()
    .min(5, "Validade e obrigatoria")
    .regex(/^\d{2}\/\d{2}$/, "Formato invalido (MM/AA)"),
  cvv: z
    .string()
    .min(3, "CVV deve ter pelo menos 3 digitos")
    .max(4, "CVV deve ter no maximo 4 digitos"),
  parcelas: z.number().min(1).max(12),
});

// Tipos inferidos dos schemas
export type IdentificacaoData = z.infer<typeof identificacaoSchema>;
export type EntregaData = z.infer<typeof entregaSchema>;
export type CartaoData = z.infer<typeof cartaoSchema>;

// Funcoes de validacao para uso direto
export const validacoes = {
  cpf: validarCPF,
  telefone: validarTelefone,
  cep: validarCEP,
  dataNascimento: validarDataNascimento,
};
