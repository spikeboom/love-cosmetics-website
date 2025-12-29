export interface CartProduct {
  id: string;
  documentId?: string;
  nome: string;
  slug?: string;
  preco: number;
  preco_de?: number;
  quantity: number;
  imagem?: string;
  peso_gramas?: number;
  altura?: number;
  largura?: number;
  comprimento?: number;
  bling_number?: string;
}

export interface CartState {
  cart: Record<string, CartProduct>;
  isCartLoaded: boolean;
  loadingAddItem: boolean;
}

export interface CartOperations {
  setCart: React.Dispatch<React.SetStateAction<Record<string, CartProduct>>>;
  addProductToCart: (product: CartProduct) => void;
  addQuantityProductToCart: (params: { product: CartProduct }) => void;
  subtractQuantityProductToCart: (params: { product: CartProduct }) => void;
  removeProductFromCart: (params: { product: CartProduct }) => void;
  clearCart: () => void;
  qtdItemsCart: number;
}

export interface CartContextType extends CartState, CartOperations {}
