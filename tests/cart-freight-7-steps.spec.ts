/**
 * E2E do fluxo de 7 passos do bug de frete grudado em /cart.
 *
 * Origem do bug (relato manual em https://dev.lovecosmetics.com.br/cart):
 *   1. Kit no cart com peso correto.
 *   2. Admin zera peso_gramas no Directus.
 *   3. Hard refresh em /cart -> frete continua funcionando.
 *   4. Remover do cart e re-adicionar pela home -> frete passa a dar erro.
 *   5. Admin restaura o peso correto.
 *   6. Hard refresh em /cart -> frete continua com erro (BUG CENTRAL).
 *   7. Remove e re-adiciona pela home -> frete volta a funcionar.
 *
 * Estratégia hermética (não toca no Directus real):
 *
 *  - "Estado do CMS" é uma variável do teste (cmsPesoAtual). As etapas 2 e 5
 *    apenas mudam essa variável.
 *  - /api/carrinho/validar (rota client->server, dispara o auto-refresh do
 *    /cart) é interceptada e responde lendo cmsPesoAtual. É exatamente o que
 *    fica desincronizado em produção, então mantém-se fiel ao bug.
 *  - /api/freight/quote é interceptada e usa uma regra física simples: se
 *    qualquer item tem peso_gramas==0, devolve erro 400; caso contrário,
 *    devolve cota OK. Igual ao Frenet real recusando peso zero.
 *  - "Adicionar pela home" pula a UI da home (server component, peso vem no
 *    HTML, não dá pra interceptar via page.route). Em vez disso, escreve no
 *    localStorage.cart o que o CardProduto teria escrito naquele estado do
 *    CMS — fiel porque o addProductToCart real só copia props pro storage,
 *    sem fetch.
 *  - Tudo o que importa pro bug — CartProvider, CartTotalsProvider,
 *    auto-refresh, hidratação, ShippingCalculator — roda real no browser.
 *
 * O spec é VERMELHO: a etapa 6 deve falhar (frete continua erro mesmo com
 * CMS restaurado). Quando o bug for corrigido, este teste passa e fica como
 * guarda de regressão.
 */
import { test, expect, Page } from "@playwright/test";

const KIT_ID = "331";
const KIT_DOC = "z2ymswculwwn411yirr8jhn1";
const PESO_OK = 443;
const ALTURA_OK = 22;
const LARGURA_OK = 10;
const COMPRIMENTO_OK = 6;
const PRECO_KIT = 159.44;
const CEP = "01310100";

type CmsState = {
  pesoAtual: number;
  alturaAtual: number;
};

function makeKitForCart(peso: number, altura: number, qtd = 1) {
  return {
    id: KIT_ID,
    documentId: KIT_DOC,
    nome: "Kit Uso Diário",
    slug: "kit-uso-diario",
    preco: PRECO_KIT,
    quantity: qtd,
    peso_gramas: peso,
    altura,
    largura: LARGURA_OK,
    comprimento: COMPRIMENTO_OK,
  };
}

async function seedCartFromCms(page: Page, cms: CmsState) {
  // Simula "adicionar pela home com o estado atual do CMS". O CardProduto
  // real grava no LS exatamente os props que recebeu da listagem SSR — e a
  // listagem SSR vem do mesmo Directus que está em cms.pesoAtual aqui.
  await page.evaluate((kit) => {
    const cart = { [kit.id]: kit };
    window.localStorage.setItem("cart", JSON.stringify(cart));
    window.localStorage.setItem("cupons", "[]");
  }, makeKitForCart(cms.pesoAtual, cms.alturaAtual));
}

async function clearCartViaUi(page: Page) {
  // Simula "remover do cart". Não usamos a UI porque após remover sobra o
  // estado vazio do CartProvider; queremos sempre re-adicionar fresh.
  await page.evaluate(() => {
    window.localStorage.removeItem("cart");
  });
}

async function setupRouteMocks(page: Page, cms: CmsState) {
  // /api/carrinho/validar é o endpoint que dispara o auto-refresh do /cart.
  // O bug é justamente o cart não absorver o peso novo daqui — então
  // mantemos a rota real do Next, mas interceptamos no Playwright pra ler
  // o CMS simulado (cms é um closure mutável; ler em cada request).
  await page.route("**/api/carrinho/validar", async (route) => {
    const reqBody = route.request().postDataJSON();
    const items = (reqBody?.items ?? []) as Array<{ id: string; documentId?: string; nome: string; preco: number }>;
    const produtosAtualizados = items.map((item) => ({
      id: item.id,
      documentId: item.documentId ?? KIT_DOC,
      nome: item.nome,
      precoAtual: item.preco,
      precoComCupom: item.preco,
      peso_gramas: cms.pesoAtual,
      altura: cms.alturaAtual,
      largura: LARGURA_OK,
      comprimento: COMPRIMENTO_OK,
    }));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        atualizado: true,
        produtosDesatualizados: [],
        cuponsDesatualizados: [],
        produtosAtualizados,
      }),
    });
  });

  // /api/freight/quote: regra física igual ao Frenet — peso 0 não cota.
  // O peso lido aqui vem do cart (que pode estar stale!) — exatamente o
  // mecanismo do bug.
  await page.route("**/api/freight/quote", async (route) => {
    const reqBody = route.request().postDataJSON();
    const items = (reqBody?.items ?? []) as Array<{ peso_gramas?: number }>;
    const algumZero = items.some((i) => !i.peso_gramas || i.peso_gramas <= 0);

    if (algumZero) {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ success: false, error: "Erro ao calcular frete. Por favor, tente novamente." }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        services: [{
          carrier: "Correios", service: "Econômica",
          price: 25.5, deliveryTime: 7, serviceCode: "Economica",
        }],
        cheapest: { carrier: "Correios", service: "Econômica", price: 25.5, deliveryTime: 7 },
      }),
    });
  });
}

