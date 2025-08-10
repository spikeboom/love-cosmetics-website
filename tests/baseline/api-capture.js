// tests/baseline/api-capture.js
// CAPTURA DE DADOS DE API - BACKEND E PAGSEGURO

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASELINE_DIR = './tests/baseline/snapshots';

class APICapture {
  constructor() {
    this.browser = null;
    this.page = null;
    this.apiCalls = [];
    this.paymentRequests = [];
    this.strapiRequests = [];
  }

  async init() {
    this.browser = await chromium.launch({ headless: false });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    
    // Intercept ALL network requests
    await this.page.route('**/*', async (route) => {
      const request = route.request();
      const url = request.url();
      
      // Capture API calls we care about
      if (this.shouldCaptureRequest(url)) {
        await this.captureRequest(request);
      }
      
      // Continue with the request
      await route.continue();
    });
    
    // Capture responses
    this.page.on('response', async (response) => {
      const url = response.url();
      if (this.shouldCaptureRequest(url)) {
        await this.captureResponse(response);
      }
    });
  }

  shouldCaptureRequest(url) {
    const patterns = [
      '/api/pedido',           // Checkout API
      'api/pedido',            // Checkout API (without leading slash)
      '/api/cupom',            // Coupon API
      '/api/validate-coupon',  // New coupon validation
      'pagseguro.com',         // PagSeguro  
      'api.pagseguro.com',     // PagSeguro API
      'pagbank.com',           // PagBank (new name)
      'strapi',                // Strapi CMS
      '/api/produtos',         // Products API
      'google-analytics',      // GA tracking
      'gtag',                  // Google Tag Manager
    ];
    
    return patterns.some(pattern => url.includes(pattern));
  }

  async captureRequest(request) {
    const requestData = {
      timestamp: new Date().toISOString(),
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
      postData: null,
      scenario: this.currentScenario
    };
    
    // Capture POST data if available
    try {
      if (request.method() === 'POST') {
        requestData.postData = request.postDataJSON() || request.postData();
      }
    } catch (e) {
      requestData.postDataError = e.message;
    }
    
    // Categorize the request
    if (request.url().includes('/api/pedido') || request.url().includes('pagseguro.com')) {
      this.paymentRequests.push({
        ...requestData,
        type: 'checkout_request'
      });
    } else if (request.url().includes('cupom') || request.url().includes('coupon')) {
      this.apiCalls.push({
        ...requestData,
        type: 'coupon_request'
      });
    } else if (request.url().includes('strapi')) {
      this.strapiRequests.push({
        ...requestData,
        type: 'strapi_request'
      });
    } else {
      this.apiCalls.push({
        ...requestData,
        type: 'other_api'
      });
    }
  }

  async captureResponse(response) {
    const url = response.url();
    let responseData = null;
    let responseText = null;
    
    try {
      responseText = await response.text();
      if (response.headers()['content-type']?.includes('application/json')) {
        responseData = JSON.parse(responseText);
      }
    } catch (e) {
      // Response might not be JSON or might be too large
    }
    
    const responseInfo = {
      timestamp: new Date().toISOString(),
      url: url,
      status: response.status(),
      statusText: response.statusText(),
      headers: response.headers(),
      data: responseData,
      text: responseText?.substring(0, 5000), // Limit to 5KB
      scenario: this.currentScenario
    };
    
    // Find and update corresponding request
    const requestArrays = [this.paymentRequests, this.apiCalls, this.strapiRequests];
    
    for (const array of requestArrays) {
      const requestIndex = array.findIndex(req => 
        req.url === url && !req.response
      );
      
      if (requestIndex !== -1) {
        array[requestIndex].response = responseInfo;
        break;
      }
    }
  }

  // ============================================================================
  // Checkout Flow Capture
  // ============================================================================

