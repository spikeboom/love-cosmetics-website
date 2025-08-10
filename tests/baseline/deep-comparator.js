// tests/baseline/deep-comparator.js
// COMPARADOR PROFUNDO DE SNAPSHOTS PRÉ E PÓS REFATORAÇÃO

import fs from 'fs';
import path from 'path';

const SNAPSHOTS_DIR = './tests/baseline/snapshots';

class DeepComparator {
  constructor() {
    this.differences = {
      critical: [],
      warnings: [],
      info: []
    };
  }

  // Load snapshot files
  loadSnapshots() {
    const preUIPath = path.join(SNAPSHOTS_DIR, 'baseline-pre-refactor-latest.json');
    const postUIPath = path.join(SNAPSHOTS_DIR, 'baseline-post-refactor-latest.json');
    const preAPIPath = path.join(SNAPSHOTS_DIR, 'api-capture-latest.json');
    const postAPIPath = path.join(SNAPSHOTS_DIR, 'api-capture-post-refactor-latest.json');

    return {
      preUI: JSON.parse(fs.readFileSync(preUIPath, 'utf-8')),
      postUI: JSON.parse(fs.readFileSync(postUIPath, 'utf-8')),
      preAPI: JSON.parse(fs.readFileSync(preAPIPath, 'utf-8')),
      postAPI: JSON.parse(fs.readFileSync(postAPIPath, 'utf-8'))
    };
  }

  // Compare UI captures
  compareUICaptures(pre, post) {
    console.log('\n🔍 COMPARING UI CAPTURES\n');
    console.log('=' .repeat(60));

    // Compare number of states captured
    const preStates = Object.keys(pre.states || {}).length;
    const postStates = Object.keys(post.states || {}).length;
    
    if (preStates !== postStates) {
      this.differences.critical.push({
        type: 'UI_STATE_COUNT',
        message: `State count mismatch: PRE=${preStates}, POST=${postStates}`,
        pre: preStates,
        post: postStates
      });
    }

    // Compare each state
    for (const stateName of Object.keys(pre.states || {})) {
      const preState = pre.states[stateName];
      const postState = post.states?.[stateName];

      if (!postState) {
        this.differences.critical.push({
          type: 'MISSING_STATE',
          state: stateName,
          message: `State "${stateName}" missing in post-refactor`
        });
        continue;
      }

      // Compare cart items
      this.compareCartItems(stateName, preState, postState);
      
      // Compare coupon state
      this.compareCouponState(stateName, preState, postState);
      
      // Compare totals
      this.compareTotals(stateName, preState, postState);
      
      // Compare localStorage
      this.compareLocalStorage(stateName, preState, postState);
    }

    // Check for errors
    if (post.errors && post.errors.length > 0) {
      this.differences.critical.push({
        type: 'POST_REFACTOR_ERRORS',
        message: 'Post-refactor capture has errors',
        errors: post.errors
      });
    }
  }

  compareCartItems(stateName, preState, postState) {
    const preItems = preState.cart?.items || [];
    const postItems = postState.cart?.items || [];

    if (preItems.length !== postItems.length) {
      this.differences.critical.push({
        type: 'CART_ITEMS_COUNT',
        state: stateName,
        message: `Cart items count mismatch in "${stateName}"`,
        pre: preItems.length,
        post: postItems.length
      });
    }

    // Compare each item
    for (let i = 0; i < Math.max(preItems.length, postItems.length); i++) {
      const preItem = preItems[i];
      const postItem = postItems[i];

      if (!preItem || !postItem) continue;

      if (preItem.id !== postItem.id) {
        this.differences.critical.push({
          type: 'CART_ITEM_ID',
          state: stateName,
          message: `Cart item ID mismatch in "${stateName}"`,
          pre: preItem.id,
          post: postItem.id
        });
      }

      if (preItem.quantity !== postItem.quantity) {
        this.differences.critical.push({
          type: 'CART_ITEM_QUANTITY',
          state: stateName,
          message: `Cart item quantity mismatch in "${stateName}"`,
          itemId: preItem.id,
          pre: preItem.quantity,
          post: postItem.quantity
        });
      }

      // Check price with tolerance for floating point
      const priceDiff = Math.abs((preItem.price || 0) - (postItem.price || 0));
      if (priceDiff > 0.01) {
        this.differences.critical.push({
          type: 'CART_ITEM_PRICE',
          state: stateName,
          message: `Cart item price mismatch in "${stateName}"`,
          itemId: preItem.id,
          pre: preItem.price,
          post: postItem.price,
          difference: priceDiff
        });
      }
    }
  }

