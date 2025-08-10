// tests/baseline/baseline-capture.js
// SISTEMA COMPLETO DE CAPTURA DE BASELINE - COMPORTAMENTO ATUAL

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASELINE_DIR = './tests/baseline/snapshots';
const BASE_URL = 'http://localhost:3000/home';

// Ensure baseline directory exists
if (!fs.existsSync(BASELINE_DIR)) {
  fs.mkdirSync(BASELINE_DIR, { recursive: true });
}

class BaselineCapture {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      timestamp: new Date().toISOString(),
      scenarios: {},
      localStorage: {},
      cookies: {},
      analytics: [],
      errors: []
    };
  }

  async init() {
    this.browser = await chromium.launch({ headless: false });
    this.page = await this.browser.newPage();
    
    // Capture console logs and errors
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.results.errors.push({
          scenario: this.currentScenario,
          message: msg.text(),
          timestamp: new Date().toISOString()
        });
      }
    });

    // Capture analytics calls
    this.page.on('request', request => {
      if (request.url().includes('google-analytics') || 
          request.url().includes('gtag') ||
          request.url().includes('dataLayer')) {
        this.results.analytics.push({
          scenario: this.currentScenario,
          url: request.url(),
          method: request.method(),
          postData: request.postData(),
          timestamp: new Date().toISOString()
        });
      }
    });

    await this.page.goto(BASE_URL);
    await this.page.waitForLoadState('networkidle');
  }

  async captureState(scenarioName) {
    console.log(`📊 Capturing state for: ${scenarioName}`);
    this.currentScenario = scenarioName;
    
    try {
      console.log('📍 Getting cart items...');
      const cartItems = await this.getCartItems();
      console.log('📍 Getting cart total...');
      const cartTotal = await this.getCartTotal();
      console.log('📍 Getting cart summary...');
      const cartSummary = await this.getCartSummary();
      console.log('📍 Getting applied coupons...');
      const appliedCoupons = await this.getAppliedCoupons();
      
      console.log('📍 Getting storage...');
      const localStorage = await this.getLocalStorage();
      const sessionStorage = await this.getSessionStorage();
      const cookies = await this.getCookies();
      
      console.log('📍 Getting UI state...');
      const modalOpen = await this.isCartModalOpen();
      const couponInputVisible = await this.isCouponInputVisible();
      const loadingStates = await this.getLoadingStates();
      
      console.log('📍 Getting network state...');
      const pendingRequests = await this.getPendingRequests();
      
      console.log('📍 Getting analytics...');
      const dataLayer = await this.getDataLayer();
      
      const state = {
        scenario: scenarioName,
        timestamp: new Date().toISOString(),
        
        // DOM State
        cartItems,
        cartTotal,
        cartSummary,
        appliedCoupons,
        
        // Storage State
        localStorage,
        sessionStorage,
        cookies,
        
        // UI State
        modalOpen,
        couponInputVisible,
        loadingStates,
        
        // Network State
        pendingRequests,
        
        // Analytics State
        dataLayer
      };
      
      this.results.scenarios[scenarioName] = state;
      console.log(`✅ State captured for: ${scenarioName}`);
      return state;
    } catch (error) {
      console.error(`❌ Error capturing ${scenarioName}:`, error.message);
      return { error: error.message };
    }
  }

  // ============================================================================
  // DOM Capture Methods
  // ============================================================================

  async getCartItems() {
    try {
      return await this.page.evaluate(() => {
        const cartItems = [];
        
        // Try different selectors for cart items
        const itemSelectors = [
          '[data-testid="cart-item"]',
          '.cart-item',
          '[class*="cart"] [class*="item"]'
        ];
        
        for (const selector of itemSelectors) {
          const items = document.querySelectorAll(selector);
          if (items.length > 0) {
            items.forEach((item, index) => {
              cartItems.push({
                index,
                id: item.dataset.productId || item.id || `item-${index}`,
                name: item.querySelector('[class*="name"], .product-name, h3, h4')?.textContent?.trim(),
                price: item.querySelector('[class*="price"], .price')?.textContent?.trim(),
                originalPrice: item.querySelector('[class*="original"], .line-through')?.textContent?.trim(),
                quantity: item.querySelector('[class*="quantity"], .qty, input[type="number"]')?.value || 
                         item.querySelector('[class*="quantity"]')?.textContent?.trim(),
                html: item.outerHTML.substring(0, 500) // First 500 chars for debugging
              });
            });
            break;
          }
        }
        
        return cartItems;
      });
    } catch (error) {
      return { error: error.message };
    }
  }

  async getCartTotal() {
    try {
      return await this.page.evaluate(() => {
        const totalSelectors = [
          '[data-testid="cart-summary-total-price"]',
          '[data-testid="cart-total"]',
          '.cart-total',
          '[class*="total"]'
        ];
        
        for (const selector of totalSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            return {
              text: element.textContent?.trim(),
              value: element.dataset.value,
              selector: selector
            };
          }
        }
        
        return null;
      });
    } catch (error) {
      return { error: error.message };
    }
  }

  async getCartSummary() {
    try {
      return await this.page.evaluate(() => {
        const summary = {
          subtotal: null,
          discount: null,
          shipping: null,
          total: null
        };
        
        // Common text patterns
        const patterns = {
          subtotal: /subtotal|sub-total/i,
          discount: /desconto|discount/i,
          shipping: /frete|shipping/i,
          total: /total/i
        };
        
        // Look for summary sections
        const summaryElements = document.querySelectorAll('[class*="summary"], [class*="total"], .cart-summary');
        
        summaryElements.forEach(section => {
          const lines = section.querySelectorAll('div, p, span');
          lines.forEach(line => {
            const text = line.textContent?.trim();
            if (!text) return;
            
            Object.entries(patterns).forEach(([key, pattern]) => {
              if (pattern.test(text) && text.match(/R\$\s*[\d,\.]+/)) {
                summary[key] = {
                  text: text,
                  value: text.match(/R\$\s*([\d,\.]+)/)?.[1]
                };
              }
            });
          });
        });
        
        return summary;
      });
    } catch (error) {
      return { error: error.message };
    }
  }

  async getAppliedCoupons() {
    try {
      return await this.page.evaluate(() => {
        const coupons = [];
        
        const couponSelectors = [
          '[data-testid="coupon-item"]',
          '[class*="coupon"]',
          '[class*="cupom"]'
        ];
        
        for (const selector of couponSelectors) {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            coupons.push({
              code: element.textContent?.trim(),
              visible: element.offsetWidth > 0 && element.offsetHeight > 0,
              html: element.outerHTML.substring(0, 200)
            });
          });
        }
        
        return coupons;
      });
    } catch (error) {
      return { error: error.message };
    }
  }

  // ============================================================================
  // Storage Capture Methods
  // ============================================================================

  async getLocalStorage() {
    try {
      return await this.page.evaluate(() => {
        const storage = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          try {
            storage[key] = JSON.parse(localStorage.getItem(key));
          } catch {
            storage[key] = localStorage.getItem(key);
          }
        }
        return storage;
      });
    } catch (error) {
      return { error: error.message };
    }
  }

  async getSessionStorage() {
    try {
      return await this.page.evaluate(() => {
        const storage = {};
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          try {
            storage[key] = JSON.parse(sessionStorage.getItem(key));
          } catch {
            storage[key] = sessionStorage.getItem(key);
          }
        }
        return storage;
      });
    } catch (error) {
      return { error: error.message };
    }
  }

  async getCookies() {
    try {
      const cookies = await this.page.context().cookies();
      return cookies.reduce((acc, cookie) => {
        acc[cookie.name] = {
          value: cookie.value,
          domain: cookie.domain,
          path: cookie.path,
          expires: cookie.expires,
          httpOnly: cookie.httpOnly,
          secure: cookie.secure
        };
        return acc;
      }, {});
    } catch (error) {
      return { error: error.message };
    }
  }

  async getDataLayer() {
    try {
      return await this.page.evaluate(() => {
        return window.dataLayer || [];
      });
    } catch (error) {
      return { error: error.message };
    }
  }

  // ============================================================================
  // UI State Methods
  // ============================================================================

  async isCartModalOpen() {
    try {
      return await this.page.evaluate(() => {
        const modalSelectors = [
          '[data-testid="cart-modal"]',
          '.modal.open',
          '[class*="modal"][class*="open"]',
          '[class*="sidebar"][class*="mounted"]'
        ];
        
        return modalSelectors.some(selector => {
          const element = document.querySelector(selector);
          return element && element.offsetWidth > 0 && element.offsetHeight > 0;
        });
      });
    } catch (error) {
      return { error: error.message };
    }
  }

  async isCouponInputVisible() {
    try {
      return await this.page.evaluate(() => {
        const inputSelectors = [
          '[data-testid="coupon-input"]',
          'input[placeholder*="cupom"]',
          'input[placeholder*="desconto"]'
        ];
        
        return inputSelectors.some(selector => {
          const element = document.querySelector(selector);
          return element && element.offsetWidth > 0 && element.offsetHeight > 0;
        });
      });
    } catch (error) {
      return { error: error.message };
    }
  }

  async getLoadingStates() {
    try {
      return await this.page.evaluate(() => {
        const loadingElements = document.querySelectorAll(
          '[class*="loading"], [class*="spinner"], .loading-spinner, [data-testid*="loading"]'
        );
        
        return Array.from(loadingElements).map(el => ({
          visible: el.offsetWidth > 0 && el.offsetHeight > 0,
          text: el.textContent?.trim(),
          classes: el.className
        }));
      });
    } catch (error) {
      return { error: error.message };
    }
  }

  async getPendingRequests() {
    // This would need to be tracked throughout the session
    return this.pendingRequests || [];
  }

  // ============================================================================
  // Action Methods
  // ============================================================================

  async getAvailableProducts() {
    try {
      return await this.page.evaluate(() => {
        const products = [];
        const addButtons = document.querySelectorAll('[data-testid^="add-to-cart-"]');
        
        addButtons.forEach(button => {
          const testId = button.getAttribute('data-testid');
          const productId = testId?.replace('add-to-cart-', '');
          if (productId) {
            // Find product name in parent elements
            const productContainer = button.closest('[class*="product"], [class*="carousel"], .Product, .ProductComplete');
            const nameElement = productContainer?.querySelector('h3, h4, p, span') || 
                               productContainer?.querySelector('[class*="name"], [class*="title"]');
            
            products.push({
              id: productId,
              name: nameElement?.textContent?.trim() || `Product ${productId}`,
              button: testId
            });
          }
        });
        
        return products;
      });
    } catch (error) {
      return [];
    }
  }

  async addProductToCart(productData = null) {
    try {
      // If no product specified, find the first available product
      if (!productData) {
        const availableProducts = await this.getAvailableProducts();
        if (availableProducts.length === 0) {
          throw new Error('No products found on page');
        }
        productData = availableProducts[0];
      }
      
      await this.captureState(`before_add_product_${productData.id}`);
      
      // Find and click add to cart button using the data-testid
      const selector = `[data-testid="add-to-cart-${productData.id}"]`;
      
      try {
        await this.page.waitForSelector(selector, { timeout: 5000 });
        await this.page.click(selector);
      } catch (e) {
        throw new Error(`Could not find or click add to cart button for product ${productData.id}: ${e.message}`);
      }
      
      // Wait for any animations/updates
      await this.page.waitForTimeout(1000);
      
      return await this.captureState(`after_add_product_${productData.id}`);
    } catch (error) {
      this.results.errors.push({
        scenario: `add_product_${productData?.id || 'unknown'}`,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return { error: error.message };
    }
  }

  async removeProductFromCart(productId) {
    try {
      console.log(`📍 LINE: Capturing before remove state for product ${productId}...`);
      await this.captureState(`before_remove_product_${productId}`);
      
      console.log(`📍 LINE: Looking for remove button for product ${productId}...`);
      const removeButtonSelectors = [
        `[data-testid="remove-product-button"]`,
        `[data-testid="remove-product-${productId}"]`,
        `[data-product-id="${productId}"] [class*="remove"]`,
        `[data-product-id="${productId}"] [class*="trash"]`,
        '.remove-item'
      ];
      
      // Check if there are any remove buttons available
      const removeButtons = await this.page.$$('[data-testid="remove-product-button"]');
      console.log(`📍 LINE: Found ${removeButtons.length} remove buttons`);
      
      if (removeButtons.length === 0) {
        console.log(`📍 LINE: No products to remove - cart might be empty`);
        return { skipped: 'no_products_to_remove' };
      }

      let clicked = false;
      for (const selector of removeButtonSelectors) {
        try {
          console.log(`📍 LINE: Trying selector: ${selector}`);
          await this.page.click(selector, { timeout: 2000 });
          console.log(`📍 LINE: Successfully clicked: ${selector}`);
          clicked = true;
          break;
        } catch (e) {
          console.log(`📍 LINE: Failed selector: ${selector} - ${e.message}`);
          continue;
        }
      }
      
      if (!clicked) {
        console.log(`📍 LINE: No remove button found for product ${productId}`);
        throw new Error('Could not find remove button');
      }
      
      console.log(`📍 LINE: Waiting after remove click...`);
      await this.page.waitForTimeout(1000);
      
      console.log(`📍 LINE: Capturing after remove state...`);
      return await this.captureState(`after_remove_product_${productId}`);
    } catch (error) {
      console.error(`❌ Remove product failed: ${error.message}`);
      this.results.errors.push({
        scenario: `remove_product_${productId}`,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return { error: error.message };
    }
  }

  async changeProductQuantity(action, productName) {
    try {
      console.log(`📍 LINE: Changing quantity (${action}) for ${productName}...`);
      await this.captureState(`before_quantity_${action}_${productName}`);
      
      const buttonSelector = action === 'increment' 
        ? '[data-testid="increment-button"]' 
        : '[data-testid="decrement-button"]';
      
      console.log(`📍 LINE: Looking for ${action} buttons...`);
      const buttons = await this.page.$$(buttonSelector);
      console.log(`📍 LINE: Found ${buttons.length} ${action} buttons`);
      
      if (buttons.length === 0) {
        console.log(`📍 LINE: No ${action} buttons found`);
        return { skipped: `no_${action}_buttons` };
      }

      // Click the first available button
      console.log(`📍 LINE: Clicking ${action} button...`);
      await this.page.click(buttonSelector);
      console.log(`📍 LINE: Successfully clicked ${action} button`);
      
      // Wait for quantity update
      await this.page.waitForTimeout(1000);
      
      console.log(`📍 LINE: Capturing after quantity ${action}...`);
      return await this.captureState(`after_quantity_${action}_${productName}`);
    } catch (error) {
      console.error(`❌ Change quantity ${action} failed: ${error.message}`);
      this.results.errors.push({
        scenario: `change_quantity_${action}`,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return { error: error.message };
    }
  }

  async openCart() {
    try {
      // Check if cart is already open
      const isCartOpen = await this.isCartModalOpen();
      if (isCartOpen) {
        console.log('🛒 Cart is already open');
        return true;
      }

      const cartButtonSelectors = [
        '[data-testid="cart-button"]',
        '[class*="cart"][class*="button"]',
        '.cart-icon',
        '[data-testid="cart-modal-trigger"]'
      ];
      
      for (const selector of cartButtonSelectors) {
        try {
          await this.page.click(selector);
          await this.page.waitForTimeout(1000);
          return true;
        } catch (e) {
          continue;
        }
      }
      
      // If we can't find a button, cart might already be open
      console.log('⚠️ Could not find cart button, assuming cart is open');
      return true;
    } catch (error) {
      return { error: error.message };
    }
  }

  async closeCart() {
    try {
      const isCartOpen = await this.isCartModalOpen();
      if (!isCartOpen) {
        console.log('🛒 Cart is already closed');
        return true;
      }

      const closeButtonSelectors = [
        '[data-testid="close-cart-button"]',
        '[data-testid="close-cart"]',
        '[data-testid="cart-modal"] [class*="close"]',
        '[data-testid="cart-modal"] button:first-child',
        '.modal-close',
        '[aria-label="Close"]'
      ];
      
      for (const selector of closeButtonSelectors) {
        try {
          await this.page.click(selector);
          await this.page.waitForTimeout(500);
          console.log('🛒 Cart closed');
          return true;
        } catch (e) {
          continue;
        }
      }

      // Try clicking on backdrop
      try {
        await this.page.click('[class*="backdrop"], [class*="overlay"]');
        await this.page.waitForTimeout(500);
        console.log('🛒 Cart closed via backdrop');
        return true;
      } catch (e) {
        // Continue
      }
      
      console.log('⚠️ Could not close cart, continuing anyway');
      return true;
    } catch (error) {
      return { error: error.message };
    }
  }

  async applyCoupon(couponCode) {
    try {
      await this.captureState(`before_apply_coupon_${couponCode}`);
      
      // Open coupon input if needed
      const toggleSelectors = [
        '[data-testid="coupon-toggle-button"]',
        '[class*="cupom"][class*="toggle"]',
        'button:has-text("cupom")',
        'button:has-text("desconto")'
      ];
      
      for (const selector of toggleSelectors) {
        try {
          await this.page.click(selector);
          await this.page.waitForTimeout(1000);
          break;
        } catch (e) {
          continue;
        }
      }
      
      // Fill coupon input
      const inputSelectors = [
        '[data-testid="coupon-input"]',
        'input[placeholder*="cupom"]',
        'input[placeholder*="código"]'
      ];
      
      let filled = false;
      for (const selector of inputSelectors) {
        try {
          await this.page.fill(selector, couponCode);
          filled = true;
          break;
        } catch (e) {
          continue;
        }
      }
      
      if (!filled) {
        throw new Error('Could not find coupon input');
      }
      
      // Click apply button
      const applyButtonSelectors = [
        '[data-testid="apply-coupon-button"]',
        'button[type="submit"]',
        '[class*="apply"]',
        'button:has-text("aplicar")'
      ];
      
      let applied = false;
      for (const selector of applyButtonSelectors) {
        try {
          await this.page.click(selector);
          applied = true;
          break;
        } catch (e) {
          continue;
        }
      }
      
      if (!applied) {
        throw new Error('Could not find apply button');
      }
      
      // Wait for processing
      await this.page.waitForTimeout(2000);
      
      return await this.captureState(`after_apply_coupon_${couponCode}`);
    } catch (error) {
      this.results.errors.push({
        scenario: `apply_coupon_${couponCode}`,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return { error: error.message };
    }
  }

  async removeCoupon(couponCode) {
    try {
      await this.captureState(`before_remove_coupon_${couponCode}`);
      
      const removeButtonSelectors = [
        '[data-testid="remove-coupon-button"]',
        `[data-coupon="${couponCode}"] [class*="remove"]`,
        `[data-coupon="${couponCode}"] [class*="close"]`,
        '.coupon .remove'
      ];
      
      let clicked = false;
      for (const selector of removeButtonSelectors) {
        try {
          await this.page.click(selector);
          clicked = true;
          break;
        } catch (e) {
          continue;
        }
      }
      
      if (!clicked) {
        throw new Error('Could not find remove coupon button');
      }
      
      await this.page.waitForTimeout(1000);
      
      return await this.captureState(`after_remove_coupon_${couponCode}`);
    } catch (error) {
      this.results.errors.push({
        scenario: `remove_coupon_${couponCode}`,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return { error: error.message };
    }
  }

  async navigateToCheckout() {
    try {
      await this.captureState('before_navigate_checkout');
      
      const checkoutButtonSelectors = [
        '[href="/checkout#top"]',
        '[href="/checkout"]',
        'a:has-text("finalizar pedido")',
        'a:has-text("finalizar")',
        'button:has-text("checkout")',
        '.checkout-button'
      ];
      
      console.log('📍 LINE: Looking for checkout button...');
      let navigated = false;
      for (const selector of checkoutButtonSelectors) {
        try {
          console.log(`📍 LINE: Trying checkout selector: ${selector}`);
          await this.page.click(selector, { timeout: 3000 });
          console.log(`📍 LINE: Successfully clicked: ${selector}`);
          console.log('📍 LINE: Waiting for page to load...');
          await this.page.waitForLoadState('networkidle');
          navigated = true;
          break;
        } catch (e) {
          console.log(`📍 LINE: Failed checkout selector: ${selector} - ${e.message}`);
          continue;
        }
      }
      
      if (!navigated) {
        console.log('📍 LINE: Could not find checkout button');
        throw new Error('Could not navigate to checkout');
      }
      
      return await this.captureState('after_navigate_checkout');
    } catch (error) {
      return { error: error.message };
    }
  }

  async captureCheckoutData() {
    try {
      // Capture what would be sent to backend
      const checkoutPayload = await this.page.evaluate(() => {
        // Try to find checkout form data
        const formData = new FormData();
        const form = document.querySelector('form');
        
        if (form) {
          const inputs = form.querySelectorAll('input, select, textarea');
          inputs.forEach(input => {
            if (input.name && input.value) {
              formData.append(input.name, input.value);
            }
          });
        }
        
        // Try to access cart data from global state
        const cartData = {
          localStorage: localStorage.getItem('cart'),
          cupons: localStorage.getItem('cupons'),
          context: window.__CART_CONTEXT__ // If exposed
        };
        
        return {
          formData: Object.fromEntries(formData.entries()),
          cartData,
          url: window.location.href
        };
      });
      
      return await this.captureState('checkout_data');
    } catch (error) {
      return { error: error.message };
    }
  }

  // ============================================================================
  // Complete Baseline Capture
  // ============================================================================

  async runCompleteBaseline() {
    console.log('🚀 Starting Complete Baseline Capture...');
    
    try {
      await this.init();
      
      // Initial state
      await this.captureState('initial_page_load');
      
      // Get available products
      console.log('🔍 Discovering available products...');
      const availableProducts = await this.getAvailableProducts();
      console.log(`Found ${availableProducts.length} products:`, availableProducts.map(p => `${p.id}: ${p.name}`));
      
      if (availableProducts.length < 2) {
        throw new Error('Need at least 2 products to run complete baseline tests');
      }
      
      const [product1, product2, product3] = availableProducts;
      
      // Test 1: Add single product
      console.log(`📦 Testing: Add single product (${product1.name})...`);
      console.log('📍 LINE: Adding product to cart...');
      await this.addProductToCart(product1);
      console.log('📍 LINE: Opening cart modal...');
      await this.openCart();
      console.log('📍 LINE: Capturing single product state...');
      await this.captureState('single_product_in_cart');
      
      // Test 2: Add another product
      if (product2) {
        console.log(`📦 Testing: Add second product (${product2.name})...`);
        console.log('📍 LINE: Closing cart modal...');
        await this.closeCart();
        console.log('📍 LINE: Adding second product to cart...');
        await this.addProductToCart(product2);
        console.log('📍 LINE: Opening cart modal again...');
        await this.openCart();
        console.log('📍 LINE: Capturing two products state...');
        await this.captureState('two_products_in_cart');
        
        // Test 2a: Test quantity controls with two products
        console.log('🔢 Testing: Increment quantity of first product...');
        await this.changeProductQuantity('increment', product1.name);
        
        console.log('🔢 Testing: Increment again to test multiple increments...');
        await this.changeProductQuantity('increment', product1.name);
        
        console.log('🔢 Testing: Decrement quantity back...');
        await this.changeProductQuantity('decrement', product1.name);
      }
      
      // Test 3: Apply coupon to cart with products
      console.log('🎫 Testing: Apply coupon to cart with products...');
      console.log('📍 LINE: Applying coupon ABC2...');
      await this.applyCoupon('ABC2');
      console.log('📍 LINE: Capturing coupon applied state...');
      await this.captureState('coupon_applied_to_products');
      
      // Test 4: Add product AFTER coupon applied (if we have a third product)
      if (product3) {
        console.log(`📦 Testing: Add product after coupon applied (${product3.name})...`);
        console.log('📍 LINE: Closing cart to add third product...');
        await this.closeCart();
        console.log('📍 LINE: Adding third product to cart...');
        await this.addProductToCart(product3);
        console.log('📍 LINE: Opening cart to see third product...');
        await this.openCart();
        console.log('📍 LINE: Capturing product added after coupon state...');
        await this.captureState('product_added_after_coupon');
        
        // Test 4a: Test quantity changes with active coupon
        console.log('🔢 Testing: Change quantity with active coupon...');
        console.log('🔢 Testing: Increment product with coupon active...');
        await this.changeProductQuantity('increment', product3.name);
        
        console.log('🔢 Testing: Decrement to see coupon recalculation...');
        await this.changeProductQuantity('decrement', product3.name);
      }
      
      // Test 5: Remove product while coupon active
      console.log(`🗑️ Testing: Remove product while coupon active (${product1.id})...`);
      await this.removeProductFromCart(product1.id);
      await this.captureState('product_removed_with_coupon');
      
      // Test 6: Remove coupon
      console.log('❌ Testing: Remove coupon...');
      await this.removeCoupon('ABC2');
      await this.captureState('coupon_removed');
      
      // Test 7: Apply coupon to empty cart
      console.log('🎫 Testing: Apply coupon to empty cart...');
      // First clear cart
      if (product2) await this.removeProductFromCart(product2.id);
      if (product3) await this.removeProductFromCart(product3.id);
      await this.applyCoupon('ABC2');
      await this.captureState('coupon_applied_empty_cart');
      
      // Test 8: Add product to cart with pre-applied coupon
      console.log(`📦 Testing: Add product to cart with pre-applied coupon (${product1.name})...`);
      console.log('📍 LINE: Closing cart to add product to coupon cart...');
      await this.closeCart();
      console.log('📍 LINE: Adding product to cart with coupon...');
      await this.addProductToCart(product1);
      console.log('📍 LINE: Opening cart to see product with coupon...');
      await this.openCart();
      console.log('📍 LINE: Capturing product added to coupon cart state...');
      await this.captureState('product_added_to_coupon_cart');
      
      // Test 9: Navigate to checkout
      console.log('💳 Testing: Navigate to checkout...');
      await this.navigateToCheckout();
      await this.captureCheckoutData();
      
      // Test 10: Test invalid coupon
      console.log('❌ Testing: Invalid coupon...');
      console.log('📍 LINE: Current URL before navigation:', await this.page.url());
      console.log('📍 LINE: Navigating back to home (goBack has issues with Next.js routing)...');
      await this.page.goto('http://localhost:3000/home');
      console.log('📍 LINE: Successfully navigated to home');
      console.log('📍 LINE: Current URL after navigation:', await this.page.url());
      await this.page.waitForLoadState('networkidle');
      console.log('📍 LINE: Opening cart for invalid coupon test...');
      
      // Wait a bit more and try harder to open cart
      await this.page.waitForTimeout(2000);
      
      // Try clicking cart icon if cart modal is not open
      const cartIconSelectors = [
        '[data-testid="cart-button"]',
        '[data-testid="cart-icon"]',
        '.cart-icon',
        '[class*="cart"][class*="icon"]'
      ];
      
      for (const selector of cartIconSelectors) {
        try {
          console.log(`📍 LINE: Trying to click cart icon: ${selector}`);
          await this.page.click(selector, { timeout: 3000 });
          await this.page.waitForTimeout(1000);
          console.log(`📍 LINE: Successfully clicked cart icon: ${selector}`);
          break;
        } catch (e) {
          console.log(`📍 LINE: Failed cart icon: ${selector} - ${e.message}`);
          continue;
        }
      }
      console.log('📍 LINE: Applying invalid coupon...');
      await this.applyCoupon('INVALIDCOUPON');
      console.log('📍 LINE: Capturing invalid coupon state...');
      await this.captureState('invalid_coupon_attempt');
      
      // Test 11: Refresh page (persistence test)
      console.log('🔄 Testing: Page refresh persistence...');
      await this.page.reload();
      await this.page.waitForLoadState('networkidle');
      await this.captureState('after_page_refresh');
      
      // Test 12: URL parameter coupon
      console.log('🔗 Testing: URL parameter coupon...');
      await this.page.goto(`http://localhost:3000/home?cupom=ABC3`);
      await this.page.waitForLoadState('networkidle');
      await this.captureState('url_parameter_coupon');
      
      console.log('✅ Baseline capture completed successfully!');
      
    } catch (error) {
      console.error('❌ Baseline capture failed:', error);
      this.results.errors.push({
        scenario: 'complete_baseline',
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    } finally {
      await this.saveResults();
      await this.cleanup();
    }
  }

  async saveResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    // Determine the prefix based on environment variable or default
    const isPostRefactor = process.env.POST_REFACTOR === 'true';
    const prefix = isPostRefactor ? 'baseline-post-refactor' : 'baseline-pre-refactor';
    
    const filename = `${prefix}-cart-coupons-${timestamp}.json`;
    const filepath = path.join(BASELINE_DIR, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(this.results, null, 2));
    console.log(`💾 Baseline saved to: ${filepath}`);
    
    // Also save a "latest" version with descriptive name
    const latestPath = path.join(BASELINE_DIR, `${prefix}-latest.json`);
    fs.writeFileSync(latestPath, JSON.stringify(this.results, null, 2));
    
    return filepath;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Export for use in tests
export { BaselineCapture };

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith('baseline-capture.js')) {
  const capture = new BaselineCapture();
  capture.runCompleteBaseline().catch(console.error);
}