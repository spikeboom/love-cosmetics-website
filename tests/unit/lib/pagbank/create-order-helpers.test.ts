import { describe, it, expect } from "vitest";
import { buildOrderUpdateData } from "@/lib/pagbank/create-order";

describe("buildOrderUpdateData - PIX", () => {
  it("popula campos do QR e marca AWAITING_PAYMENT", () => {
    const data = buildOrderUpdateData({
      paymentMethod: "pix",
      orderResponse: {
        id: "ORDE_PIX",
        qr_codes: [
          {
            id: "QRCO_1",
            expiration_date: "2026-04-25T10:00:00-03:00",
            amount: { value: 22552, currency: "BRL" },
            text: "00020101021226...",
            arrangements: ["PIX"],
            links: [
              { rel: "QRCODE.PNG", href: "https://pagbank/qr.png", media: "image/png", type: "GET" },
              { rel: "QRCODE.BASE64", href: "data:...", media: "image/png", type: "GET" },
            ],
          },
        ],
      } as any,
    });

    expect(data.pagbank_order_id).toBe("ORDE_PIX");
    expect(data.payment_method).toBe("pix");
    expect(data.pix_qr_code).toBe("00020101021226...");
    expect(data.pix_qr_code_url).toBe("https://pagbank/qr.png");
    expect(data.pix_expiration).toBe("2026-04-25T10:00:00-03:00");
    expect(data.status_pagamento).toBe("AWAITING_PAYMENT");
  });

  it("PIX sem qr_codes nao seta campos PIX", () => {
    const data = buildOrderUpdateData({
      paymentMethod: "pix",
      orderResponse: { id: "ORDE_X", qr_codes: [] } as any,
    });
    expect(data.pix_qr_code).toBeUndefined();
    expect(data.status_pagamento).toBeUndefined();
  });
});

describe("buildOrderUpdateData - cartao PAID", () => {
  it("popula card info e status, sem pagbank_error", () => {
    const data = buildOrderUpdateData({
      paymentMethod: "credit_card",
      orderResponse: {
        id: "ORDE_OK",
        charges: [
          {
            id: "CHAR_OK",
            status: "PAID",
            payment_response: { code: "20000", message: "SUCESSO" },
            payment_method: {
              type: "CREDIT_CARD",
              card: {
                brand: "mastercard",
                first_digits: "555507",
                last_digits: "8513",
                exp_month: "10",
                exp_year: "2034",
                holder: { name: "DAMARIS SANTOS" },
              },
            },
          },
        ],
      } as any,
    });

    expect(data.pagbank_charge_id).toBe("CHAR_OK");
    expect(data.status_pagamento).toBe("PAID");
    const card = JSON.parse(data.payment_card_info);
    expect(card).toEqual({
      brand: "mastercard",
      first_digits: "555507",
      last_digits: "8513",
    });
    // PAID NUNCA deve gravar pagbank_error
    expect(data.pagbank_error).toBeUndefined();
  });
});

describe("buildOrderUpdateData - cartao DECLINED", () => {
  it("persiste payment_response em pagbank_error para diagnostico", () => {
    const paymentResponse = {
      code: "20003",
      message: "NAO AUTORIZADA",
      reference: "042475146206",
      raw_data: { reason_code: "51", nsu: "042475146206", authorization_code: "8633" },
    };

    const data = buildOrderUpdateData({
      paymentMethod: "credit_card",
      orderResponse: {
        id: "ORDE_FAIL",
        charges: [
          {
            id: "CHAR_FAIL",
            status: "DECLINED",
            payment_response: paymentResponse,
            payment_method: {
              type: "CREDIT_CARD",
              card: { brand: "mastercard", first_digits: "555507", last_digits: "8513" },
            },
          },
        ],
      } as any,
    });

    expect(data.status_pagamento).toBe("DECLINED");
    expect(data.pagbank_error).toBeTruthy();
    const parsed = JSON.parse(data.pagbank_error);
    expect(parsed).toEqual(paymentResponse);
  });

  it("DECLINED sem payment_response nao quebra (nao seta pagbank_error)", () => {
    const data = buildOrderUpdateData({
      paymentMethod: "credit_card",
      orderResponse: {
        id: "ORDE_X",
        charges: [{ id: "CHAR_X", status: "DECLINED" }],
      } as any,
    });

    expect(data.status_pagamento).toBe("DECLINED");
    expect(data.pagbank_error).toBeUndefined();
  });
});

describe("buildOrderUpdateData - sem charge", () => {
  it("retorna so campos basicos quando nao ha charges", () => {
    const data = buildOrderUpdateData({
      paymentMethod: "credit_card",
      orderResponse: { id: "ORDE_NIL", charges: [] } as any,
    });
    expect(data.pagbank_order_id).toBe("ORDE_NIL");
    expect(data.payment_method).toBe("credit_card");
    expect(data.pagbank_charge_id).toBeUndefined();
    expect(data.status_pagamento).toBeUndefined();
  });
});
