/**
 * E2E repro do bug de stale state no /cart:
 *
 * Reproduzido manualmente em 2026-04-28 com Chrome MCP em
 * http://127.0.0.1:3000/cart usando o Kit Uso Diário (id="331"). Sequência:
 * 1) localStorage.cart pré-populado com peso=999 (sentinela).
 * 2) /api/carrinho/validar (real) retornou peso correto do CMS.
 * 3) Após hard refresh, localStorage.cart continuou peso=999.
 * 4) Incrementar quantidade fez calculateCartTotals re-gravar peso=999 no LS,
 *    indicando que o React state interno também ficou em 999 — ou seja, o
 *    setCart(newCart) do refreshCartPrices não persistiu.
 *
 * Em vitest + jsdom o caminho funciona corretamente. O bug aparece com
 * concurrent rendering / strict mode do browser real. Daí Playwright.
 */
import { test, expect } from "@playwright/test";

const KIT_ID = "331";
const KIT_DOC = "z2ymswculwwn411yirr8jhn1";
const PESO_SENTINELA = 999;
const ALTURA_SENTINELA = 99;
const PESO_CMS = 443;
const ALTURA_CMS = 22;

test.describe("/cart auto-refresh deve persistir peso/dim novos no localStorage", () => {
  test.beforeEach(async ({ page }) => {
    // Pré-popula localStorage ANTES de qualquer JS do app rodar. Isso simula
    // "usuário tinha o kit no cart com peso antigo" (ou o admin mexeu no
    // peso depois que o item foi salvo).
    await page.addInitScript(({ kitId, kitDoc, peso, altura }) => {
      const cart = {
        [kitId]: {
          id: kitId,
          documentId: kitDoc,
          nome: "Kit Uso Diário",
          preco: 159.44,
          quantity: 1,
          peso_gramas: peso,
          altura,
          largura: 10,
          comprimento: 6,
        },
      };
      // localStorage de origem (port 3000) — addInitScript roda antes de
      // qualquer coisa, garantindo que o CartProvider veja peso=999 ao hidratar.
      try { window.localStorage.setItem("cart", JSON.stringify(cart)); } catch {}
      try { window.localStorage.setItem("cupons", "[]"); } catch {}
    }, { kitId: KIT_ID, kitDoc: KIT_DOC, peso: PESO_SENTINELA, altura: ALTURA_SENTINELA });

    // Intercepta a API de validação e devolve o "valor atual do CMS".
    // Hermético: não depende do Directus.
    await page.route("**/api/carrinho/validar", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          atualizado: true,
          produtosDesatualizados: [],
          cuponsDesatualizados: [],
          produtosAtualizados: [{
            id: KIT_ID,
            documentId: KIT_DOC,
            nome: "Kit Uso Diário",
            precoAtual: 159.44,
            precoComCupom: 159.44,
            peso_gramas: PESO_CMS,
            altura: ALTURA_CMS,
            largura: 10,
            comprimento: 6,
          }],
        }),
      });
    });

    // Mocka /api/freight/quote pra não bater no Frenet — não é o foco do teste.
    await page.route("**/api/freight/quote", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ShippingSevicesArray: [{
            ServiceCode: "Economica", ServiceDescription: "Econômica",
            Carrier: "Correios", ShippingPrice: "0", DeliveryTime: "21",
            Error: false, Msg: "",
          }],
        }),
      });
    });
  });

  test("hard refresh em /cart sincroniza localStorage com o que /api/carrinho/validar retorna", async ({ page }) => {
    const validateRequests: any[] = [];
    page.on("request", (req) => {
      if (req.url().includes("/api/carrinho/validar")) validateRequests.push(req);
    });

    await page.goto("/cart");
    await page.waitForLoadState("networkidle");

    // Confirma que o auto-refresh disparou — sem isso o teste não validou nada.
    expect(
      validateRequests.length,
      "auto-refresh do CartTotalsProvider não chamou /api/carrinho/validar",
    ).toBeGreaterThan(0);

    // Espera o efeito de persistência rodar. Damos um tempo curto extra além
    // do networkidle pra cobrir setStates batched + useEffect.
    await page.waitForTimeout(500);

    const cartFinal = await page.evaluate(() => {
      const raw = window.localStorage.getItem("cart") || "{}";
      const parsed = JSON.parse(raw);
      return parsed[Object.keys(parsed)[0]];
    });

    expect(
      cartFinal,
      "kit precisa continuar no cart depois do refresh",
    ).toBeTruthy();

    // Contrato esperado: /api/carrinho/validar devolveu peso=443, então o
    // localStorage.cart depois do auto-refresh tem que estar em 443. Se este
    // expect falhar, é o bug observado em produção.
    expect(
      cartFinal.peso_gramas,
      `localStorage.cart["${KIT_ID}"].peso_gramas é ${cartFinal.peso_gramas}, ` +
      `esperado ${PESO_CMS} (valor que /api/carrinho/validar mockada retornou). ` +
      `Indica que o setCart(newCart) do refreshCartPrices não persistiu, ou ` +
      `que outro setCart posterior reverteu o state pra ${PESO_SENTINELA}.`,
    ).toBe(PESO_CMS);

    expect(cartFinal.altura).toBe(ALTURA_CMS);
  });

  test("incrementar quantidade após auto-refresh: novo write no localStorage tem peso atualizado", async ({ page }) => {
    // Esse teste captura o sintoma observado no Chrome MCP: depois do auto-
    // refresh teoricamente ter mudado o state, clicar "+" no cart re-grava o
    // peso ANTIGO no localStorage. Isso só acontece se o React state interno
    // está com peso antigo — sinal forte de que setCart(newCart) não chegou
    // ou foi sobrescrito.
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Procura o botão de aumentar quantidade. Usa role/aria-label porque o
    // testid varia entre layouts.
    const inc = page.getByRole("button", { name: /aumentar quantidade/i }).first();
    await expect(inc).toBeVisible({ timeout: 10_000 });
    await inc.click();
    await page.waitForTimeout(300);

    const cartAfterInc = await page.evaluate(() => {
      const raw = window.localStorage.getItem("cart") || "{}";
      const parsed = JSON.parse(raw);
      return parsed[Object.keys(parsed)[0]];
    });

    expect(cartAfterInc.quantity, "increment não rodou").toBe(2);
    expect(
      cartAfterInc.peso_gramas,
      `Após incrementar quantidade, o write no localStorage trouxe peso=` +
      `${cartAfterInc.peso_gramas}. Se for ${PESO_SENTINELA}, o React state ` +
      `interno está com o peso antigo (state stale), confirmando o bug ` +
      `observado em produção.`,
    ).toBe(PESO_CMS);
  });
});
