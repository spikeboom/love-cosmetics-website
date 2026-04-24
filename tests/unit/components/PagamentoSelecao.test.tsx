import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// =====================================================================
// Mocks de modulos pesados — nao queremos render real do stepper, image,
// resumo, etc. So queremos exercitar o flow de pagamento.
// =====================================================================
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img alt={props.alt} src={props.src} />,
}));

vi.mock(
  "@/app/(figma)/(checkout)/figma/checkout/CheckoutStepper",
  () => ({
    CheckoutStepper: () => <div data-testid="stepper" />,
  }),
);

vi.mock(
  "@/app/(figma)/(checkout)/figma/checkout/pagamento/components/BotaoVoltar",
  () => ({
    BotaoVoltar: ({ onClick }: any) => <button onClick={onClick}>Voltar</button>,
  }),
);

vi.mock(
  "@/app/(figma)/(checkout)/figma/checkout/pagamento/components/PagamentoResumo",
  () => ({
    PagamentoResumo: () => <div data-testid="resumo" />,
  }),
);

// Hook mock — controlado por test ref pra cada cenario.
const hookState: {
  encryptCard: ReturnType<typeof vi.fn>;
  createCardPayment: ReturnType<typeof vi.fn>;
  startPaymentPolling: ReturnType<typeof vi.fn>;
} = {
  encryptCard: vi.fn(),
  createCardPayment: vi.fn(),
  startPaymentPolling: vi.fn(),
};

vi.mock("@/hooks/checkout", () => ({
  usePagBankPayment: () => ({
    loading: false,
    checkingPayment: false,
    error: null,
    publicKey: "PUBLIC_KEY_FAKE",
    qrCodeData: null,
    encryptCard: hookState.encryptCard,
    createCardPayment: hookState.createCardPayment,
    createPixPayment: vi.fn(),
    startPaymentPolling: hookState.startPaymentPolling,
    stopPolling: vi.fn(),
    checkOrderStatus: vi.fn(),
    clearError: vi.fn(),
  }),
}));

// Import APOS mocks
import { PagamentoSelecao } from "@/app/(figma)/(checkout)/figma/checkout/pagamento/components/PagamentoSelecao";

const baseProps = {
  valorTotal: 225.52,
  formatPrice: (v: number) => `R$ ${v.toFixed(2)}`,
  onSelecionarPix: vi.fn(),
  onSelecionarCartao: vi.fn(),
  onVoltar: vi.fn(),
  resumoProps: {} as any,
};

async function preencherCartao() {
  const user = userEvent.setup();
  // Abre accordion do cartao
  await user.click(screen.getByRole("button", { name: /cartao de credito/i }));

  // Os labels do PagamentoSelecao nao tem htmlFor associado, entao usamos
  // o text input por ordem (numero, nome) e placeholders quando disponiveis.
  const inputs = document.querySelectorAll<HTMLInputElement>("input[type='text']");
  // Layout: [0] numero, [1] nome, [2] validade, [3] cvv
  await user.type(inputs[0], "4929291898380766");
  await user.type(inputs[1], "TESTE SANDBOX");
  await user.type(inputs[2], "1226");
  await user.type(inputs[3], "123");
  return user;
}

beforeEach(() => {
  hookState.encryptCard.mockReset();
  hookState.createCardPayment.mockReset();
  hookState.startPaymentPolling.mockReset();
  hookState.encryptCard.mockResolvedValue("encrypted-card-token");
});

