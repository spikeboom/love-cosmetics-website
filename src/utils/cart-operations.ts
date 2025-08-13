import { processProdutosComOuSemCupom } from "@/core/processing/product-processing";

export const addProductToCart = (product: any, cart: any, setCart: any, setLoadingAddItem: any, cupons: any, addProductEvent: any) => {
  setLoadingAddItem(true);

  const newCart = { ...cart };
  if (newCart[product.id]) {
    newCart[product.id].quantity += 1;
  } else {
    newCart[product.id] = { ...product, quantity: 1 };
  }

  processProdutosComOuSemCupom(
    { data: Object.values(newCart) },
    cupons?.[0]?.codigo,
    cart,
  ).then((cartResult) => {
    cartResult = cartResult?.data?.reduce((acc: any, item: any) => {
      acc[item.id] = item;
      return acc;
    }, {});
    setCart(cartResult);

    addProductEvent(product);

    setLoadingAddItem(false);
  });
};

export const addQuantityProductToCart = ({ product }: any, cart: any, setCart: any, addProductEvent: any) => {
  const newCart = { ...cart };
  if (newCart[product.id]) {
    newCart[product.id].quantity += 1;
  }
  setCart(newCart);

  addProductEvent(product);
};

export const subtractQuantityProductToCart = ({ product }: any, cart: any, setCart: any, removeProductFromCartFn: any) => {
  const newCart = { ...cart };
  if (newCart[product.id] && newCart[product.id].quantity > 1) {
    newCart[product.id].quantity -= 1;
  } else if (newCart[product.id] && newCart[product.id].quantity === 1) {
    removeProductFromCartFn({ product });
    return;
  }
  setCart(newCart);
};

export const removeProductFromCart = ({ product }: any, cart: any, setCart: any) => {
  const newCart = { ...cart };
  if (newCart[product.id]) {
    delete newCart[product.id];
  }
  setCart(newCart);
};

export const clearCart = (setCart: any, setCupons: any) => {
  localStorage.removeItem("cart");
  localStorage.removeItem("cupons");
  setCart({});
  setCupons({});
};