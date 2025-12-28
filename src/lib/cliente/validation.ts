import { z } from 'zod';

// Validação de CPF brasileiro
function isValidCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit > 9) digit = 0;
  if (parseInt(cleanCPF.charAt(9)) !== digit) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit > 9) digit = 0;
  if (parseInt(cleanCPF.charAt(10)) !== digit) return false;
  
  return true;
}

// Schema personalizado para CPF
const cpfSchema = z.string()
  .min(11, 'CPF deve ter 11 dígitos')
  .refine(isValidCPF, 'CPF inválido')
  .transform(val => val.replace(/\D/g, ''));

// Schema personalizado para telefone brasileiro
const telefoneSchema = z.string()
  .min(10, 'Telefone deve ter pelo menos 10 dígitos')
  .max(15, 'Telefone muito longo')
  .transform(val => val.replace(/\D/g, ''))
  .refine(val => {
    // Aceita telefone fixo (10 dígitos) ou celular (11 dígitos)
    return val.length === 10 || val.length === 11;
  }, 'Telefone inválido');

// Schema para cadastro de cliente
export const cadastroClienteSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  
  nome: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome muito longo')
    .trim(),
  
  sobrenome: z.string()
    .min(2, 'Sobrenome deve ter pelo menos 2 caracteres')
    .max(50, 'Sobrenome muito longo')
    .trim(),
  
  password: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha muito longa'),
  
  passwordConfirm: z.string(),

  cpf: cpfSchema, // CPF obrigatório (identificador único)

  telefone: telefoneSchema.optional().nullable(),
  
  data_nascimento: z.string()
    .optional()
    .nullable()
    .refine((val) => {
      if (!val) return true; // Campo opcional
      // Aceita formato DD/MM/AAAA
      const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      if (!regex.test(val)) return false;
      
      const [, dia, mes, ano] = val.match(regex) || [];
      const date = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      
      // Verifica se é uma data válida
      if (date.getDate() !== parseInt(dia) || 
          date.getMonth() !== parseInt(mes) - 1 || 
          date.getFullYear() !== parseInt(ano)) {
        return false;
      }
      
      // Verifica se não é uma data futura
      if (date > new Date()) return false;
      
      // Verifica idade mínima (opcional - 13 anos)
      const hoje = new Date();
      const idade = hoje.getFullYear() - date.getFullYear();
      if (idade < 13) return false;
      
      return true;
    }, 'Data de nascimento inválida'),
  
  receberWhatsapp: z.boolean().default(false),
  receberEmail: z.boolean().default(true),
  
  // Campos opcionais de endereço (podem ser preenchidos depois)
  cep: z.string()
    .optional()
    .nullable()
    .refine((val) => {
      if (!val) return true;
      const cleanCEP = val.replace(/\D/g, '');
      return cleanCEP.length === 8;
    }, 'CEP deve ter 8 dígitos'),
    
  endereco: z.string()
    .min(3, 'Endereço muito curto')
    .max(100, 'Endereço muito longo')
    .optional()
    .nullable(),
    
  numero: z.string()
    .max(10, 'Número muito longo')
    .optional()
    .nullable(),
    
  complemento: z.string()
    .max(50, 'Complemento muito longo')
    .optional()
    .nullable(),
    
  bairro: z.string()
    .min(2, 'Bairro muito curto')
    .max(50, 'Bairro muito longo')
    .optional()
    .nullable(),
    
  cidade: z.string()
    .min(2, 'Cidade muito curta')
    .max(50, 'Cidade muito longa')
    .optional()
    .nullable(),
    
  estado: z.string()
    .length(2, 'Estado deve ter 2 letras')
    .toUpperCase()
    .optional()
    .nullable(),
}).refine(data => data.password === data.passwordConfirm, {
  message: 'As senhas não coincidem',
  path: ['passwordConfirm']
});

// Schema para login com email
export const loginClienteSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .toLowerCase()
    .trim(),

  password: z.string()
    .min(1, 'Senha é obrigatória'),

  remember: z.boolean().default(false)
});

// Schema para login com CPF
export const loginCpfSchema = z.object({
  cpf: cpfSchema,

  password: z.string()
    .min(1, 'Senha é obrigatória'),

  remember: z.boolean().default(false)
});

