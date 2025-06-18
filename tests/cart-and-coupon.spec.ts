// tests/cart-and-coupon.spec.ts
import { test, expect } from "@playwright/test";

// Helper function to extract numeric value from formatted price
function extractPriceValue(priceText: string): number {
  // Remove "R$ " and replace "," with "." then parse
  return parseFloat(priceText.replace("R$ ", "").replace(",", "."));
}

// Shipping fee constant
const SHIPPING_FEE = 15;

test("fluxo rico: quantidade variada e validação de preço e cupom AJ25", async ({
  page,
}) => {
  // 1) Acesse a home e abra o carrinho
  await page.goto("http://localhost:3000/home");
  await page.waitForLoadState("networkidle");
  const buy = page.locator('[aria-label="Carrossel - Comprar"]').first();
  await expect(buy).toBeVisible({ timeout: 10_000 });
  await buy.click();

  // 2) Checa modal, item e preços iniciais
  const modal = page.getByTestId("cart-modal");
  await expect(modal).toBeVisible();
  await expect(page.getByTestId("cart-product-item")).toHaveCount(1);

  // Verifica se existe preco_de (preço original) ou usa preco atual
  const unitPriceElement = page.getByTestId("cart-product-item-unit-price");
  const currentPriceElement = page.getByTestId(
    "cart-product-item-unit-price-discounted",
  );

  let unitPriceText: string;
  unitPriceText = (await currentPriceElement.textContent()) || "";

  const totalPriceText0 = await page
    .getByTestId("cart-summary-total-price")
    .textContent();
  // totalPrice deve igual unitPrice x 1 + shipping fee
  expect(extractPriceValue(totalPriceText0!)).toBeCloseTo(
    extractPriceValue(unitPriceText!) + SHIPPING_FEE,
  );

  // 3) Incrementa p/ 2 e depois p/ 3
  await page.getByTestId("increment-button").click();
  await page.getByTestId("increment-button").click();
  await expect(page.getByTestId("cart-product-item-quantity")).toHaveText("3");
  // checa total = unitPrice * 3 + shipping fee
  const totalPriceText3 = await page
    .getByTestId("cart-summary-total-price")
    .textContent();
  expect(extractPriceValue(totalPriceText3!)).toBeCloseTo(
    extractPriceValue(unitPriceText!) * 3 + SHIPPING_FEE,
  );

  // 4) Decrementa para 1 de novo
  await page.getByTestId("decrement-button").click();
  await page.getByTestId("decrement-button").click();
  await expect(page.getByTestId("cart-product-item-quantity")).toHaveText("1");
  // revalida total = unitPrice * 1 + shipping fee
  const totalPriceText1 = await page
    .getByTestId("cart-summary-total-price")
    .textContent();
  expect(extractPriceValue(totalPriceText1!)).toBeCloseTo(
    extractPriceValue(unitPriceText!) + SHIPPING_FEE,
  );

  // 5) Remove o único item (zera o carrinho)
  await page.getByTestId("remove-product-button").click();
  await expect(page.getByTestId("cart-product-item")).toHaveCount(0);
  await expect(page.getByTestId("empty-cart-message")).toBeVisible();

  // 6) Reabre e adiciona novamente para validar cupom
  await page.getByTestId("close-cart-button").click();
  await buy.click();
  await expect(page.getByTestId("cart-product-item")).toHaveCount(1);

  // 7) Aplica cupom AJ25
  await page.getByTestId("coupon-toggle-button").click();
  await page.getByTestId("coupon-input").fill("AJ25");
  await page.getByTestId("apply-coupon-button").click();
  await expect(page.getByTestId("coupon-item")).toHaveText("AJ25");

  // 8) Verifica desconto de 25% no total e no unitário
  const discountedUnit = await page
    .getByTestId("cart-product-item-unit-price-discounted")
    .textContent();
  const discountedTotal = await page
    .getByTestId("cart-summary-total-price")
    .textContent();

  // Verifica que o preço unitário com desconto está correto (25% de desconto)
  const originalUnit = extractPriceValue(unitPriceText!);
  const expectedDiscountedUnit = originalUnit * 0.75;
  expect(extractPriceValue(discountedUnit!)).toBeCloseTo(
    expectedDiscountedUnit,
    2,
  );

  // Verifica que o total inclui o preço com desconto + frete
  const expectedTotal = expectedDiscountedUnit + SHIPPING_FEE;
  expect(extractPriceValue(discountedTotal!)).toBeCloseTo(expectedTotal, 2);

  // 9) Remove o cupom e valida restauração de preço
  await page.getByTestId("remove-coupon-button").click();
  await expect(page.getByTestId("coupon-item")).toHaveCount(0);
  const restoredTotal = await page
    .getByTestId("cart-summary-total-price")
    .textContent();
  expect(extractPriceValue(restoredTotal!)).toBeCloseTo(
    originalUnit + SHIPPING_FEE,
  );

  // 10) Fechar o modal
  await page.getByTestId("close-cart-button").click();
  await expect(page.getByTestId("cart-modal")).not.toBeVisible();

  // 11) Adicionar um segundo item (segundo produto do carrossel)
  const secondBuy = page.locator('[aria-label="Carrossel - Comprar"]').nth(1);
  await expect(secondBuy).toBeVisible();
  await secondBuy.click();

  // 12) Verificar que agora há 2 itens no carrinho
  await expect(page.getByTestId("cart-product-item")).toHaveCount(2);

  // 13) Verificar valores com 2 itens
  const totalPriceWithTwoItems = await page
    .getByTestId("cart-summary-total-price")
    .textContent();

  // Capturar os preços de ambos os itens para calcular o total correto
  const firstItemPrice = await page
    .getByTestId("cart-product-item-unit-price-discounted")
    .first()
    .textContent();
  const secondItemPrice = await page
    .getByTestId("cart-product-item-unit-price-discounted")
    .nth(1)
    .textContent();

  // Total deve ser a soma dos preços de todos os itens + shipping fee
  const expectedTotalWithTwoItems =
    extractPriceValue(firstItemPrice!) +
    extractPriceValue(secondItemPrice!) +
    SHIPPING_FEE;

  expect(extractPriceValue(totalPriceWithTwoItems!)).toBeCloseTo(
    expectedTotalWithTwoItems,
    2,
  );
});