  async captureCheckoutFlow() {
    this.currentScenario = 'checkout_flow';
    
    console.log('💳 Capturing checkout flow...');
    console.log('📍 LINE: Navigating to home page...');
    
    await this.page.goto('http://localhost:3000/home');
    await this.page.waitForLoadState('networkidle');
    console.log('📍 LINE: Successfully loaded home page');
    
    // Add products
    console.log('📍 LINE: Starting to add test products...');
    await this.addTestProducts();
    
    // Apply coupon
    console.log('📍 LINE: Starting to apply test coupon...');
    await this.applyTestCoupon();
    
    // Go to checkout
    console.log('📍 LINE: Starting checkout navigation...');
    await this.navigateToCheckout();
    
    // Set up interception BEFORE filling form
    console.log('📍 LINE: Setting up PagBank interception...');
    await this.setupPaymentInterception();
    
    // Fill checkout form
    console.log('📍 LINE: Starting to fill checkout form...');
    await this.fillCheckoutForm();
    
    // Capture the moment just before submission
    const preSubmitState = await this.capturePreSubmitState();
    
    // Submit checkout (payment should be intercepted)
    await this.submitAndCaptureCheckout();
    
    return {
      preSubmitState,
      apiCalls: this.apiCalls,
      paymentRequests: this.paymentRequests,
      strapiRequests: this.strapiRequests
    };
  }

  async getAvailableProducts() {
    try {
      return await this.page.evaluate(() => {
        const productElements = document.querySelectorAll('[data-testid^="add-to-cart-"]');
        
        return Array.from(productElements).map(element => {
          const testId = element.getAttribute('data-testid');
          const productId = testId ? testId.replace('add-to-cart-', '') : 'unknown';
          
          // Try to get product name from nearby elements
          const productContainer = element.closest('[class*="product"], .card, [data-product]') || element.parentElement;
          const nameElement = productContainer ? 
            productContainer.querySelector('h1, h2, h3, h4, .product-name, [class*="name"], [class*="title"]') : null;
          const productName = nameElement ? nameElement.textContent.trim() : `Product ${productId}`;
          
          return {
            id: productId,
            name: productName,
            element: element
          };
        }).filter(product => product.id !== 'unknown');
      });
    } catch (error) {
      console.error('Error getting available products:', error.message);
      return [];
    }
  }

  async addTestProducts() {
    console.log('📦 Adding test products...');
    console.log('📍 LINE: Discovering available products...');
    
    try {
      // Get available products using the same method as UI capture
      const availableProducts = await this.getAvailableProducts();
      console.log(`📍 LINE: Found ${availableProducts.length} products:`, availableProducts.map(p => `${p.id}: ${p.name}`));
      
      if (availableProducts.length === 0) {
        console.warn('⚠️ No products found on the page');
        return;
      }
      
      // Add first 2 products
      const productsToAdd = availableProducts.slice(0, 2);
      
      for (let i = 0; i < productsToAdd.length; i++) {
        const product = productsToAdd[i];
        console.log(`📍 LINE: Adding product ${product.id} (${product.name}) to cart...`);
        const selector = `[data-testid="add-to-cart-${product.id}"]`;
        
        try {
          await this.page.waitForSelector(selector, { timeout: 5000 });
          await this.page.click(selector);
          console.log(`📍 LINE: Successfully added product ${product.id}`);
          await this.page.waitForTimeout(1000);
          
          // Close cart modal if it opened (except for last product)
          if (i < productsToAdd.length - 1) {
            console.log('📍 LINE: Closing cart modal after adding product...');
            try {
              await this.page.click('[data-testid="close-cart-button"]', { timeout: 2000 });
              console.log('📍 LINE: Cart modal closed');
              await this.page.waitForTimeout(500);
            } catch (e) {
              console.log('📍 LINE: Cart was not open or could not close');
            }
          } else {
            console.log('📍 LINE: Keeping cart open for coupon application...');
          }
        } catch (e) {
          console.warn(`⚠️ Could not add product ${product.id}: ${e.message}`);
        }
      }
    } catch (error) {
      console.warn('Could not add products automatically:', error.message);
    }
  }

  async applyTestCoupon() {
    console.log('🎫 Applying test coupon...');
    console.log('📍 LINE: Cart should already be open from product addition...');
    
    try {
      // Wait a moment for cart to be ready
      await this.page.waitForTimeout(1000);
      
      // Open coupon input
      console.log('📍 LINE: Opening coupon input...');
      await this.page.click('[data-testid="coupon-toggle-button"]');
      await this.page.waitForTimeout(500);
      
      // Fill and apply coupon (using ABC2 like UI capture)
      console.log('📍 LINE: Filling coupon ABC2...');
      await this.page.fill('[data-testid="coupon-input"]', 'ABC2');
      console.log('📍 LINE: Clicking apply coupon button...');
      await this.page.click('[data-testid="apply-coupon-button"]');
      console.log('📍 LINE: Waiting for coupon application...');
      await this.page.waitForTimeout(2000);
      
    } catch (error) {
      console.warn('Could not apply coupon automatically:', error.message);
    }
  }