describe("PagamentoSelecao - flow DECLINED sincrono", () => {
  it("DECLINED na resposta sincrona NAO entra em polling e dispara onDeclined", async () => {
    hookState.createCardPayment.mockResolvedValue({
      success: true,
      orderId: "ORDE_X",
      chargeId: "CHAR_X",
      status: "DECLINED",
      paymentResponse: {
        code: "20003",
        message: "NAO AUTORIZADA",
        reference: "042475146206",
        raw_data: { reason_code: "51" },
      },
    });

    const onDeclined = vi.fn();
    const onSuccess = vi.fn();

    render(
      <PagamentoSelecao
        {...baseProps}
        pedidoId="pedido-1"
        onSuccess={onSuccess}
        onDeclined={onDeclined}
      />,
    );

    // useEffect dispara automaticamente assim que pedidoId existir + selected=cartao + cartao preenchido.
    // Como sem cartao preenchido o useEffect nao dispara, o teste preenche e clica em Finalizar.
    const user = await preencherCartao();
    await user.click(screen.getByRole("button", { name: /finalizar compra/i }));

    await waitFor(() => expect(hookState.createCardPayment).toHaveBeenCalledOnce());
    await waitFor(() => expect(onDeclined).toHaveBeenCalledOnce());

    expect(onDeclined).toHaveBeenCalledWith(
      expect.objectContaining({
        pedidoId: "pedido-1",
        paymentResponse: expect.objectContaining({ code: "20003" }),
      }),
    );
    expect(hookState.startPaymentPolling).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("PAID dispara onSuccess imediatamente", async () => {
    hookState.createCardPayment.mockResolvedValue({
      success: true,
      orderId: "ORDE_OK",
      chargeId: "CHAR_OK",
      status: "PAID",
    });
    const onSuccess = vi.fn();
    const onDeclined = vi.fn();

    render(
      <PagamentoSelecao
        {...baseProps}
        pedidoId="pedido-1"
        onSuccess={onSuccess}
        onDeclined={onDeclined}
      />,
    );

    const user = await preencherCartao();
    await user.click(screen.getByRole("button", { name: /finalizar compra/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
    expect(hookState.startPaymentPolling).not.toHaveBeenCalled();
    expect(onDeclined).not.toHaveBeenCalled();
  });

  it("IN_ANALYSIS cai no polling padrao", async () => {
    hookState.createCardPayment.mockResolvedValue({
      success: true,
      orderId: "ORDE_PEND",
      chargeId: "CHAR_PEND",
      status: "IN_ANALYSIS",
    });

    render(
      <PagamentoSelecao
        {...baseProps}
        pedidoId="pedido-1"
        onSuccess={vi.fn()}
        onError={vi.fn()}
      />,
    );

    const user = await preencherCartao();
    await user.click(screen.getByRole("button", { name: /finalizar compra/i }));

    await waitFor(() => expect(hookState.startPaymentPolling).toHaveBeenCalledOnce());
  });
});

describe("PagamentoSelecao - COUPON_UNAVAILABLE", () => {
  it("dispara onCouponUnavailable com cupom + totais", async () => {
    hookState.createCardPayment.mockResolvedValue({
      success: false,
      message: "Cupom indisponivel",
      errorCode: "COUPON_UNAVAILABLE",
      errorDetails: { cupom: "PRIMEIRA10", novo_total: 250.6, total_atual: 225.52 },
    });

    const onCouponUnavailable = vi.fn();
    render(
      <PagamentoSelecao
        {...baseProps}
        pedidoId="pedido-1"
        onCouponUnavailable={onCouponUnavailable}
      />,
    );

    const user = await preencherCartao();
    await user.click(screen.getByRole("button", { name: /finalizar compra/i }));

    await waitFor(() => expect(onCouponUnavailable).toHaveBeenCalledOnce());
    expect(onCouponUnavailable).toHaveBeenCalledWith({
      cupom: "PRIMEIRA10",
      novoTotal: 250.6,
      totalAtual: 225.52,
    });
  });
});

describe("PagamentoSelecao - regressao do bug de retentativa", () => {
  it("Finalizar Compra dispara nova tentativa quando pedidoId ja existe", async () => {
    // Cenario: cliente ja teve uma recusa, modal foi fechado, vai tentar de novo.
    // Antes do fix, o useEffect nao re-disparava (pedidoId nao mudou) e o
    // botao virava no-op. Agora ele chama processCardPayment direto.
    hookState.createCardPayment.mockResolvedValueOnce({
      success: true,
      orderId: "ORDE_1",
      status: "DECLINED",
      paymentResponse: { code: "20003", message: "NAO AUTORIZADA" },
    });

    const onDeclined = vi.fn();
    const { rerender } = render(
      <PagamentoSelecao
        {...baseProps}
        pedidoId="pedido-1"
        onDeclined={onDeclined}
      />,
    );

    const user = await preencherCartao();
    await user.click(screen.getByRole("button", { name: /finalizar compra/i }));
    await waitFor(() => expect(onDeclined).toHaveBeenCalledTimes(1));

    // 2a tentativa: novo cartao (dados nao mudam pra simplificar) e o pedidoId
    // continua sendo "pedido-1". Antes do fix isso nao acontecia nada.
    hookState.createCardPayment.mockResolvedValueOnce({
      success: true,
      orderId: "ORDE_2",
      status: "PAID",
    });

    const onSuccess = vi.fn();
    rerender(
      <PagamentoSelecao
        {...baseProps}
        pedidoId="pedido-1"
        onDeclined={onDeclined}
        onSuccess={onSuccess}
      />,
    );

    await user.click(screen.getByRole("button", { name: /finalizar compra/i }));
    await waitFor(() => expect(hookState.createCardPayment).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });

  it("retryNonce incrementado dispara nova tentativa via useEffect", async () => {
    hookState.createCardPayment.mockResolvedValue({
      success: true,
      orderId: "ORDE_R",
      status: "PAID",
    });

    const onSuccess = vi.fn();
    const { rerender } = render(
      <PagamentoSelecao
        {...baseProps}
        pedidoId="pedido-1"
        onSuccess={onSuccess}
        retryNonce={0}
      />,
    );

    const user = await preencherCartao();
    await user.click(screen.getByRole("button", { name: /finalizar compra/i }));
    await waitFor(() => expect(hookState.createCardPayment).toHaveBeenCalledTimes(1));

    // Caller incrementa o nonce -> useEffect re-dispara processamento
    rerender(
      <PagamentoSelecao
        {...baseProps}
        pedidoId="pedido-1"
        onSuccess={onSuccess}
        retryNonce={1}
      />,
    );

    await waitFor(() => expect(hookState.createCardPayment).toHaveBeenCalledTimes(2));
  });

  it("skipCupomOnNextAttempt e propagado para createCardPayment", async () => {
    hookState.createCardPayment.mockResolvedValue({
      success: true,
      orderId: "ORDE_S",
      status: "PAID",
    });

    render(
      <PagamentoSelecao
        {...baseProps}
        pedidoId="pedido-1"
        skipCupomOnNextAttempt={true}
      />,
    );

    const user = await preencherCartao();
    await user.click(screen.getByRole("button", { name: /finalizar compra/i }));

    await waitFor(() => {
      expect(hookState.createCardPayment).toHaveBeenCalledWith(
        "pedido-1",
        "encrypted-card-token",
        1,
        { skipCupom: true },
      );
    });
  });
});

describe("PagamentoSelecao - guardas", () => {
  it("validacao bloqueia Finalizar Compra com cartao incompleto", async () => {
    render(<PagamentoSelecao {...baseProps} pedidoId="pedido-1" />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /cartao de credito/i }));
    // Sem preencher
    await user.click(screen.getByRole("button", { name: /finalizar compra/i }));
    expect(hookState.createCardPayment).not.toHaveBeenCalled();
    expect(screen.getByText(/numero do cartao invalido/i)).toBeInTheDocument();
  });
});