  compareCouponState(stateName, preState, postState) {
    const preCoupon = preState.coupon;
    const postCoupon = postState.coupon;

    // Check if coupon applied state matches
    if (preCoupon?.applied !== postCoupon?.applied) {
      this.differences.critical.push({
        type: 'COUPON_APPLIED_STATE',
        state: stateName,
        message: `Coupon applied state mismatch in "${stateName}"`,
        pre: preCoupon?.applied,
        post: postCoupon?.applied
      });
    }

    // Check coupon code
    if (preCoupon?.code !== postCoupon?.code) {
      this.differences.critical.push({
        type: 'COUPON_CODE',
        state: stateName,
        message: `Coupon code mismatch in "${stateName}"`,
        pre: preCoupon?.code,
        post: postCoupon?.code
      });
    }

    // Check discount value
    const preDiscount = preCoupon?.discountValue || 0;
    const postDiscount = postCoupon?.discountValue || 0;
    
    if (Math.abs(preDiscount - postDiscount) > 0.01) {
      this.differences.critical.push({
        type: 'COUPON_DISCOUNT',
        state: stateName,
        message: `Coupon discount mismatch in "${stateName}"`,
        pre: preDiscount,
        post: postDiscount
      });
    }
  }

  compareTotals(stateName, preState, postState) {
    const preTotal = preState.totals;
    const postTotal = postState.totals;

    if (!preTotal || !postTotal) return;

    // Compare subtotal
    if (Math.abs((preTotal.subtotal || 0) - (postTotal.subtotal || 0)) > 0.01) {
      this.differences.critical.push({
        type: 'TOTAL_SUBTOTAL',
        state: stateName,
        message: `Subtotal mismatch in "${stateName}"`,
        pre: preTotal.subtotal,
        post: postTotal.subtotal
      });
    }

    // Compare discount
    if (Math.abs((preTotal.discount || 0) - (postTotal.discount || 0)) > 0.01) {
      this.differences.critical.push({
        type: 'TOTAL_DISCOUNT',
        state: stateName,
        message: `Discount total mismatch in "${stateName}"`,
        pre: preTotal.discount,
        post: postTotal.discount
      });
    }

    // Compare final total
    if (Math.abs((preTotal.total || 0) - (postTotal.total || 0)) > 0.01) {
      this.differences.critical.push({
        type: 'TOTAL_FINAL',
        state: stateName,
        message: `Final total mismatch in "${stateName}"`,
        pre: preTotal.total,
        post: postTotal.total
      });
    }
  }

  compareLocalStorage(stateName, preState, postState) {
    const preStorage = preState.localStorage || {};
    const postStorage = postState.localStorage || {};

    // Check cart storage
    const preCart = preStorage['love-cart-storage'];
    const postCart = postStorage['love-cart-storage'];

    if (preCart && postCart) {
      try {
        const preCartData = JSON.parse(preCart);
        const postCartData = JSON.parse(postCart);

        // Compare cart version
        if (preCartData.version !== postCartData.version) {
          this.differences.info.push({
            type: 'STORAGE_VERSION',
            state: stateName,
            message: `Cart storage version changed in "${stateName}"`,
            pre: preCartData.version,
            post: postCartData.version
          });
        }

        // Compare cart state in storage
        const preCartState = preCartData.state?.cart;
        const postCartState = postCartData.state?.cart;

        if (preCartState && postCartState) {
          // Check items count
          const preItemsCount = preCartState.items?.length || 0;
          const postItemsCount = postCartState.items?.length || 0;

          if (preItemsCount !== postItemsCount) {
            this.differences.critical.push({
              type: 'STORAGE_CART_ITEMS',
              state: stateName,
              message: `localStorage cart items count mismatch in "${stateName}"`,
              pre: preItemsCount,
              post: postItemsCount
            });
          }

          // Check coupon in storage
          if (preCartState.couponCode !== postCartState.couponCode) {
            this.differences.critical.push({
              type: 'STORAGE_COUPON',
              state: stateName,
              message: `localStorage coupon code mismatch in "${stateName}"`,
              pre: preCartState.couponCode,
              post: postCartState.couponCode
            });
          }
        }
      } catch (e) {
        this.differences.warnings.push({
          type: 'STORAGE_PARSE_ERROR',
          state: stateName,
          message: `Could not parse localStorage in "${stateName}"`,
          error: e.message
        });
      }
    }
  }