  async navigateToCheckout() {
    console.log('🛒 Navigating to checkout...');
    console.log('📍 LINE: Looking for checkout button...');
    
    try {
      const checkoutButtonSelectors = [
        '[href="/checkout#top"]',
        '[href="/checkout"]', 
        'a:has-text("finalizar pedido")',
        'a:has-text("finalizar")',
        'button:has-text("checkout")',
        '.checkout-button'
      ];
      
      let navigated = false;
      for (const selector of checkoutButtonSelectors) {
        try {
          console.log(`📍 LINE: Trying checkout selector: ${selector}`);
          await this.page.click(selector, { timeout: 3000 });
          console.log(`📍 LINE: Successfully clicked: ${selector}`);
          console.log('📍 LINE: Waiting for checkout page to load...');
          await this.page.waitForLoadState('networkidle');
          navigated = true;
          break;
        } catch (e) {
          console.log(`📍 LINE: Failed checkout selector: ${selector} - ${e.message}`);
          continue;
        }
      }
      
      if (!navigated) {
        console.log('📍 LINE: Could not find checkout button, trying direct navigation...');
        await this.page.goto('http://localhost:3000/checkout');
        await this.page.waitForLoadState('networkidle');
      }
      
      console.log('📍 LINE: Successfully navigated to checkout');
    } catch (error) {
      console.warn('Could not navigate to checkout:', error.message);
    }
  }

