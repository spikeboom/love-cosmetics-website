import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PagamentoRecusadoModal } from "@/app/(figma)/(checkout)/figma/checkout/pagamento/components/PagamentoRecusadoModal";

const baseProps = {
  pedidoId: "pedido-abc-123",
  onTryOtherCard: vi.fn(),
  onUsePix: vi.fn(),
  onClose: vi.fn(),
};

describe("PagamentoRecusadoModal", () => {
  it("renderiza titulo amigavel para code 20003 (saldo insuficiente)", () => {
    render(
      <PagamentoRecusadoModal
        {...baseProps}
        paymentResponse={{
          code: "20003",
          message: "NAO AUTORIZADA",
          reference: "042475146206",
          raw_data: { reason_code: "51", nsu: "042475146206" },
        }}
      />,
    );

    expect(screen.getByRole("dialog", { name: /pagamento recusado/i })).toBeInTheDocument();
    // Titulo amigavel do mapa decline-reasons para 20003
    expect(screen.getByText(/saldo ou limite insuficiente/i)).toBeInTheDocument();
  });

  it("exibe a referencia NSU para o cliente citar no SAC", () => {
    render(
      <PagamentoRecusadoModal
        {...baseProps}
        paymentResponse={{
          code: "20003",
          message: "NAO AUTORIZADA",
          reference: "042475146206",
        }}
      />,
    );

    expect(screen.getByText(/042475146206/)).toBeInTheDocument();
    expect(screen.getByText(baseProps.pedidoId)).toBeInTheDocument();
  });

  it("usa raw_data.nsu quando reference nao vem no payload", () => {
    render(
      <PagamentoRecusadoModal
        {...baseProps}
        paymentResponse={{
          code: "20003",
          message: "x",
          raw_data: { nsu: "999888777" },
        }}
      />,
    );
    expect(screen.getByText(/999888777/)).toBeInTheDocument();
  });

  it("nao renderiza secao de referencia quando nao ha NSU/auth_code", () => {
    render(
      <PagamentoRecusadoModal
        {...baseProps}
        paymentResponse={{ code: "20003", message: "x" }}
      />,
    );
    expect(screen.queryByText(/em caso de duvidas/i)).not.toBeInTheDocument();
  });

  it("clique em 'Tentar outro cartao' chama onTryOtherCard", async () => {
    const onTryOtherCard = vi.fn();
    render(
      <PagamentoRecusadoModal
        {...baseProps}
        onTryOtherCard={onTryOtherCard}
        paymentResponse={{ code: "20003", message: "x" }}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /tentar outro cartao/i }));
    expect(onTryOtherCard).toHaveBeenCalledOnce();
  });

  it("clique em 'Pagar com Pix' chama onUsePix", async () => {
    const onUsePix = vi.fn();
    render(
      <PagamentoRecusadoModal
        {...baseProps}
        onUsePix={onUsePix}
        paymentResponse={{ code: "20003", message: "x" }}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /pagar com pix/i }));
    expect(onUsePix).toHaveBeenCalledOnce();
  });

  it("clique em 'Voltar' chama onClose", async () => {
    const onClose = vi.fn();
    render(
      <PagamentoRecusadoModal
        {...baseProps}
        onClose={onClose}
        paymentResponse={{ code: "20003", message: "x" }}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /voltar/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("para code com doNotRetry+TRY_OTHER_CARD ainda mostra botao trocar cartao", () => {
    // 10001 e doNotRetry=true mas a sugestao inclui TRY_OTHER_CARD
    render(
      <PagamentoRecusadoModal
        {...baseProps}
        paymentResponse={{ code: "10001", message: "QTDADE EXCEDIDA" }}
      />,
    );
    expect(screen.getByRole("button", { name: /tentar outro cartao/i })).toBeInTheDocument();
  });

  it("renderiza com payment_response null sem crashar", () => {
    render(<PagamentoRecusadoModal {...baseProps} paymentResponse={null} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/pagamento recusado/i)).toBeInTheDocument();
  });
});
