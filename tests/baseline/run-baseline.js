// tests/baseline/run-baseline.js
// RUNNER PRINCIPAL PARA CAPTURAR BASELINE COMPLETO

import { BaselineCapture } from './baseline-capture.js';
import { APICapture } from './api-capture.js';
import fs from 'fs';
import path from 'path';

const BASELINE_DIR = './tests/baseline/snapshots';

class BaselineRunner {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      ui_baseline: null,
      api_baseline: null,
      combined_analysis: null,
      success: false,
      errors: []
    };
  }

  async runCompleteBaseline() {
    console.log('🚀 Starting COMPLETE baseline capture...');
    console.log('This will capture the EXACT behavior of the current system');
    console.log('===============================================\n');

    try {
      // Step 1: UI Baseline Capture
      console.log('📱 STEP 1: Capturing UI behavior...');
      const uiCapture = new BaselineCapture();
      await uiCapture.runCompleteBaseline();
      this.results.ui_baseline = 'completed';
      console.log('✅ UI baseline captured\n');

      // Step 2: API Baseline Capture  
      console.log('🔌 STEP 2: Capturing API behavior...');
      const apiCapture = new APICapture();
      const apiResults = await apiCapture.runFullAPICapture();
      this.results.api_baseline = apiResults;
      console.log('✅ API baseline captured\n');

      // Step 3: Combined Analysis
      console.log('📊 STEP 3: Analyzing combined behavior...');
      this.results.combined_analysis = await this.performCombinedAnalysis();
      console.log('✅ Combined analysis completed\n');

      this.results.success = true;
      
      // Step 4: Generate Summary Report
      const summaryReport = await this.generateSummaryReport();
      console.log('📋 STEP 4: Summary report generated\n');
      
      console.log('🎉 COMPLETE BASELINE CAPTURE SUCCESSFUL!');
      console.log('===============================================');
      console.log('📂 All files saved to:', BASELINE_DIR);
      console.log('🔍 Summary:', summaryReport.summary);
      
      return this.results;

    } catch (error) {
      console.error('❌ Baseline capture failed:', error.message);
      this.results.errors.push({
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      
      throw error;
    }
  }

  async performCombinedAnalysis() {
    console.log('🔍 Analyzing UI + API behavior consistency...');
    
    const analysis = {
      timestamp: new Date().toISOString(),
      consistency_checks: [],
      data_flow_validation: {},
      critical_findings: [],
      recommendations: []
    };

    try {
      // Load the latest captures
      const uiData = this.loadLatestBaseline('baseline-latest.json');
      const apiData = this.loadLatestBaseline('api-capture-latest.json');
      
      if (!uiData || !apiData) {
        analysis.critical_findings.push({
          type: 'missing_data',
          message: 'Could not load UI or API baseline data for analysis'
        });
        return analysis;
      }

      // Check 1: Cart data consistency between UI and API
      await this.validateCartDataFlow(uiData, apiData, analysis);
      
      // Check 2: Coupon behavior consistency
      await this.validateCouponFlow(uiData, apiData, analysis);
      
      // Check 3: Price calculation consistency
      await this.validatePriceConsistency(uiData, apiData, analysis);
      
      // Check 4: Storage vs API data consistency
      await this.validateStorageAPIConsistency(uiData, apiData, analysis);

      console.log(`   ✅ ${analysis.consistency_checks.length} consistency checks completed`);
      console.log(`   🔍 ${analysis.critical_findings.length} critical findings`);
      
    } catch (error) {
      analysis.critical_findings.push({
        type: 'analysis_error',
        message: error.message,
        stack: error.stack
      });
    }

    return analysis;
  }

  async validateCartDataFlow(uiData, apiData, analysis) {
    console.log('   🛒 Validating cart data flow...');
    
    try {
      // Find scenarios where products were added and checkout was attempted
      const checkoutScenarios = Object.keys(uiData.scenarios).filter(s => 
        s.includes('checkout') || s.includes('after_navigate_checkout')
      );
      
      for (const scenario of checkoutScenarios) {
        const uiScenario = uiData.scenarios[scenario];
        
        if (uiScenario.localStorage.cart) {
          const uiCart = typeof uiScenario.localStorage.cart === 'string' 
            ? JSON.parse(uiScenario.localStorage.cart) 
            : uiScenario.localStorage.cart;
          
          // Compare with what was sent to API
          if (apiData.capturedCheckoutRequest?.postData?.items) {
            const apiItems = apiData.capturedCheckoutRequest.postData.items;
            
            analysis.consistency_checks.push({
              type: 'cart_ui_to_api',
              scenario: scenario,
              uiItemCount: Object.keys(uiCart).length,
              apiItemCount: apiItems.length,
              consistent: Object.keys(uiCart).length === apiItems.length,
              details: {
                uiItems: Object.keys(uiCart),
                apiItems: apiItems.map(item => item.id)
              }
            });
          }
        }
      }
      
    } catch (error) {
      analysis.critical_findings.push({
        type: 'cart_validation_error',
        message: `Cart data flow validation failed: ${error.message}`
      });
    }
  }

  async validateCouponFlow(uiData, apiData, analysis) {
    console.log('   🎫 Validating coupon flow...');
    
    try {
      // Find scenarios where coupons were applied
      const couponScenarios = Object.keys(uiData.scenarios).filter(s =>
        s.includes('coupon') || s.includes('cupom')
      );
      
      for (const scenario of couponScenarios) {
        const uiScenario = uiData.scenarios[scenario];
        
        // Check localStorage for applied coupons
        let uiCoupons = [];
        if (uiScenario.localStorage.cupons) {
          uiCoupons = typeof uiScenario.localStorage.cupons === 'string'
            ? JSON.parse(uiScenario.localStorage.cupons)
            : uiScenario.localStorage.cupons;
        }
        
        // Check what was sent to API
        const apiCoupons = apiData.capturedCheckoutRequest?.postData?.cupons || [];
        
        analysis.consistency_checks.push({
          type: 'coupon_ui_to_api',
          scenario: scenario,
          uiCoupons: Array.isArray(uiCoupons) ? uiCoupons.map(c => c.codigo || c) : [],
          apiCoupons: apiCoupons,
          consistent: this.arraysEqual(
            (Array.isArray(uiCoupons) ? uiCoupons.map(c => c.codigo || c) : []),
            apiCoupons
          )
        });
        
        // Check cookie consistency
        if (uiScenario.cookies.cupomBackend && uiCoupons.length > 0) {
          const cookieCoupon = uiScenario.cookies.cupomBackend.value;
          const storageCoupon = Array.isArray(uiCoupons) ? uiCoupons[0]?.codigo : null;
          
          analysis.consistency_checks.push({
            type: 'coupon_cookie_storage_sync',
            scenario: scenario,
            cookieValue: cookieCoupon,
            storageValue: storageCoupon,
            consistent: cookieCoupon === storageCoupon
          });
        }
      }
      
    } catch (error) {
      analysis.critical_findings.push({
        type: 'coupon_validation_error',
        message: `Coupon flow validation failed: ${error.message}`
      });
    }
  }

  async validatePriceConsistency(uiData, apiData, analysis) {
    console.log('   💰 Validating price consistency...');
    
    try {
      // Check if UI totals match what was sent to API
      const checkoutData = apiData.capturedCheckoutRequest?.postData;
      
      if (checkoutData) {
        // Find UI scenario closest to checkout
        const checkoutScenarios = Object.keys(uiData.scenarios).filter(s =>
          s.includes('checkout') || s.includes('navigate_checkout') 
        );
        
        for (const scenario of checkoutScenarios) {
          const uiScenario = uiData.scenarios[scenario];
          
          if (uiScenario.cartSummary) {
            const uiTotal = this.extractPrice(uiScenario.cartSummary.total?.text);
            const apiTotal = checkoutData.total_pedido;
            
            if (uiTotal !== null && apiTotal !== null) {
              const difference = Math.abs(uiTotal - apiTotal);
              
              analysis.consistency_checks.push({
                type: 'price_ui_to_api',
                scenario: scenario,
                uiTotal: uiTotal,
                apiTotal: apiTotal,
                difference: difference,
                consistent: difference < 0.01, // Allow 1 cent difference
                tolerance: 0.01
              });
              
              if (difference >= 0.01) {
                analysis.critical_findings.push({
                  type: 'price_mismatch',
                  scenario: scenario,
                  message: `UI total (R$ ${uiTotal}) doesn't match API total (R$ ${apiTotal})`,
                  difference: difference
                });
              }
            }
          }
        }
      }
      
    } catch (error) {
      analysis.critical_findings.push({
        type: 'price_validation_error',
        message: `Price consistency validation failed: ${error.message}`
      });
    }
  }

  async validateStorageAPIConsistency(uiData, apiData, analysis) {
    console.log('   💾 Validating storage-API consistency...');
    
    try {
      // Validate that what's in localStorage matches what's sent to API
      const checkoutData = apiData.capturedCheckoutRequest?.postData;
      
      if (checkoutData && checkoutData.items) {
        // Find latest cart state from UI
        const cartScenarios = Object.keys(uiData.scenarios)
          .filter(s => s.includes('after') && !s.includes('empty'))
          .sort()
          .reverse(); // Get most recent
        
        if (cartScenarios.length > 0) {
          const latestScenario = uiData.scenarios[cartScenarios[0]];
          
          if (latestScenario.localStorage.cart) {
            const storageCart = typeof latestScenario.localStorage.cart === 'string'
              ? JSON.parse(latestScenario.localStorage.cart)
              : latestScenario.localStorage.cart;
            
            const storageItems = Object.values(storageCart);
            const apiItems = checkoutData.items;
            
            // Validate each item
            const itemValidation = {
              storageCount: storageItems.length,
              apiCount: apiItems.length,
              itemMatches: []
            };
            
            apiItems.forEach(apiItem => {
              const storageItem = storageItems.find(si => si.id === apiItem.id);
              
              if (storageItem) {
                itemValidation.itemMatches.push({
                  id: apiItem.id,
                  quantityMatch: storageItem.quantity === apiItem.quantity,
                  priceMatch: Math.abs((storageItem.preco * 100) - apiItem.unit_amount) < 1,
                  storagePrice: storageItem.preco,
                  apiPrice: apiItem.unit_amount / 100,
                  storageQuantity: storageItem.quantity,
                  apiQuantity: apiItem.quantity
                });
              }
            });
            
            analysis.consistency_checks.push({
              type: 'storage_api_items',
              scenario: cartScenarios[0],
              validation: itemValidation,
              consistent: itemValidation.storageCount === itemValidation.apiCount &&
                         itemValidation.itemMatches.every(m => m.quantityMatch && m.priceMatch)
            });
          }
        }
      }
      
    } catch (error) {
      analysis.critical_findings.push({
        type: 'storage_api_validation_error',
        message: `Storage-API consistency validation failed: ${error.message}`
      });
    }
  }

  async generateSummaryReport() {
    console.log('📋 Generating summary report...');
    
    const timestamp = new Date().toISOString();
    const summary = {
      timestamp,
      baseline_capture: {
        ui_scenarios_captured: 0,
        api_calls_captured: 0,
        checkout_flow_captured: false,
        critical_issues: 0
      },
      system_behavior: {
        cart_functionality: 'unknown',
        coupon_functionality: 'unknown',
        checkout_flow: 'unknown',
        data_consistency: 'unknown'
      },
      recommendations: [],
      files_generated: []
    };

    try {
      // Load latest baseline data
      const uiData = this.loadLatestBaseline('baseline-latest.json');
      const apiData = this.loadLatestBaseline('api-capture-latest.json');
      
      if (uiData) {
        summary.baseline_capture.ui_scenarios_captured = Object.keys(uiData.scenarios).length;
        summary.baseline_capture.critical_issues += uiData.errors?.length || 0;
        
        // Analyze cart functionality
        const cartScenarios = Object.keys(uiData.scenarios).filter(s => s.includes('product'));
        summary.system_behavior.cart_functionality = cartScenarios.length > 0 ? 'working' : 'issues';
        
        // Analyze coupon functionality
        const couponScenarios = Object.keys(uiData.scenarios).filter(s => s.includes('coupon'));
        summary.system_behavior.coupon_functionality = couponScenarios.length > 0 ? 'working' : 'issues';
      }
      
      if (apiData) {
        summary.baseline_capture.api_calls_captured = apiData.apiCalls?.length || 0;
        summary.baseline_capture.checkout_flow_captured = !!apiData.capturedCheckoutRequest;
        
        if (apiData.checkoutAnalysis?.validations?.isValid) {
          summary.system_behavior.checkout_flow = 'working';
        } else {
          summary.system_behavior.checkout_flow = 'issues';
        }
      }
      
      if (this.results.combined_analysis) {
        const consistentChecks = this.results.combined_analysis.consistency_checks
          ?.filter(check => check.consistent) || [];
        const totalChecks = this.results.combined_analysis.consistency_checks?.length || 0;
        
        if (totalChecks > 0) {
          const consistencyRatio = consistentChecks.length / totalChecks;
          summary.system_behavior.data_consistency = consistencyRatio > 0.9 ? 'good' : 
                                                   consistencyRatio > 0.7 ? 'acceptable' : 'issues';
        }
      }
      
      // Generate recommendations
      if (summary.system_behavior.cart_functionality === 'issues') {
        summary.recommendations.push('Investigate cart functionality issues before refactoring');
      }
      
      if (summary.system_behavior.coupon_functionality === 'issues') {
        summary.recommendations.push('Fix coupon functionality before refactoring');
      }
      
      if (summary.system_behavior.data_consistency === 'issues') {
        summary.recommendations.push('Address data consistency issues between UI and API');
      }
      
      if (summary.baseline_capture.critical_issues > 0) {
        summary.recommendations.push('Review and fix critical issues found during baseline capture');
      }
      
      if (summary.recommendations.length === 0) {
        summary.recommendations.push('System appears stable - proceed with refactoring');
      }
      
      // List generated files
      summary.files_generated = this.listGeneratedFiles();
      
    } catch (error) {
      summary.error = error.message;
      summary.recommendations.push('Review baseline capture errors before proceeding');
    }

    // Save summary
    const summaryFile = path.join(BASELINE_DIR, 'baseline-summary.json');
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    
    // Generate readable summary
    const readableSummary = this.generateReadableSummary(summary);
    const readableFile = path.join(BASELINE_DIR, 'baseline-summary.md');
    fs.writeFileSync(readableFile, readableSummary);
    
    return summary;
  }

  generateReadableSummary(summary) {
    let md = `# Baseline Capture Summary\n\n`;
    md += `**Generated:** ${summary.timestamp}\n\n`;
    
    md += `## 📊 Capture Statistics\n\n`;
    md += `- **UI Scenarios:** ${summary.baseline_capture.ui_scenarios_captured}\n`;
    md += `- **API Calls:** ${summary.baseline_capture.api_calls_captured}\n`;
    md += `- **Checkout Flow:** ${summary.baseline_capture.checkout_flow_captured ? 'Captured' : 'Failed'}\n`;
    md += `- **Critical Issues:** ${summary.baseline_capture.critical_issues}\n\n`;
    
    md += `## 🔍 System Behavior Analysis\n\n`;
    md += `- **Cart Functionality:** ${summary.system_behavior.cart_functionality}\n`;
    md += `- **Coupon Functionality:** ${summary.system_behavior.coupon_functionality}\n`;
    md += `- **Checkout Flow:** ${summary.system_behavior.checkout_flow}\n`;
    md += `- **Data Consistency:** ${summary.system_behavior.data_consistency}\n\n`;
    
    if (summary.recommendations.length > 0) {
      md += `## 💡 Recommendations\n\n`;
      summary.recommendations.forEach(rec => {
        md += `- ${rec}\n`;
      });
      md += `\n`;
    }
    
    if (summary.files_generated.length > 0) {
      md += `## 📁 Generated Files\n\n`;
      summary.files_generated.forEach(file => {
        md += `- \`${file}\`\n`;
      });
      md += `\n`;
    }
    
    md += `## 🎯 Next Steps\n\n`;
    md += `1. Review this summary and any critical issues\n`;
    md += `2. Address any recommendations before refactoring\n`;
    md += `3. Use the baseline files to compare after refactoring\n`;
    md += `4. Run the comparator after implementing changes\n\n`;
    
    md += `## 📋 How to Use Baseline\n\n`;
    md += `After refactoring, run:\n`;
    md += `\`\`\`bash\n`;
    md += `# Capture new baseline\n`;
    md += `node tests/baseline/run-baseline.js\n\n`;
    md += `# Compare with original\n`;
    md += `node tests/baseline/baseline-comparator.js baseline-original.json baseline-new.json\n`;
    md += `\`\`\`\n`;
    
    return md;
  }

  // Helper methods
  loadLatestBaseline(filename) {
    try {
      const filepath = path.join(BASELINE_DIR, filename);
      const content = fs.readFileSync(filepath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  extractPrice(priceString) {
    if (typeof priceString === 'number') return priceString;
    if (typeof priceString !== 'string') return null;
    
    const matches = priceString.match(/[\d,\.]+/);
    if (matches) {
      const numStr = matches[0].replace(',', '.');
      const num = parseFloat(numStr);
      return isNaN(num) ? null : num;
    }
    return null;
  }

  arraysEqual(a, b) {
    return JSON.stringify(a.sort()) === JSON.stringify(b.sort());
  }

  listGeneratedFiles() {
    try {
      const files = fs.readdirSync(BASELINE_DIR)
        .filter(file => file.endsWith('.json') || file.endsWith('.md'))
        .sort();
      return files;
    } catch (error) {
      return [];
    }
  }
}

// Export for use
export { BaselineRunner };

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith('run-baseline.js')) {
  console.log('🎯 BASELINE CAPTURE SYSTEM');
  console.log('==========================');
  console.log('This will capture the COMPLETE behavior of your current cart and coupon system.');
  console.log('Use this data to validate that your refactoring maintains the same behavior.\n');
  
  console.log('🔍 Starting baseline runner...');
  
  try {
    const runner = new BaselineRunner();
    console.log('✅ BaselineRunner created');
    
    runner.runCompleteBaseline()
      .then(() => {
        console.log('\n🎉 BASELINE CAPTURE COMPLETED SUCCESSFULLY!');
        console.log('\n📋 What was captured:');
        console.log('   - All cart operations (add/remove/modify)');
        console.log('   - All coupon operations (apply/remove)');
        console.log('   - All price calculations');
        console.log('   - localStorage and cookie behavior');
        console.log('   - API calls and data sent to backend');
        console.log('   - Checkout flow and PagSeguro data');
        console.log('   - Analytics tracking events');
        console.log('\n📁 Files saved to: tests/baseline/snapshots/');
        console.log('📖 Read the summary: baseline-summary.md');
        console.log('\n✅ You can now proceed with refactoring!');
      })
      .catch(error => {
        console.error('\n❌ BASELINE CAPTURE FAILED!');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        console.error('\n🔧 Please fix any issues before proceeding with refactoring.');
        process.exit(1);
      });
  } catch (syncError) {
    console.error('❌ Failed to create BaselineRunner:', syncError.message);
    console.error('Stack:', syncError.stack);
    process.exit(1);
  }
}