import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CupomIndisponivelModal } from "@/app/(figma)/(checkout)/figma/checkout/pagamento/components/CupomIndisponivelModal";

const baseProps = {
  cupom: "PRIMEIRA10",
  onContinueWithoutCoupon: vi.fn(),
  onClose: vi.fn(),
};

describe("CupomIndisponivelModal", () => {
  it("renderiza titulo e nome do cupom", () => {
    render(<CupomIndisponivelModal {...baseProps} />);
    expect(screen.getByRole("dialog", { name: /cupom indisponivel/i })).toBeInTheDocument();
    expect(screen.getByText("PRIMEIRA10")).toBeInTheDocument();
  });

  it("exibe diff de preco quando totalAtual e novoTotal sao fornecidos", () => {
    render(<CupomIndisponivelModal {...baseProps} totalAtual={225.52} novoTotal={250.6} />);
    // formatPrice usa pt-BR (R$ 225,52)
    expect(screen.getByText(/225,52/)).toBeInTheDocument();
    expect(screen.getByText(/250,60/)).toBeInTheDocument();
  });

  it("nao exibe bloco de diff quando totais nao sao fornecidos", () => {
    render(<CupomIndisponivelModal {...baseProps} />);
    expect(screen.queryByText(/com cupom/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/sem cupom/i)).not.toBeInTheDocument();
  });

  it("clique em 'Continuar sem o cupom' dispara o callback", async () => {
    const onContinueWithoutCoupon = vi.fn();
    render(
      <CupomIndisponivelModal {...baseProps} onContinueWithoutCoupon={onContinueWithoutCoupon} />,
    );
    await userEvent.click(screen.getByRole("button", { name: /continuar sem o cupom/i }));
    expect(onContinueWithoutCoupon).toHaveBeenCalledOnce();
  });

  it("clique em 'Cancelar' dispara onClose", async () => {
    const onClose = vi.fn();
    render(<CupomIndisponivelModal {...baseProps} onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renderiza fallback 'aplicado' quando cupom e null", () => {
    render(<CupomIndisponivelModal {...baseProps} cupom={null} />);
    expect(screen.getByText(/aplicado/i)).toBeInTheDocument();
  });
});
