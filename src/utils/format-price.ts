export const formatPrice = (price: number | string) =>
  Number(price)?.toFixed(2).toString().replace(".", ",");
