export interface Coupon {
  codigo: string;
  nome?: string;
  titulo?: string;
  multiplacar?: number;
  diminuir?: number;
}

export interface CouponState {
  cupons: Coupon[];
}

export interface CouponOperations {
  setCupons: React.Dispatch<React.SetStateAction<Coupon[]>>;
  handleCupom: (cupom: Coupon) => void;
  handleAddCupom: (codigo: string) => Promise<void>;
  clearCupons: () => void;
}

export interface CouponContextType extends CouponState, CouponOperations {}
