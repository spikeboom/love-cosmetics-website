import { describe, it, expect } from "vitest";
import { getDeclineInfo, SUGGESTION_LABELS } from "@/lib/pagbank/decline-reasons";

// Lista oficial PagBank: https://developer.pagbank.com.br/reference/motivos-de-compra-negada
const ALL_MAPPED_CODES = [
  "10000", "10001", "10002", "10003", "10004",
  "20001", "20003", "20007", "20008", "20012",
  "20017", "20018", "20019", "20039",
  "20101", "20102", "20103", "20104", "20105",
  "20110", "20111", "20112", "20113", "20114", "20115", "20116", "20117", "20118", "20119",
  "20158", "20159",
  "20301", "20999",
];

describe("getDeclineInfo - mapped codes", () => {
  it("cobre todos os 33 codigos da doc oficial PagBank", () => {
    expect(ALL_MAPPED_CODES).toHaveLength(33);
    for (const code of ALL_MAPPED_CODES) {
      const info = getDeclineInfo({ code, message: "qualquer" });
      expect(info.titulo).toBeTruthy();
      expect(info.acao).toBeTruthy();
      expect(typeof info.doNotRetry).toBe("boolean");
      expect(info.suggestions.length).toBeGreaterThan(0);
    }
  });

  it("20003 (NAO AUTORIZADA) -> saldo/limite insuficiente, retry permitido", () => {
    const info = getDeclineInfo({ code: "20003", message: "NAO AUTORIZADA" });
    expect(info.titulo).toMatch(/saldo|limite/i);
    expect(info.doNotRetry).toBe(false);
    expect(info.suggestions).toContain("TRY_OTHER_CARD");
    expect(info.suggestions).toContain("USE_PIX");
  });

  it("10001 (tentativas excedidas) -> doNotRetry=true", () => {
    const info = getDeclineInfo({ code: "10001", message: "QTDADE EXCEDIDA" });
    expect(info.doNotRetry).toBe(true);
    expect(info.suggestions).not.toContain("RETRY_CARD");
  });

  it("20007 (verifique dados) -> RETRY_CARD permitido", () => {
    const info = getDeclineInfo({ code: "20007", message: "VERIFIQUE OS DADOS" });
    expect(info.suggestions[0]).toBe("RETRY_CARD");
  });

  it("20019 (falha de comunicacao) -> sugere WAIT", () => {
    const info = getDeclineInfo({ code: "20019", message: "FALHA" });
    expect(info.suggestions).toContain("WAIT");
  });

  it("20301 (desbloqueie cartao) -> sugere CONTACT_BANK", () => {
    const info = getDeclineInfo({ code: "20301", message: "DESBLOQUEIE" });
    expect(info.suggestions).toContain("CONTACT_BANK");
    expect(info.doNotRetry).toBe(true);
  });

  it("20999 (lojista contate adquirente) -> sugere CONTACT_SUPPORT", () => {
    const info = getDeclineInfo({ code: "20999", message: "ERRO" });
    expect(info.suggestions).toContain("CONTACT_SUPPORT");
  });
});

describe("getDeclineInfo - fallback", () => {
  it("codigo desconhecido sem hint -> permite RETRY_CARD", () => {
    const info = getDeclineInfo({ code: "99999", message: "Erro generico" });
    expect(info.doNotRetry).toBe(false);
    expect(info.suggestions).toContain("RETRY_CARD");
    expect(info.acao).toBe("Erro generico");
  });

  it("codigo desconhecido COM 'NAO TENTE NOVAMENTE' -> doNotRetry=true", () => {
    const info = getDeclineInfo({
      code: "99999",
      message: "TRANSACAO BLOQUEADA - NAO TENTE NOVAMENTE",
    });
    expect(info.doNotRetry).toBe(true);
    expect(info.suggestions).not.toContain("RETRY_CARD");
    expect(info.suggestions).toContain("CONTACT_SUPPORT");
  });

  it("undefined -> retorna fallback generico sem crash", () => {
    const info = getDeclineInfo(undefined);
    expect(info.titulo).toBeTruthy();
    expect(info.acao).toBeTruthy();
  });

  it("payload com code/message vazios -> fallback generico", () => {
    const info = getDeclineInfo({ code: "", message: "" });
    expect(info.titulo).toBe("Pagamento nao autorizado");
    expect(info.acao).toMatch(/Pix|atendimento/i);
  });

  it("payload com code null -> fallback usa message", () => {
    const info = getDeclineInfo({ code: null, message: "Algum erro do banco" });
    expect(info.acao).toBe("Algum erro do banco");
  });
});

describe("SUGGESTION_LABELS", () => {
  it("tem rotulo para todas as suggestions geradas", () => {
    const allCodes = ["20003", "10001", "20007", "99999"];
    for (const code of allCodes) {
      const info = getDeclineInfo({ code, message: "x" });
      for (const sug of info.suggestions) {
        expect(SUGGESTION_LABELS[sug]).toBeTruthy();
      }
    }
  });
});
