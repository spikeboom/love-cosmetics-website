// Core exports - ponto central para todas as funcionalidades organizadas

// UI
export { UIContextProvider, useUI } from './ui/UIContext';

// Storage
export { StorageService } from './storage/storage-service';

// Utils
export { CartCalculations } from './utils/cart-calculations';

// Tracking
export * from './tracking/product-tracking';

// Processing
export * from './processing/product-processing';

// Notifications
export { NotificationProvider, useNotifications } from './notifications/NotificationContext';
export { createNotify } from './notifications/notification-system';