  // Compare API captures
  compareAPICaptures(pre, post) {
    console.log('\n🔍 COMPARING API CAPTURES\n');
    console.log('=' .repeat(60));

    // Compare checkout analysis
    this.compareCheckoutAnalysis(pre.checkoutAnalysis, post.checkoutAnalysis);

    // Compare API calls count
    const preAPICalls = pre.apiCalls?.length || 0;
    const postAPICalls = post.apiCalls?.length || 0;

    if (preAPICalls !== postAPICalls) {
      this.differences.warnings.push({
        type: 'API_CALLS_COUNT',
        message: `API calls count changed`,
        pre: preAPICalls,
        post: postAPICalls
      });
    }

    // Compare payment requests
    const prePaymentReqs = pre.paymentRequests?.length || 0;
    const postPaymentReqs = post.paymentRequests?.length || 0;

    if (prePaymentReqs !== postPaymentReqs) {
      this.differences.critical.push({
        type: 'PAYMENT_REQUESTS_COUNT',
        message: `Payment requests count mismatch`,
        pre: prePaymentReqs,
        post: postPaymentReqs
      });
    }

    // Analyze captured checkout request
    this.compareCheckoutRequest(pre.capturedCheckoutRequest, post.capturedCheckoutRequest);
  }

  compareCheckoutAnalysis(preAnalysis, postAnalysis) {
    if (!preAnalysis || !postAnalysis) return;

    // Check validation status
    const preValid = preAnalysis.validations?.isValid;
    const postValid = postAnalysis.validations?.isValid;

    if (preValid !== postValid) {
      this.differences.critical.push({
        type: 'CHECKOUT_VALIDATION',
        message: 'Checkout validation status changed',
        pre: preValid,
        post: postValid,
        details: postAnalysis.validations
      });
    }

    // Check price consistency
    const prePriceConsistent = preAnalysis.validations?.priceConsistency?.isConsistent;
    const postPriceConsistent = postAnalysis.validations?.priceConsistency?.isConsistent;

    if (prePriceConsistent !== postPriceConsistent) {
      this.differences.critical.push({
        type: 'PRICE_CONSISTENCY',
        message: 'Price consistency check failed',
        pre: prePriceConsistent,
        post: postPriceConsistent,
        details: postAnalysis.validations?.priceConsistency
      });
    }

    // Check coupon data
    const preHasCoupons = preAnalysis.validations?.couponData?.hasCoupons;
    const postHasCoupons = postAnalysis.validations?.couponData?.hasCoupons;

    if (preHasCoupons !== postHasCoupons) {
      this.differences.critical.push({
        type: 'CHECKOUT_COUPONS',
        message: 'Coupon presence in checkout changed',
        pre: preHasCoupons,
        post: postHasCoupons
      });
    }
  }

  compareCheckoutRequest(preRequest, postRequest) {
    if (!preRequest && !postRequest) return;

    if (!postRequest) {
      this.differences.critical.push({
        type: 'MISSING_CHECKOUT_REQUEST',
        message: 'No checkout request captured in post-refactor',
        pre: 'Captured',
        post: 'Missing'
      });
      return;
    }

    // Compare POST data
    const preData = preRequest?.postData;
    const postData = postRequest?.postData;

    if (!postData) {
      this.differences.critical.push({
        type: 'MISSING_POST_DATA',
        message: 'No POST data in checkout request',
        pre: 'Has data',
        post: 'Missing'
      });
      return;
    }

    // Check critical fields
    const criticalFields = ['nome', 'email', 'cpf', 'telefone', 'items', 'cupons', 'total_pedido'];
    
    for (const field of criticalFields) {
      if (preData?.[field] && !postData[field]) {
        this.differences.critical.push({
          type: 'MISSING_CHECKOUT_FIELD',
          message: `Missing field "${field}" in checkout POST data`,
          field: field,
          pre: 'Present',
          post: 'Missing'
        });
      }
    }

    // Check items array
    if (postData?.items) {
      const preItemsCount = preData?.items?.length || 0;
      const postItemsCount = postData.items.length;

      if (preItemsCount !== postItemsCount) {
        this.differences.critical.push({
          type: 'CHECKOUT_ITEMS_COUNT',
          message: 'Checkout items count mismatch',
          pre: preItemsCount,
          post: postItemsCount
        });
      }
    }

    // Check coupons
    if (preData?.cupons && !postData?.cupons) {
      this.differences.critical.push({
        type: 'MISSING_COUPONS',
        message: 'Coupons missing in checkout POST data',
        pre: preData.cupons,
        post: 'Missing'
      });
    }

    // Check total
    const preTotal = preData?.total_pedido;
    const postTotal = postData?.total_pedido;

    if (preTotal && postTotal && Math.abs(preTotal - postTotal) > 0.01) {
      this.differences.critical.push({
        type: 'CHECKOUT_TOTAL',
        message: 'Checkout total mismatch',
        pre: preTotal,
        post: postTotal,
        difference: Math.abs(preTotal - postTotal)
      });
    }
  }

