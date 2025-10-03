// MOVIDO EXATAMENTE do context.jsx useEffect
export class StorageService {
  // Cart operations
  static loadCart() {
    const cart = localStorage.getItem("cart");
    return cart ? JSON.parse(cart) : {};
  }

  static saveCart(cart: any) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // Coupon operations
  static loadCoupons() {
    const cupons = localStorage.getItem("cupons");
    return cupons ? JSON.parse(cupons) : [];
  }

  static saveCoupons(cupons: any) {
    localStorage.setItem("cupons", JSON.stringify(cupons));
  }

  // Clear operations
  static clearCart() {
    localStorage.removeItem("cart");
  }

  static clearCoupons() {
    localStorage.removeItem("cupons");
  }

  static clearAll() {
    StorageService.clearCart();
    StorageService.clearCoupons();
  }

  // Initialize data from localStorage (EXATO do useEffect original)
  static initializeFromStorage() {
    return {
      cart: StorageService.loadCart(),
      cupons: StorageService.loadCoupons(),
    };
  }
}