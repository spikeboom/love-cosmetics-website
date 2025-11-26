/**
 * Types para integração com PagBank API Orders (Checkout Transparente)
 * Documentação: https://dev.pagbank.uol.com.br/reference/criar-pedido
 */

// ============= REQUEST TYPES =============

export interface PagBankCustomer {
  name: string;
  email: string;
  tax_id: string; // CPF sem formatação
  phones: PagBankPhone[];
}

export interface PagBankPhone {
  country: string; // "55" para Brasil
  area: string; // DDD
  number: string; // Número sem DDD
  type: "MOBILE" | "HOME" | "BUSINESS";
}

export interface PagBankItem {
  reference_id?: string;
  name: string;
  quantity: number;
  unit_amount: number; // valor em centavos (R$ 10,00 = 1000)
}

export interface PagBankAddress {
  street: string;
  number: string;
  complement?: string;
  locality: string; // bairro
  city: string;
  region_code: string; // estado (SP, RJ, etc)
  country: "BRA";
  postal_code: string; // CEP sem formatação
}

export interface PagBankShipping {
  address: PagBankAddress;
}

export interface PagBankAmount {
  value: number; // valor em centavos
  currency: "BRL";
}

// Pagamento com Cartão de Crédito
export interface PagBankCreditCardPayment {
  type: "CREDIT_CARD";
  installments: number;
  capture: boolean; // true para captura automática
  card: {
    encrypted: string; // cartão criptografado pelo SDK no frontend
  };
}

// Pagamento com PIX
export interface PagBankPixPayment {
  type: "PIX";
}

export interface PagBankCharge {
  reference_id: string;
  description: string;
  amount: PagBankAmount;
  payment_method: PagBankCreditCardPayment | PagBankPixPayment;
}

// Para pagamento com cartão
export interface PagBankOrderRequest {
  reference_id: string;
  customer: PagBankCustomer;
  items: PagBankItem[];
  shipping?: PagBankShipping;
  charges: PagBankCharge[];
  notification_urls: string[];
}

// Para pagamento com PIX
export interface PagBankPixOrderRequest {
  reference_id: string;
  customer: PagBankCustomer;
  items: PagBankItem[];
  qr_codes: Array<{
    amount: PagBankAmount;
    expiration_date?: string; // ISO 8601 format
  }>;
  notification_urls: string[];
}

// ============= RESPONSE TYPES =============

export interface PagBankOrderResponse {
  id: string; // ID do pedido no PagBank (ORDE_xxx)
  reference_id: string; // ID do pedido no seu sistema
  created_at: string; // ISO 8601
  customer: PagBankCustomer;
  items: PagBankItem[];
  charges?: PagBankChargeResponse[];
  qr_codes?: PagBankQRCodeResponse[];
  links: Array<{
    rel: string;
    href: string;
    media: string;
    type: string;
  }>;
}

export interface PagBankChargeResponse {
  id: string; // ID da cobrança (CHAR_xxx)
  reference_id: string;
  status: "AUTHORIZED" | "PAID" | "DECLINED" | "CANCELED" | "IN_ANALYSIS";
  created_at: string;
  paid_at?: string;
  description: string;
  amount: PagBankAmount;
  payment_response: {
    code: string;
    message: string;
  };
  payment_method: {
    type: "CREDIT_CARD" | "PIX";
    installments?: number;
    card?: {
      brand: string;
      first_digits: string;
      last_digits: string;
      exp_month: string;
      exp_year: string;
      holder: {
        name: string;
      };
    };
  };
}

export interface PagBankQRCodeResponse {
  id: string; // ID do QR Code (QRCO_xxx)
  expiration_date: string;
  amount: PagBankAmount;
  text: string; // Código PIX copiável (00020101021226...)
  arrangements: string[];
  links: Array<{
    rel: "QRCODE.PNG" | "QRCODE.BASE64";
    href: string; // URL da imagem do QR Code ou base64
    media: "image/png" | "image/jpeg";
    type: "GET";
  }>;
}

// ============= WEBHOOK TYPES =============

export interface PagBankWebhookNotification {
  id: string;
  reference_id: string;
  created_at: string;
  customer?: PagBankCustomer;
  items?: PagBankItem[];
  charges?: Array<{
    id: string;
    reference_id: string;
    status: "AUTHORIZED" | "PAID" | "DECLINED" | "CANCELED" | "IN_ANALYSIS";
    created_at: string;
    paid_at?: string;
    amount: PagBankAmount;
  }>;
}

// ============= ERROR TYPES =============

export interface PagBankError {
  error_messages: Array<{
    code: string;
    description: string;
    parameter_name?: string;
  }>;
}

// ============= FRONTEND TYPES =============

export interface CardFormData {
  holder: string; // Nome no cartão
  number: string; // Número do cartão
  expMonth: string; // Mês de validade (MM)
  expYear: string; // Ano de validade (YYYY)
  securityCode: string; // CVV
}

export interface EncryptedCardResult {
  encryptedCard?: string;
  hasErrors: boolean;
  errors?: any[];
}

// Declaração global do SDK PagBank
declare global {
  interface Window {
    PagSeguro?: {
      encryptCard(params: {
        publicKey: string;
        holder: string;
        number: string;
        expMonth: string;
        expYear: string;
        securityCode: string;
      }): EncryptedCardResult;
    };
  }
}
