export const FREE_SHIPPING_THRESHOLD = 149;

export function isEconomicaService(carrier: string, service: string): boolean {
  const c = carrier.toLowerCase();
  const s = service.toLowerCase();
  return c.includes("correios") && s.includes("pac");
}
