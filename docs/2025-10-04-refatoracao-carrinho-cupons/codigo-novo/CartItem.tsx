// docs/refatoracao-carrinho-cupons/codigo-novo/CartItem.tsx
// COMPONENTE DE ITEM DO CARRINHO - Visual simplificado com preços

import React from 'react';
import Image from 'next/image';
import { IoAdd, IoRemove, IoTrash } from 'react-icons/io5';
import { useCart } from './CartContext';

interface CartItemProps {
  productId: string;
}

export function CartItem({ productId }: CartItemProps) {
  const { items, updateQuantity, removeFromCart } = useCart();
  const product = items[productId];
  
  if (!product) return null;
  
  const hasDiscount = product.currentPrice < product.originalPrice;
  const discountPercentage = hasDiscount 
    ? Math.round((1 - product.currentPrice / product.originalPrice) * 100)
    : 0;
  
  const handleIncrement = () => {
    updateQuantity(productId, product.quantity + 1);
  };
  
  const handleDecrement = () => {
    if (product.quantity > 1) {
      updateQuantity(productId, product.quantity - 1);
    }
  };
  
  const handleRemove = () => {
    removeFromCart(productId);
  };
  
  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };
  
  return (
    <div className="flex gap-3 p-3 border-b border-gray-200 hover:bg-gray-50 transition-colors">
      {/* Imagem do produto */}
      <div className="relative w-20 h-20 flex-shrink-0">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover rounded-md"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
            <span className="text-gray-400 text-xs">Sem imagem</span>
          </div>
        )}
        
        {/* Badge de desconto */}
        {hasDiscount && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center">
            -{discountPercentage}%
          </div>
        )}
      </div>
      
      {/* Informações do produto */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {product.name}
        </h3>
        
        {/* Preços */}
        <div className="flex items-center gap-2 mt-1">
          {hasDiscount && (
            <>
              <span className="text-sm font-semibold text-green-600">
                {formatPrice(product.currentPrice)}
              </span>
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            </>
          )}
          {!hasDiscount && (
            <span className="text-sm font-semibold text-gray-900">
              {formatPrice(product.currentPrice)}
            </span>
          )}
        </div>
        
        {/* Controles de quantidade */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center border border-gray-300 rounded-md">
            <button
              onClick={handleDecrement}
              className="p-1 hover:bg-gray-100 transition-colors"
              aria-label="Diminuir quantidade"
            >
              <IoRemove size={16} />
            </button>
            
            <span className="px-3 py-1 text-sm font-medium min-w-[40px] text-center">
              {product.quantity}
            </span>
            
            <button
              onClick={handleIncrement}
              className="p-1 hover:bg-gray-100 transition-colors"
              aria-label="Aumentar quantidade"
            >
              <IoAdd size={16} />
            </button>
          </div>
          
          <button
            onClick={handleRemove}
            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
            aria-label="Remover produto"
          >
            <IoTrash size={18} />
          </button>
          
          {/* Subtotal do item */}
          <span className="ml-auto text-sm font-semibold text-gray-900">
            {formatPrice(product.currentPrice * product.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Componente de Resumo do Carrinho
// =============================================================================

export function CartSummary() {
  const { totals, coupon, removeCoupon } = useCart();
  
  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="font-semibold text-gray-900 mb-3">Resumo do Pedido</h3>
      
      <div className="space-y-2">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">{formatPrice(totals.subtotal)}</span>
        </div>
        
        {/* Desconto */}
        {totals.discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600 flex items-center gap-2">
              Desconto
              {coupon && (
                <span className="text-xs bg-green-100 px-2 py-1 rounded">
                  {coupon.code}
                </span>
              )}
            </span>
            <span className="font-medium text-green-600">
              -{formatPrice(totals.discount)}
            </span>
          </div>
        )}
        
        {/* Cupom aplicado */}
        {coupon && (
          <div className="flex items-center justify-between bg-green-50 p-2 rounded">
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-700">Cupom aplicado:</span>
              <span className="text-xs font-bold text-green-800">
                {coupon.code}
              </span>
              {coupon.type === 'percentage' && (
                <span className="text-xs text-green-600">
                  ({coupon.value}% off)
                </span>
              )}
            </div>
            <button
              onClick={removeCoupon}
              className="text-xs text-red-500 hover:text-red-700"
            >
              remover
            </button>
          </div>
        )}
        
        {/* Frete */}
        {totals.shipping > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Frete</span>
            <span className="font-medium">{formatPrice(totals.shipping)}</span>
          </div>
        )}
        
        {/* Linha divisória */}
        <div className="border-t pt-2 mt-2">
          {/* Total */}
          <div className="flex justify-between">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-bold text-lg text-gray-900">
              {formatPrice(totals.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Componente de Input de Cupom
// =============================================================================

export function CouponInput() {
  const { applyCoupon, coupon, isLoading } = useCart();
  const [code, setCode] = React.useState('');
  const [showInput, setShowInput] = React.useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      await applyCoupon(code.trim());
      setCode('');
      setShowInput(false);
    }
  };
  
  // Se já tem cupom aplicado, não mostra o input
  if (coupon) {
    return null;
  }
  
  return (
    <div className="mt-3">
      {!showInput ? (
        <button
          onClick={() => setShowInput(true)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Tem um cupom de desconto?
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Digite o código"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || !code.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Validando...' : 'Aplicar'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowInput(false);
              setCode('');
            }}
            className="px-3 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
        </form>
      )}
    </div>
  );
}