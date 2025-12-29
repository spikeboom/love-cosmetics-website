// Contexts individuais
export * from './cart';
export * from './coupon';
export * from './shipping';
export * from './auth';
export * from './cart-totals';

// Provider composto (recomendado)
export { ComposedProvider } from './ComposedProvider';

// Adapter de compatibilidade (deprecated)
export { useMeuContextoAdapter } from './compat';