  async fillCheckoutForm() {
    console.log('📝 Filling checkout form...');
    console.log('📍 LINE: Waiting for form to be ready...');
    
    // Wait for form to load
    await this.page.waitForSelector('form', { timeout: 10000 });
    await this.page.waitForTimeout(2000);
    
    const testData = {
      nome: 'Teste Baseline',
      sobrenome: 'API Capture',
      email: 'teste.baseline@example.com',
      telefone: '11999887766', // Just numbers for masked input
      cpf: '01055044248', // Valid CPF for masked input  
      data_nascimento: '01/01/1990', // DD/MM/AAAA format for masked input
      cep: '69077-747',
      endereco: 'Rua Teste', // Fallback if CEP lookup fails
      numero: '1578',
      bairro: 'Bairro Teste', // Fallback if CEP lookup fails  
      cidade: 'Cidade Teste', // Fallback if CEP lookup fails
      estado: 'AC' // Fallback if CEP lookup fails
    };
    
    console.log('📍 LINE: Filling form fields...');
    
    // Fill nome
    try {
      console.log('📍 LINE: Filling nome...');
      const nomeSelector = '[data-testid="checkout-form-nome"]';
      await this.page.waitForSelector(nomeSelector, { timeout: 5000 });
      await this.page.fill(nomeSelector, testData.nome);
      console.log('📍 LINE: Nome filled successfully');
    } catch (e) {
      console.warn('📍 LINE: Could not fill nome:', e.message);
    }
    
    // Fill sobrenome
    try {
      console.log('📍 LINE: Filling sobrenome...');
      await this.page.fill('[name="sobrenome"]', testData.sobrenome);
      console.log('📍 LINE: Sobrenome filled successfully');
    } catch (e) {
      console.warn('📍 LINE: Could not fill sobrenome:', e.message);
    }
    
    // Fill email
    try {
      console.log('📍 LINE: Filling email...');
      const emailSelector = '[data-testid="checkout-form-email"]';
      await this.page.fill(emailSelector, testData.email);
      console.log('📍 LINE: Email filled successfully');
    } catch (e) {
      console.warn('📍 LINE: Could not fill email:', e.message);
    }
    
    // Fill telefone (masked input)
    try {
      console.log('📍 LINE: Filling telefone...');
      const telefoneSelector = '[data-testid="checkout-form-telefone"]';
      await this.page.fill(telefoneSelector, testData.telefone);
      console.log('📍 LINE: Telefone filled successfully');
    } catch (e) {
      console.warn('📍 LINE: Could not fill telefone:', e.message);
    }
    
    // Fill CPF (masked input)
    try {
      console.log('📍 LINE: Filling CPF...');
      const cpfSelector = '[data-testid="checkout-form-cpf"]';
      await this.page.fill(cpfSelector, testData.cpf);
      console.log('📍 LINE: CPF filled successfully');
    } catch (e) {
      console.warn('📍 LINE: Could not fill CPF:', e.message);
    }
    
    // Fill data_nascimento (masked input - React Hook Form Controller)
    try {
      console.log('📍 LINE: Filling data de nascimento...');
      // Try different selectors for the masked input
      const dataNascSelectors = [
        'input[placeholder="dd/mm/aaaa"]',
        'label[id="label-data_nascimento"] + div input',
        'input[name="data_nascimento"]'
      ];
      
      let filled = false;
      for (const selector of dataNascSelectors) {
        try {
          console.log(`📍 LINE: Trying data nascimento selector: ${selector}`);
          const element = await this.page.$(selector);
          if (element) {
            await element.fill(testData.data_nascimento);
            console.log(`📍 LINE: Data nascimento filled with selector: ${selector}`);
            filled = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!filled) {
        console.warn('📍 LINE: Could not fill data_nascimento - continuing without it');
      }
    } catch (e) {
      console.warn('📍 LINE: Skipping data_nascimento:', e.message);
    }
    
    // Fill CEP (masked input with auto-lookup)
    try {
      console.log('📍 LINE: Filling CEP...');
      
      // Try different selectors for CEP
      const cepSelectors = [
        'input[placeholder="00000-000"]',
        '[name="cep"]',
        'label[id="label-cep"] + div input'
      ];
      
      let cepFilled = false;
      for (const selector of cepSelectors) {
        try {
          console.log(`📍 LINE: Trying CEP selector: ${selector}`);
          const element = await this.page.$(selector);
          if (element) {
            await element.fill(testData.cep);
            console.log(`📍 LINE: CEP filled with selector: ${selector}`);
            // Trigger blur event to start CEP lookup
            await element.blur();
            console.log(`📍 LINE: CEP field blurred to trigger lookup`);
            cepFilled = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (cepFilled) {
        console.log('📍 LINE: Waiting for CEP lookup to complete (address auto-fill)...');
        await this.page.waitForTimeout(10000); // Wait even longer for CEP API call to complete
        console.log('📍 LINE: CEP lookup completed - checking what was auto-filled');
        
        // Check what fields were auto-filled
        const autoFilledFields = await this.page.evaluate(() => {
          const fields = ['endereco', 'bairro', 'cidade', 'estado'];
          const result = {};
          fields.forEach(field => {
            const element = document.querySelector(`[name="${field}"]`);
            result[field] = element ? element.value.trim() : '';
          });
          return result;
        });
        
        console.log('📍 LINE: Auto-filled fields:', autoFilledFields);
      } else {
        console.warn('📍 LINE: Could not fill CEP');
      }
    } catch (e) {
      console.warn('📍 LINE: Could not fill CEP:', e.message);
    }
    
    // Fill endereco (only if not auto-filled by CEP)
    try {
      console.log('📍 LINE: Checking if endereco needs to be filled...');
      const enderecoElement = await this.page.$('[name="endereco"]');
      const currentValue = await enderecoElement?.inputValue();
      if (!currentValue || currentValue.trim() === '') {
        console.log('📍 LINE: Filling endereco...');
        await this.page.fill('[name="endereco"]', testData.endereco);
        console.log('📍 LINE: Endereco filled successfully');
      } else {
        console.log('📍 LINE: Endereco already filled by CEP lookup:', currentValue);
      }
    } catch (e) {
      console.warn('📍 LINE: Could not fill endereco:', e.message);
    }
    
    // Fill numero (always required)
    try {
      console.log('📍 LINE: Filling numero...');
      await this.page.fill('[name="numero"]', testData.numero);
      console.log('📍 LINE: Numero filled successfully');
    } catch (e) {
      console.warn('📍 LINE: Could not fill numero:', e.message);
    }
    
    // Fill bairro (only if not auto-filled by CEP)
    try {
      console.log('📍 LINE: Checking if bairro needs to be filled...');
      const bairroElement = await this.page.$('[name="bairro"]');
      const currentValue = await bairroElement?.inputValue();
      if (!currentValue || currentValue.trim() === '') {
        console.log('📍 LINE: Filling bairro...');
        await this.page.fill('[name="bairro"]', testData.bairro);
        console.log('📍 LINE: Bairro filled successfully');
      } else {
        console.log('📍 LINE: Bairro already filled by CEP lookup:', currentValue);
      }
    } catch (e) {
      console.warn('📍 LINE: Could not fill bairro:', e.message);
    }
    
    // cidade e estado should be filled automatically by CEP lookup
    
    console.log('📍 LINE: All form fields filled, waiting before submission...');
    await this.page.waitForTimeout(2000);
  }

  async capturePreSubmitState() {
    console.log('📸 Capturing pre-submit state...');
    
    const state = {
      url: this.page.url(),
      localStorage: await this.page.evaluate(() => {
        const storage = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          storage[key] = localStorage.getItem(key);
        }
        return storage;
      }),
      cookies: await this.context.cookies(),
      formData: await this.page.evaluate(() => {
        const form = document.querySelector('form');
        if (!form) return null;
        
        const formData = {};
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
          if (input.name && input.value) {
            formData[input.name] = input.value;
          }
        });
        return formData;
      }),
      cartSummary: await this.page.evaluate(() => {
        // Try to extract cart summary from the page
        const summaryElements = document.querySelectorAll('[class*="summary"], [class*="total"]');
        const summary = {};
        
        summaryElements.forEach(element => {
          const text = element.textContent;
          if (text && text.includes('R$')) {
            const matches = text.match(/(subtotal|desconto|frete|total)[^R$]*R\$\s*([\d,\.]+)/gi);
            if (matches) {
              matches.forEach(match => {
                const [, label, value] = match.match(/(subtotal|desconto|frete|total)[^R$]*R\$\s*([\d,\.]+)/i) || [];
                if (label && value) {
                  summary[label.toLowerCase()] = value;
                }
              });
            }
          }
        });
        
        return summary;
      })
    };
    
    return state;
  }

  async setupPaymentInterception() {
    console.log('🔍 Setting up payment interception...');
    
    // Set up interception for PagBank/PagSeguro (multiple patterns)
    await this.page.route(/.*pag(bank|seguro)\.com\.br.*/, async (route) => {
      const request = route.request();
      
      console.log('🎯 Intercepted PagBank request!');
      console.log('📍 LINE: Request URL:', request.url());
      console.log('📍 LINE: Request method:', request.method());
      
      // Capture the exact data being sent
      const checkoutData = {
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: null
      };
      
      try {
        if (request.method() === 'POST') {
          const postDataText = request.postData();
          if (postDataText) {
            try {
              checkoutData.postData = JSON.parse(postDataText);
            } catch (e) {
              checkoutData.postData = postDataText;
            }
          }
        }
      } catch (e) {
        checkoutData.postDataError = e.message;
      }
      
      this.capturedCheckoutRequest = checkoutData;
      console.log('📍 LINE: Captured PagBank request with data:', !!checkoutData.postData);
      
      // Mock a successful response to avoid actual payment
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html>
            <body>
              <h1>PAGAMENTO INTERCEPTADO - BASELINE MOCK</h1>
              <p>Esta requisição foi interceptada pelo teste de baseline</p>
              <p>URL: ${request.url()}</p>
              <p>Method: ${request.method()}</p>
            </body>
          </html>
        `
      });
    });
    
    console.log('📍 LINE: PagBank interception configured');
  }

  async submitAndCaptureCheckout() {
    console.log('🔍 Submitting checkout form...');
    
    // Try to submit the form
    try {
      console.log('📍 LINE: Looking for submit button...');
      
      const submitSelectors = [
        'button[type="submit"]',
        'form button[type="submit"]',
        'button:has-text("finalizar")',
        'button:has-text("Finalizar")',
        'button:has-text("FINALIZAR")',
        '.submit-button',
        '[data-testid="submit-button"]'
      ];
      
      let submitted = false;
      for (const selector of submitSelectors) {
        try {
          console.log(`📍 LINE: Trying submit selector: ${selector}`);
          const button = await this.page.$(selector);
          if (button) {
            const isEnabled = await button.isEnabled();
            const isVisible = await button.isVisible();
            console.log(`📍 LINE: Submit button found - enabled: ${isEnabled}, visible: ${isVisible}`);
            
            if (isEnabled && isVisible) {
              console.log('📍 LINE: Clicking submit button...');
              
              // Check for validation errors before clicking
              const validationErrors = await this.page.$$eval('.MuiFormHelperText-root.Mui-error', 
                errors => errors.map(e => e.textContent));
              
              if (validationErrors.length > 0) {
                console.log('📍 LINE: Validation errors found:', validationErrors);
              }
              
              await button.click();
              console.log('📍 LINE: Submit button clicked');
              
              // Check for validation errors after clicking
              await this.page.waitForTimeout(1000);
              const postClickErrors = await this.page.$$eval('.MuiFormHelperText-root.Mui-error', 
                errors => errors.map(e => e.textContent)).catch(() => []);
              
              if (postClickErrors.length > 0) {
                console.log('📍 LINE: Post-click validation errors:', postClickErrors);
              }
              
              submitted = true;
              break;
            }
          }
        } catch (e) {
          console.log(`📍 LINE: Failed submit selector: ${selector} - ${e.message}`);
          continue;
        }
      }
      
      if (!submitted) {
        console.log('📍 LINE: No enabled submit button found, trying form submission...');
        // Try to submit form directly
        await this.page.evaluate(() => {
          const form = document.querySelector('form');
          if (form) {
            console.log('Found form, triggering submit event');
            form.requestSubmit();
          }
        });
      }
      
      console.log('📍 LINE: Waiting for form submission to process...');
      
      // Wait for either /api/pedido request or loading state to complete
      try {
        // Wait for loading button or success/error response
        await Promise.race([
          this.page.waitForSelector('button[type="submit"]:has-text("Aguarde")', { timeout: 2000 }).catch(() => null),
          this.page.waitForSelector('.loading', { timeout: 2000 }).catch(() => null),
          this.page.waitForTimeout(5000)
        ]);
        
        console.log('📍 LINE: Detected loading state or timeout reached');
        
        // Wait additional time for request completion
        await this.page.waitForTimeout(5000);
        
      } catch (e) {
        console.log('📍 LINE: No loading state detected, continuing...');
        await this.page.waitForTimeout(3000);
      }
      
    } catch (error) {
      console.warn('📍 LINE: Could not submit form:', error.message);
    }
  }

  // ============================================================================
  // Data Processing and Analysis
  // ============================================================================

  analyzeCheckoutData() {
    if (!this.capturedCheckoutRequest) {
      return { error: 'No checkout request captured' };
    }
    
    const postData = this.capturedCheckoutRequest.postData;
    
    if (!postData) {
      return { error: 'No POST data in checkout request' };
    }
    
    const analysis = {
      timestamp: new Date().toISOString(),
      
      // Extract key data that should be sent to backend
      customerData: {
        nome: postData.nome,
        email: postData.email,
        cpf: postData.cpf,
        telefone: postData.telefone,
        endereco: postData.endereco
      },
      
      // Cart and pricing data
      cartData: {
        items: postData.items || [],
        cupons: postData.cupons || [],
        descontos: postData.descontos || 0,
        total_pedido: postData.total_pedido || 0
      },
      
      // What would be sent to PagSeguro
      pagSeguroData: this.extractPagSeguroFormat(postData),
      
      // Database data
      databaseData: this.extractDatabaseFormat(postData),
      
      // Validation checks
      validations: this.validateCheckoutData(postData)
    };
    
    return analysis;
  }

  extractPagSeguroFormat(postData) {
    if (!postData.items) return null;
    
    return {
      customer: {
        name: `${postData.nome} ${postData.sobrenome}`,
        email: postData.email,
        tax_id: postData.cpf?.replace(/\D/g, ''),
        phone: {
          country: "+55",
          area: postData.telefone?.replace(/\D/g, '').substring(0, 2),
          number: postData.telefone?.replace(/\D/g, '').substring(2)
        }
      },
      items: postData.items.map(item => ({
        id: item.id,
        name: item.name || item.nome,
        quantity: item.quantity,
        unit_amount: Math.round((item.unit_amount || item.preco * 100))
      })),
      additional_amount: 1500, // Assuming R$ 15,00 shipping
      reference_id: 'to-be-generated'
    };
  }

  extractDatabaseFormat(postData) {
    return {
      // Customer fields
      nome: postData.nome,
      sobrenome: postData.sobrenome,
      email: postData.email,
      cpf: postData.cpf,
      telefone: postData.telefone,
      data_nascimento: postData.data_nascimento,
      
      // Address fields
      cep: postData.cep,
      endereco: postData.endereco,
      numero: postData.numero,
      complemento: postData.complemento,
      bairro: postData.bairro,
      cidade: postData.cidade,
      estado: postData.estado,
      
      // Order fields
      items: postData.items,
      cupons: postData.cupons,
      descontos: postData.descontos,
      total_pedido: postData.total_pedido,
      
      // Preferences
      salvar_minhas_informacoes: postData.salvar_minhas_informacoes,
      aceito_receber_whatsapp: postData.aceito_receber_whatsapp,
      
      // Analytics
      ga_session_id: postData.ga_session_id,
      ga_session_number: postData.ga_session_number
    };
  }

  validateCheckoutData(postData) {
    const validations = {
      hasRequiredFields: {
        nome: !!postData.nome,
        email: !!postData.email,
        cpf: !!postData.cpf,
        telefone: !!postData.telefone
      },
      hasCartData: {
        hasItems: Array.isArray(postData.items) && postData.items.length > 0,
        hasTotal: typeof postData.total_pedido === 'number' && postData.total_pedido > 0,
        itemsHaveRequiredFields: postData.items?.every(item => 
          item.id && item.quantity && (item.unit_amount || item.preco)
        )
      },
      couponData: {
        hasCoupons: Array.isArray(postData.cupons) && postData.cupons.length > 0,
        hasDiscount: typeof postData.descontos === 'number' && postData.descontos >= 0
      },
      priceConsistency: this.validatePriceConsistency(postData)
    };
    
    // Overall validation
    validations.isValid = (
      Object.values(validations.hasRequiredFields).every(Boolean) &&
      Object.values(validations.hasCartData).every(Boolean) &&
      validations.priceConsistency.isConsistent
    );
    
    return validations;
  }

  validatePriceConsistency(postData) {
    if (!postData.items || !Array.isArray(postData.items)) {
      return { isConsistent: false, error: 'No items array' };
    }
    
    // Calculate subtotal from items
    const calculatedSubtotal = postData.items.reduce((sum, item) => {
      const price = item.unit_amount ? item.unit_amount / 100 : item.preco || 0;
      return sum + (price * (item.quantity || 1));
    }, 0);
    
    // Expected total = subtotal - discount + shipping
    const shipping = 15; // Assuming R$ 15
    const expectedTotal = calculatedSubtotal - (postData.descontos || 0) + shipping;
    
    const actualTotal = postData.total_pedido || 0;
    const difference = Math.abs(expectedTotal - actualTotal);
    
    return {
      isConsistent: difference < 0.01, // Allow 1 cent difference for rounding
      calculatedSubtotal,
      expectedTotal,
      actualTotal,
      difference,
      shipping,
      discount: postData.descontos || 0
    };
  }

  // ============================================================================
  // Save Results
  // ============================================================================

  async saveAPICapture() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const results = {
      timestamp,
      checkoutAnalysis: this.analyzeCheckoutData(),
      apiCalls: this.apiCalls,
      paymentRequests: this.paymentRequests,
      strapiRequests: this.strapiRequests,
      capturedCheckoutRequest: this.capturedCheckoutRequest
    };
    
    // Determine the prefix based on environment variable or default
    const isPostRefactor = process.env.POST_REFACTOR === 'true';
    const prefix = isPostRefactor ? 'api-capture-post-refactor' : 'api-capture';
    
    const filename = `${prefix}-${timestamp}.json`;
    const filepath = path.join(BASELINE_DIR, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(results, null, 2));
    console.log(`💾 API capture saved to: ${filepath}`);
    
    // Also save as latest
    const latestPath = path.join(BASELINE_DIR, `${prefix}-latest.json`);
    fs.writeFileSync(latestPath, JSON.stringify(results, null, 2));
    
    return results;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async runFullAPICapture() {
    console.log('🔍 Starting full API capture...');
    
    try {
      await this.init();
      await this.captureCheckoutFlow();
      const results = await this.saveAPICapture();
      
      console.log('✅ API capture completed successfully!');
      console.log('📊 Summary:');
      console.log(`  - API calls captured: ${this.apiCalls.length}`);
      console.log(`  - Payment requests: ${this.paymentRequests.length}`);
      console.log(`  - Strapi requests: ${this.strapiRequests.length}`);
      console.log(`  - Checkout valid: ${results.checkoutAnalysis.validations?.isValid}`);
      
      return results;
    } catch (error) {
      console.error('❌ API capture failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

export { APICapture };

// Run if called directly
console.log('🔍 API Capture starting...');
const capture = new APICapture();
capture.runFullAPICapture().catch(console.error);