// Teste adicional para verificar comportamento com quantidade zero
test("decrementar quantidade até zero remove o item", async ({ page }) => {
  await page.goto("/home");
  await page.waitForLoadState("networkidle");

  const buy = page.locator('[aria-label="Carrossel - Comprar"]').first();
  await expect(buy).toBeVisible({ timeout: 10_000 });
  await buy.click();

  const cartModal = page.getByTestId("cart-modal");
  await expect(cartModal).toBeVisible({ timeout: 10_000 });

  // Verificar que há um item no carrinho
  await expect(page.getByTestId("cart-product-item")).toHaveCount(1);

  // Diminuir quantidade (deve remover o item quando chegar a zero)
  await page.getByTestId("decrement-button").click();

  // Verificar que o item foi removido
  await expect(page.getByTestId("cart-product-item")).toHaveCount(0);
});

// Teste para verificar múltiplos incrementos
test("incrementar quantidade múltiplas vezes", async ({ page }) => {
  await page.goto("/home");
  await page.waitForLoadState("networkidle");

  const buy = page.locator('[aria-label="Carrossel - Comprar"]').first();
  await expect(buy).toBeVisible({ timeout: 10_000 });
  await buy.click();

  const cartModal = page.getByTestId("cart-modal");
  await expect(cartModal).toBeVisible({ timeout: 10_000 });

  // Incrementar 3 vezes
  await page.getByTestId("increment-button").click();
  await page.getByTestId("increment-button").click();
  await page.getByTestId("increment-button").click();

  // Verificar que a quantidade é 4 (1 inicial + 3 incrementos)
  await expect(page.getByTestId("cart-product-item-quantity")).toHaveText("4");
});