// Schema para cadastro pós-checkout (criar conta após compra)
export const cadastroPosCheckoutSchema = z.object({
  pedidoId: z.string()
    .min(1, 'ID do pedido é obrigatório'),

  password: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha muito longa'),

  passwordConfirm: z.string(),

  receberComunicacoes: z.boolean().default(false),
}).refine(data => data.password === data.passwordConfirm, {
  message: 'As senhas não coincidem',
  path: ['passwordConfirm']
});

// Schema para atualização de dados pessoais
export const atualizarDadosSchema = z.object({
  nome: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome muito longo')
    .trim()
    .optional(),
  
  sobrenome: z.string()
    .min(2, 'Sobrenome deve ter pelo menos 2 caracteres')
    .max(50, 'Sobrenome muito longo')
    .trim()
    .optional(),
  
  cpf: cpfSchema.optional().nullable(),
  
  telefone: telefoneSchema.optional().nullable(),
  
  receberWhatsapp: z.boolean().optional(),
  receberEmail: z.boolean().optional(),
});

// Schema para atualização de endereço
export const atualizarEnderecoSchema = z.object({
  cep: z.string()
    .length(8, 'CEP deve ter 8 dígitos')
    .regex(/^\d{8}$/, 'CEP deve conter apenas números'),
  
  endereco: z.string()
    .min(3, 'Endereço muito curto')
    .max(100, 'Endereço muito longo'),
  
  numero: z.string()
    .min(1, 'Número é obrigatório')
    .max(10, 'Número muito longo'),
  
  complemento: z.string()
    .max(50, 'Complemento muito longo')
    .optional()
    .nullable(),
  
  bairro: z.string()
    .min(2, 'Bairro muito curto')
    .max(50, 'Bairro muito longo'),
  
  cidade: z.string()
    .min(2, 'Cidade muito curta')
    .max(50, 'Cidade muito longa'),
  
  estado: z.string()
    .length(2, 'Estado deve ter 2 letras')
    .toUpperCase(),
});

// Schema para alteração de senha
export const alterarSenhaSchema = z.object({
  senhaAtual: z.string()
    .min(1, 'Senha atual é obrigatória'),
  
  novaSenha: z.string()
    .min(6, 'Nova senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha muito longa'),
  
  confirmarSenha: z.string(),
}).refine(data => data.novaSenha === data.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha']
});

// Schema para recuperação de senha (solicitar)
export const recuperarSenhaSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .toLowerCase()
    .trim(),
});

// Schema para reset de senha (com token)
export const resetSenhaSchema = z.object({
  token: z.string()
    .min(1, 'Token é obrigatório'),
  
  novaSenha: z.string()
    .min(6, 'Nova senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha muito longa'),
  
  confirmarSenha: z.string(),
}).refine(data => data.novaSenha === data.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha']
});

// Tipos TypeScript inferidos dos schemas
export type CadastroClienteInput = z.infer<typeof cadastroClienteSchema>;
export type LoginClienteInput = z.infer<typeof loginClienteSchema>;
export type LoginCpfInput = z.infer<typeof loginCpfSchema>;
export type CadastroPosCheckoutInput = z.infer<typeof cadastroPosCheckoutSchema>;
export type AtualizarDadosInput = z.infer<typeof atualizarDadosSchema>;
export type AtualizarEnderecoInput = z.infer<typeof atualizarEnderecoSchema>;
export type AlterarSenhaInput = z.infer<typeof alterarSenhaSchema>;
export type RecuperarSenhaInput = z.infer<typeof recuperarSenhaSchema>;
export type ResetSenhaInput = z.infer<typeof resetSenhaSchema>;

// Validadores auxiliares exportados
export const validators = {
  isValidCPF,
  
  isValidEmail: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  isValidPhone: (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length === 10 || cleanPhone.length === 11;
  },
  
  isValidCEP: (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');
    return cleanCEP.length === 8;
  },
  
  formatCPF: (cpf: string) => {
    const clean = cpf.replace(/\D/g, '');
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  },
  
  formatPhone: (phone: string) => {
    const clean = phone.replace(/\D/g, '');
    if (clean.length === 11) {
      return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  },
  
  formatCEP: (cep: string) => {
    const clean = cep.replace(/\D/g, '');
    return clean.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
};