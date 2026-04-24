import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

vi.mock("@/utils/pagbank-config", () => ({
  getPagBankPublicKey: () => "PUBLIC_KEY_FAKE",
}));

import { usePagBankPayment } from "@/hooks/checkout/usePagBankPayment";

const cardData = {
  holder: "DAMARIS",
  number: "5555078513851300",
  expMonth: "10",
  expYear: "2034",
  securityCode: "123",
};

beforeEach(() => {
  global.fetch = vi.fn();
  // SDK PagSeguro injetado no window
  (window as any).PagSeguro = {
    encryptCard: vi.fn(() => ({
      hasErrors: false,
      encryptedCard: "enc-card-token",
    })),
  };
});

afterEach(() => {
  vi.useRealTimers();
});

describe("usePagBankPayment.encryptCard", () => {
  it("retorna o token quando SDK aceita o cartao", async () => {
    const { result } = renderHook(() => usePagBankPayment());
    let token: string | null = null;
    await act(async () => {
      token = await result.current.encryptCard(cardData);
    });
    expect(token).toBe("enc-card-token");
    expect(result.current.error).toBeNull();
  });

  it("retorna null e seta error quando SDK retorna hasErrors", async () => {
    (window as any).PagSeguro.encryptCard.mockReturnValue({
      hasErrors: true,
      errors: [{ message: "CVV invalido" }],
    });
    const { result } = renderHook(() => usePagBankPayment());
    let token: string | null = "x";
    await act(async () => {
      token = await result.current.encryptCard(cardData);
    });
    expect(token).toBeNull();
    expect(result.current.error).toMatch(/CVV/);
  });

  it("retorna null e error quando SDK PagSeguro nao foi carregado no window", async () => {
    delete (window as any).PagSeguro;
    const { result } = renderHook(() => usePagBankPayment());
    let token: string | null = "x";
    await act(async () => { token = await result.current.encryptCard(cardData); });
    expect(token).toBeNull();
    expect(result.current.error).toMatch(/SDK/i);
  });
});

describe("usePagBankPayment.createPixPayment", () => {
  it("retorna QR code data quando API aceita", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        orderId: "ORDE_PIX",
        qrCode: { text: "00020...", imageUrl: "https://qr.png", expirationDate: "2026-04-25" },
      }),
    });
    // Primeiro mock: checkOrderStatus
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, pedido: { isPaid: false } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          orderId: "ORDE_PIX",
          qrCode: { text: "00020...", imageUrl: "https://qr.png", expirationDate: "2026-04-25" },
        }),
      });

    const { result } = renderHook(() => usePagBankPayment());
    let r: any;
    await act(async () => { r = await result.current.createPixPayment("pedido-1"); });

    expect(r.success).toBe(true);
    expect(r.qrCode.text).toBe("00020...");
    expect(result.current.qrCodeData?.text).toBe("00020...");
  });

  it("aborta se pedido ja foi pago (evita duplicar Pix em pedido confirmado)", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, pedido: { isPaid: true } }),
    });
    const { result } = renderHook(() => usePagBankPayment());
    let r: any;
    await act(async () => { r = await result.current.createPixPayment("pedido-1"); });
    expect(r.success).toBe(false);
    expect(r.message).toMatch(/ja foi pago/i);
  });
});

describe("usePagBankPayment.startPaymentPolling — lifecycle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("PAID local resolve com onSuccess (sem chamar PagBank)", async () => {
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes("payment-status")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, status: "PAID" }),
        });
      }
      return Promise.reject(new Error("nao deveria chamar"));
    });

    const { result } = renderHook(() => usePagBankPayment());
    const onSuccess = vi.fn();
    const onError = vi.fn();

    act(() => {
      result.current.startPaymentPolling(
        { pedidoId: "p1", pagbankOrderId: "ORDE_X" },
        onSuccess,
        onError,
        100, // intervalMs
        10_000,
      );
    });

    // Avancar pra disparar o tick
    await act(async () => {
      await vi.advanceTimersByTimeAsync(150);
    });

    expect(onSuccess).toHaveBeenCalledOnce();
    expect(onError).not.toHaveBeenCalled();
  });

  it("DECLINED resolve com onError com mensagem de recusa", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, status: "DECLINED" }),
    });

    const { result } = renderHook(() => usePagBankPayment());
    const onSuccess = vi.fn();
    const onError = vi.fn();

    act(() => {
      result.current.startPaymentPolling(
        { pedidoId: "p1", pagbankOrderId: "ORDE_X" },
        onSuccess, onError, 100, 10_000,
      );
    });
    await act(async () => { await vi.advanceTimersByTimeAsync(150); });

    expect(onError).toHaveBeenCalledOnce();
    expect(onError.mock.calls[0][0]).toMatch(/recusado/i);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("timeout dispara onError quando ninguem resolveu", async () => {
    // Sempre PENDING
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, status: "AWAITING_PAYMENT" }),
    });

    const { result } = renderHook(() => usePagBankPayment());
    const onSuccess = vi.fn();
    const onError = vi.fn();

    act(() => {
      result.current.startPaymentPolling(
        { pedidoId: "p1", pagbankOrderId: "ORDE_X" },
        onSuccess, onError, 100, 1000, // 1s timeout
      );
    });

    await act(async () => { await vi.advanceTimersByTimeAsync(1100); });

    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0]).toMatch(/expirado/i);
  });

  it("stopPolling cancela ticks pendentes", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, status: "AWAITING_PAYMENT" }),
    });

    const { result } = renderHook(() => usePagBankPayment());
    const onSuccess = vi.fn();
    const onError = vi.fn();

    act(() => {
      result.current.startPaymentPolling(
        { pedidoId: "p1", pagbankOrderId: "ORDE_X" },
        onSuccess, onError, 100, 60_000,
      );
    });

    expect(result.current.checkingPayment).toBe(true);

    act(() => result.current.stopPolling());

    expect(result.current.checkingPayment).toBe(false);

    // Avancar tempo - nao deveria nem chamar
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });
});