async function digitarCepEEsperar(page: Page) {
  const input = page.getByPlaceholder(/digite seu cep/i).first();
  await expect(input).toBeVisible({ timeout: 10_000 });
  await input.fill("");
  await input.fill(CEP);
  // Auto-cota dispara com 8 dígitos. Damos tempo pro round-trip do mock.
  await page.waitForTimeout(500);
}

async function freteEstaOk(page: Page): Promise<boolean> {
  // Sucesso: ShippingCalculator mostra "até X dia(s) úteis". Erro: bloco
  // vermelho com a mensagem.
  const sucesso = page.locator("text=/até\\s+\\d+\\s+dia/i").first();
  return await sucesso.isVisible().catch(() => false);
}

async function freteEstaComErro(page: Page): Promise<boolean> {
  const erro = page.locator("text=/erro ao calcular frete/i").first();
  return await erro.isVisible().catch(() => false);
}

test.describe("Bug do frete grudado em /cart — fluxo completo de 7 passos", () => {
  test("após restaurar peso no CMS, hard refresh em /cart deve voltar a cotar (etapa 6)", async ({ page }) => {
    // CMS começa correto (estado inicial real).
    const cms: CmsState = { pesoAtual: PESO_OK, alturaAtual: ALTURA_OK };

    await setupRouteMocks(page, cms);

    // Etapa 1: kit já no cart com peso correto.
    await page.goto("/figma/cart");
    await seedCartFromCms(page, cms);
    await page.reload();
    await page.waitForLoadState("networkidle");

    await digitarCepEEsperar(page);
    expect(
      await freteEstaOk(page),
      "Etapa 1: cart com peso=443 + CMS=443. Frete deveria cotar.",
    ).toBe(true);

    // Etapa 2: admin zera peso no Directus (mudança no estado simulado do
    // CMS — a próxima request ao /api/carrinho/validar vai devolver peso 0).
    cms.pesoAtual = 0;
    cms.alturaAtual = 0;

    // Etapa 3: hard refresh em /cart. O auto-refresh chama
    // /api/carrinho/validar (que agora devolve peso=0), sincroniza o cart
    // pra peso=0 e o ShippingCalculator cota com peso=0 -> erro. Esse é o
    // comportamento correto pós-fix: cart fica fiel ao CMS atual.
    //
    // Nota: o relato original do usuário descrevia frete "continuando
    // funcionando" nessa etapa, mas isso era acidente do bug — o
    // auto-refresh estava silenciosamente falhando (null no validateCart),
    // então o cart ficava peso=443 e o Frenet cotava. Com o fix, o cart
    // sincroniza corretamente.
    await page.reload();
    await page.waitForLoadState("networkidle");
    await digitarCepEEsperar(page);
    expect(
      await freteEstaComErro(page),
      "Etapa 3: hard refresh com CMS=0 — auto-refresh sincroniza cart pra peso=0 e o frete dá erro.",
    ).toBe(true);

    // Etapa 4: remover do cart e re-adicionar pela home. Como o CMS está em
    // 0, a "home" entrega peso 0 — cart fresco entra com peso 0.
    await clearCartViaUi(page);
    await seedCartFromCms(page, cms);
    await page.goto("/figma/cart");
    await page.waitForLoadState("networkidle");
    await digitarCepEEsperar(page);
    expect(
      await freteEstaComErro(page),
      "Etapa 4: re-adicionado com peso=0 (do CMS atual). Frete deveria dar erro.",
    ).toBe(true);

    // Etapa 5: admin restaura peso no CMS.
    cms.pesoAtual = PESO_OK;
    cms.alturaAtual = ALTURA_OK;

    // Etapa 6: hard refresh em /cart — auto-refresh deveria trazer peso=443
    // do CMS, recalcular cartFreightKey, e re-cotar com sucesso.
    // Em produção isso NÃO acontece — esse é o bug que esse teste captura.
    await page.reload();
    await page.waitForLoadState("networkidle");
    await digitarCepEEsperar(page);
    // Espera extra: dar tempo do auto-refresh + recalculação do
    // ShippingCalculator (cartFreightKey muda -> calculateFreight silent).
    await page.waitForTimeout(1500);

    const freteVoltou = await freteEstaOk(page);
    expect(
      freteVoltou,
      "Etapa 6 (BUG CENTRAL): CMS restaurado para peso=443 e hard refresh em /cart. " +
      "O auto-refresh do CartTotalsProvider deveria sincronizar o cart com o CMS " +
      "e o ShippingCalculator deveria re-cotar — mas o frete continua com erro. " +
      "Quando este expect passar, o bug foi corrigido.",
    ).toBe(true);

    // Etapa 7: workaround do usuário — remover e re-adicionar.
    // Não chega a executar enquanto a etapa 6 falhar (expect acima já jogou).
    // Mantida pra cobrir a regressão completa.
    await clearCartViaUi(page);
    await seedCartFromCms(page, cms);
    await page.goto("/figma/cart");
    await page.waitForLoadState("networkidle");
    await digitarCepEEsperar(page);
    expect(
      await freteEstaOk(page),
      "Etapa 7: re-add fresh com CMS=443 — frete tem que voltar a cotar.",
    ).toBe(true);
  });
});