  // Generate report
  generateReport() {
    console.log('\n');
    console.log('=' .repeat(60));
    console.log('📊 COMPARISON REPORT');
    console.log('=' .repeat(60));

    // Critical issues
    if (this.differences.critical.length > 0) {
      console.log('\n❌ CRITICAL ISSUES (' + this.differences.critical.length + ')');
      console.log('-' .repeat(60));
      
      for (const issue of this.differences.critical) {
        console.log(`\n🔴 ${issue.type}`);
        console.log(`   ${issue.message}`);
        if (issue.pre !== undefined && issue.post !== undefined) {
          console.log(`   PRE:  ${JSON.stringify(issue.pre)}`);
          console.log(`   POST: ${JSON.stringify(issue.post)}`);
        }
        if (issue.details) {
          console.log(`   Details: ${JSON.stringify(issue.details, null, 2).split('\n').join('\n   ')}`);
        }
      }
    }

    // Warnings
    if (this.differences.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS (' + this.differences.warnings.length + ')');
      console.log('-' .repeat(60));
      
      for (const warning of this.differences.warnings) {
        console.log(`\n🟡 ${warning.type}`);
        console.log(`   ${warning.message}`);
        if (warning.pre !== undefined && warning.post !== undefined) {
          console.log(`   PRE:  ${JSON.stringify(warning.pre)}`);
          console.log(`   POST: ${JSON.stringify(warning.post)}`);
        }
      }
    }

    // Info
    if (this.differences.info.length > 0) {
      console.log('\nℹ️  INFO (' + this.differences.info.length + ')');
      console.log('-' .repeat(60));
      
      for (const info of this.differences.info) {
        console.log(`\n🔵 ${info.type}`);
        console.log(`   ${info.message}`);
        if (info.pre !== undefined && info.post !== undefined) {
          console.log(`   PRE:  ${info.pre}`);
          console.log(`   POST: ${info.post}`);
        }
      }
    }

    // Summary
    console.log('\n');
    console.log('=' .repeat(60));
    console.log('📈 SUMMARY');
    console.log('=' .repeat(60));
    console.log(`Critical Issues: ${this.differences.critical.length}`);
    console.log(`Warnings:        ${this.differences.warnings.length}`);
    console.log(`Info:            ${this.differences.info.length}`);
    
    if (this.differences.critical.length === 0) {
      console.log('\n✅ No critical issues found! Refactoring appears successful.');
    } else {
      console.log('\n❌ Critical issues detected! Review the issues above.');
    }

    // Save detailed report
    this.saveDetailedReport();
  }

  saveDetailedReport() {
    const reportPath = path.join(SNAPSHOTS_DIR, 'comparison-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        critical: this.differences.critical.length,
        warnings: this.differences.warnings.length,
        info: this.differences.info.length
      },
      differences: this.differences
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Detailed report saved to: ${reportPath}`);
  }

  // Main run method
  async run() {
    try {
      console.log('🔍 Starting deep comparison of pre and post refactor snapshots...\n');
      
      const snapshots = this.loadSnapshots();
      
      this.compareUICaptures(snapshots.preUI, snapshots.postUI);
      this.compareAPICaptures(snapshots.preAPI, snapshots.postAPI);
      
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Error during comparison:', error);
      throw error;
    }
  }
}

// Run the comparator
const comparator = new DeepComparator();
comparator.run().catch(console.error);