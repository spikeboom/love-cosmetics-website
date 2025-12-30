import { test, expect } from "@playwright/test";

test.describe("Seguranca basica (didatico)", () => {
  test.describe("Autenticacao", () => {
    test("bloqueia rota protegida sem login (cliente)", async ({ request }) => {
      const res = await request.get("/api/cliente/conta/pedidos");
      expect(res.status()).toBe(401);
    });

    test("rejeita token invalido/expirado (cliente)", async ({ request }) => {
      const res = await request.get("/api/cliente/conta/pedidos", {
        headers: {
          Cookie: "cliente_token=token_invalido",
        },
      });
      expect(res.status()).toBe(401);
    });

    test("redireciona acesso admin sem cookie", async ({ request }) => {
      const res = await request.get("/pedidos");
      expect([302, 307, 308]).toContain(res.status());
      const location = res.headers()["location"] || "";
      expect(location).toContain("/pedidos/login");
    });
  });

  test.describe("Autorizacao", () => {
    test("admin API deve exigir autenticacao (esperado falhar enquanto vulneravel)", async ({ request }) => {
      test.fail(true, "API admin sem protecao permite acesso direto.");
      const res = await request.post("/api/pedido/admin", {
        data: {
          items: [],
          cliente: {},
          frete: { valor: 0 },
          desconto: { tipo: "nenhum" },
          cortesia: true,
        },
      });
      expect([401, 403]).toContain(res.status());
    });

    test("debug token nao deve ser publico (esperado falhar enquanto vulneravel)", async ({ request }) => {
      test.fail(true, "Endpoint debug expõe token sem auth.");
      const res = await request.get("/api/debug/token");
      expect([401, 403]).toContain(res.status());
    });
  });

  test.describe("Validacao de entrada", () => {
    test("SQL injection basico em login deve ser rejeitado", async ({ request }) => {
      const res = await request.post("/api/cliente/auth/entrar", {
        data: {
          email: "test@example.com' OR 1=1 --",
          password: "x",
        },
      });
      expect(res.status()).toBe(400);
    });

    test("XSS simples nao deve ser refletido na resposta", async ({ request }) => {
      const payload = "<script>alert(1)</script>";
      const res = await request.post("/api/cliente/auth/entrar", {
        data: {
          email: `${payload}@mail.com`,
          password: "x",
        },
      });
      const bodyText = await res.text();
      expect(res.status()).toBe(400);
      expect(bodyText).not.toContain(payload);
    });

    test("campos obrigatorios ausentes devem retornar 400", async ({ request }) => {
      const res = await request.post("/api/cliente/auth/entrar", {
        data: {},
      });
      expect(res.status()).toBe(400);
    });
  });

  test.describe("Exposicao de dados sensiveis", () => {
    test("erros nao devem expor stack trace", async ({ request }) => {
      const res = await request.post("/api/cliente/auth/entrar", {
        data: {},
      });
      const bodyText = await res.text();
      expect(bodyText.toLowerCase()).not.toContain("stack");
      expect(bodyText.toLowerCase()).not.toContain("prisma");
    });
  });

  test.describe("Configuracoes inseguras", () => {
    test("headers de seguranca devem existir (esperado falhar enquanto ausentes)", async ({ request }) => {
      test.fail(true, "Headers de seguranca ausentes no Next config.");
      const res = await request.get("/");
      const headers = res.headers();
      expect(headers["x-frame-options"]).toBeTruthy();
      expect(headers["x-content-type-options"]).toBeTruthy();
      expect(headers["content-security-policy"]).toBeTruthy();
      expect(headers["referrer-policy"]).toBeTruthy();
      expect(headers["permissions-policy"]).toBeTruthy();
    });

    test("CORS nao deve ser permissivo demais", async ({ request }) => {
      const res = await request.get("/api/cliente/conta/pedidos", {
        headers: {
          Origin: "http://evil.example",
        },
      });
      const acao = res.headers()["access-control-allow-origin"] || "";
      expect(acao).not.toBe("*");
    });
  });
});
