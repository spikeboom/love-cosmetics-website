// Contexts individuais
export * from './cart';
export * from './coupon';
export * from './shipping';
export * from './cart-totals';

// Auth - usar o existente na raiz (mais completo)
export { AuthProvider, useAuth } from './AuthContext';

// Provider composto (recomendado)
export { ComposedProvider } from './ComposedProvider';

// Provider para layouts Figma (sem AuthProvider, pois já está no layout raiz)
export { FigmaProvider } from './FigmaProvider';

// Adapter de compatibilidade (deprecated)
export { useMeuContextoAdapter } from './compat';
