// tests/baseline/baseline-comparator.js
// COMPARADOR DE BASELINE - ANTES vs DEPOIS DA REFATORAÇÃO

import fs from 'fs';
import path from 'path';

const BASELINE_DIR = './tests/baseline/snapshots';

class BaselineComparator {
  constructor() {
    this.differences = [];
    this.criticalIssues = [];
    this.warnings = [];
    this.passedChecks = [];
  }

  // ============================================================================
  // Main Comparison Method
  // ============================================================================

  async compareBaselines(beforePath, afterPath) {
    console.log('🔍 Starting baseline comparison...');
    
    const beforeData = this.loadBaseline(beforePath);
    const afterData = this.loadBaseline(afterPath);
    
    if (!beforeData || !afterData) {
      throw new Error('Could not load baseline data');
    }
    
    console.log(`📊 Before: ${Object.keys(beforeData.scenarios).length} scenarios`);
    console.log(`📊 After: ${Object.keys(afterData.scenarios).length} scenarios`);
    
    // Compare each scenario
    for (const scenarioName of Object.keys(beforeData.scenarios)) {
      if (!afterData.scenarios[scenarioName]) {
        this.criticalIssues.push({
          type: 'missing_scenario',
          scenario: scenarioName,
          message: `Scenario '${scenarioName}' missing in after data`
        });
        continue;
      }
      
      await this.compareScenario(
        scenarioName,
        beforeData.scenarios[scenarioName],
        afterData.scenarios[scenarioName]
      );
    }
    
    // Compare overall analytics
    this.compareAnalytics(beforeData.analytics, afterData.analytics);
    
    // Generate report
    const report = this.generateReport(beforeData, afterData);
    await this.saveReport(report);
    
    return report;
  }

  // ============================================================================
  // Scenario Comparison
  // ============================================================================

  async compareScenario(scenarioName, beforeScenario, afterScenario) {
    console.log(`🔍 Comparing scenario: ${scenarioName}`);
    
    // Compare cart items
    this.compareCartItems(scenarioName, beforeScenario.cartItems, afterScenario.cartItems);
    
    // Compare cart totals
    this.compareCartTotals(scenarioName, beforeScenario.cartSummary, afterScenario.cartSummary);
    
    // Compare applied coupons
    this.compareCoupons(scenarioName, beforeScenario.appliedCoupons, afterScenario.appliedCoupons);
    
    // Compare localStorage
    this.compareLocalStorage(scenarioName, beforeScenario.localStorage, afterScenario.localStorage);
    
    // Compare cookies
    this.compareCookies(scenarioName, beforeScenario.cookies, afterScenario.cookies);
    
    // Compare UI state
    this.compareUIState(scenarioName, beforeScenario, afterScenario);
  }

  // ============================================================================
  // Detailed Comparison Methods
  // ============================================================================

  compareCartItems(scenario, beforeItems, afterItems) {
    if (!Array.isArray(beforeItems) || !Array.isArray(afterItems)) {
      this.warnings.push({
        type: 'cart_items_format',
        scenario,
        message: 'Cart items format changed'
      });
      return;
    }
    
    if (beforeItems.length !== afterItems.length) {
      this.criticalIssues.push({
        type: 'cart_items_count',
        scenario,
        before: beforeItems.length,
        after: afterItems.length,
        message: `Cart items count changed: ${beforeItems.length} → ${afterItems.length}`
      });
    }
    
    // Compare each item
    beforeItems.forEach((beforeItem, index) => {
      const afterItem = afterItems[index];
      if (!afterItem) return;
      
      // Compare key properties
      const criticalProps = ['id', 'name', 'quantity'];
      const priceProps = ['price', 'originalPrice'];
      
      criticalProps.forEach(prop => {
        if (beforeItem[prop] !== afterItem[prop]) {
          this.criticalIssues.push({
            type: 'cart_item_property',
            scenario,
            property: prop,
            itemIndex: index,
            before: beforeItem[prop],
            after: afterItem[prop],
            message: `Item ${index} ${prop} changed: ${beforeItem[prop]} → ${afterItem[prop]}`
          });
        }
      });
      
      // Compare prices (allow small differences for rounding)
      priceProps.forEach(prop => {
        const beforePrice = this.extractPrice(beforeItem[prop]);
        const afterPrice = this.extractPrice(afterItem[prop]);
        
        if (beforePrice !== null && afterPrice !== null) {
          const difference = Math.abs(beforePrice - afterPrice);
          if (difference > 0.01) {
            this.criticalIssues.push({
              type: 'cart_item_price',
              scenario,
              property: prop,
              itemIndex: index,
              before: beforePrice,
              after: afterPrice,
              difference,
              message: `Item ${index} ${prop} changed: R$ ${beforePrice} → R$ ${afterPrice}`
            });
          }
        }
      });
    });
    
    this.passedChecks.push({
      type: 'cart_items_comparison',
      scenario,
      message: `Cart items compared (${beforeItems.length} items)`
    });
  }

  compareCartTotals(scenario, beforeSummary, afterSummary) {
    if (!beforeSummary || !afterSummary) {
      this.warnings.push({
        type: 'cart_summary_missing',
        scenario,
        message: 'Cart summary data missing'
      });
      return;
    }
    
    const totalProps = ['subtotal', 'discount', 'shipping', 'total'];
    
    totalProps.forEach(prop => {
      const beforeValue = this.extractPrice(beforeSummary[prop]?.value || beforeSummary[prop]?.text);
      const afterValue = this.extractPrice(afterSummary[prop]?.value || afterSummary[prop]?.text);
      
      if (beforeValue !== null && afterValue !== null) {
        const difference = Math.abs(beforeValue - afterValue);
        if (difference > 0.01) {
          this.criticalIssues.push({
            type: 'cart_total',
            scenario,
            property: prop,
            before: beforeValue,
            after: afterValue,
            difference,
            message: `${prop} changed: R$ ${beforeValue} → R$ ${afterValue} (diff: R$ ${difference.toFixed(2)})`
          });
        } else {
          this.passedChecks.push({
            type: 'cart_total_check',
            scenario,
            property: prop,
            value: beforeValue,
            message: `${prop} maintained: R$ ${beforeValue}`
          });
        }
      }
    });
  }

  compareCoupons(scenario, beforeCoupons, afterCoupons) {
    const beforeCodes = this.extractCouponCodes(beforeCoupons);
    const afterCodes = this.extractCouponCodes(afterCoupons);
    
    // Check if same coupons are applied
    if (JSON.stringify(beforeCodes.sort()) !== JSON.stringify(afterCodes.sort())) {
      this.criticalIssues.push({
        type: 'applied_coupons',
        scenario,
        before: beforeCodes,
        after: afterCodes,
        message: `Applied coupons changed: [${beforeCodes.join(', ')}] → [${afterCodes.join(', ')}]`
      });
    } else if (beforeCodes.length > 0) {
      this.passedChecks.push({
        type: 'coupon_check',
        scenario,
        coupons: beforeCodes,
        message: `Coupons maintained: [${beforeCodes.join(', ')}]`
      });
    }
  }

  compareLocalStorage(scenario, beforeStorage, afterStorage) {
    const criticalKeys = ['cart', 'cupons', 'cart_v2', 'coupon_v2'];
    
    criticalKeys.forEach(key => {
      const beforeValue = beforeStorage[key];
      const afterValue = afterStorage[key];
      
      if (beforeValue && !afterValue) {
        this.warnings.push({
          type: 'localStorage_key_missing',
          scenario,
          key,
          message: `localStorage key '${key}' missing in after data`
        });
      } else if (!beforeValue && afterValue) {
        this.warnings.push({
          type: 'localStorage_key_added',
          scenario,
          key,
          message: `localStorage key '${key}' added in after data`
        });
      } else if (beforeValue && afterValue) {
        // Compare cart data structure
        if (key.includes('cart') || key.includes('cupom')) {
          const isEquivalent = this.compareCartData(beforeValue, afterValue);
          if (!isEquivalent) {
            this.warnings.push({
              type: 'localStorage_cart_structure',
              scenario,
              key,
              message: `localStorage cart structure changed for key '${key}'`
            });
          } else {
            this.passedChecks.push({
              type: 'localStorage_check',
              scenario,
              key,
              message: `localStorage '${key}' data maintained`
            });
          }
        }
      }
    });
  }

  compareCookies(scenario, beforeCookies, afterCookies) {
    const criticalCookies = ['cupomBackend', 'cupom'];
    
    criticalCookies.forEach(cookieName => {
      const beforeCookie = beforeCookies[cookieName];
      const afterCookie = afterCookies[cookieName];
      
      if (beforeCookie && !afterCookie) {
        // This might be expected if we removed cookies in refactor
        this.warnings.push({
          type: 'cookie_removed',
          scenario,
          cookie: cookieName,
          beforeValue: beforeCookie.value,
          message: `Cookie '${cookieName}' removed (might be expected)`
        });
      } else if (!beforeCookie && afterCookie) {
        this.warnings.push({
          type: 'cookie_added',
          scenario,
          cookie: cookieName,
          afterValue: afterCookie.value,
          message: `Cookie '${cookieName}' added`
        });
      } else if (beforeCookie && afterCookie) {
        if (beforeCookie.value !== afterCookie.value) {
          this.warnings.push({
            type: 'cookie_value_changed',
            scenario,
            cookie: cookieName,
            before: beforeCookie.value,
            after: afterCookie.value,
            message: `Cookie '${cookieName}' value changed: ${beforeCookie.value} → ${afterCookie.value}`
          });
        } else {
          this.passedChecks.push({
            type: 'cookie_check',
            scenario,
            cookie: cookieName,
            value: beforeCookie.value,
            message: `Cookie '${cookieName}' maintained: ${beforeCookie.value}`
          });
        }
      }
    });
  }

  compareUIState(scenario, beforeScenario, afterScenario) {
    const uiProps = ['modalOpen', 'couponInputVisible'];
    
    uiProps.forEach(prop => {
      if (beforeScenario[prop] !== afterScenario[prop]) {
        this.warnings.push({
          type: 'ui_state_changed',
          scenario,
          property: prop,
          before: beforeScenario[prop],
          after: afterScenario[prop],
          message: `UI state '${prop}' changed: ${beforeScenario[prop]} → ${afterScenario[prop]}`
        });
      }
    });
  }

  compareAnalytics(beforeAnalytics, afterAnalytics) {
    if (!Array.isArray(beforeAnalytics) || !Array.isArray(afterAnalytics)) {
      this.warnings.push({
        type: 'analytics_format',
        message: 'Analytics data format changed'
      });
      return;
    }
    
    // Extract event types
    const beforeEvents = beforeAnalytics.map(a => a.event || 'unknown').filter(Boolean);
    const afterEvents = afterAnalytics.map(a => a.event || 'unknown').filter(Boolean);
    
    // Check for critical events
    const criticalEvents = ['add_to_cart', 'apply_coupon', 'remove_coupon'];
    
    criticalEvents.forEach(eventType => {
      const beforeCount = beforeEvents.filter(e => e === eventType).length;
      const afterCount = afterEvents.filter(e => e === eventType).length;
      
      if (beforeCount !== afterCount) {
        this.criticalIssues.push({
          type: 'analytics_event_count',
          eventType,
          before: beforeCount,
          after: afterCount,
          message: `${eventType} events count changed: ${beforeCount} → ${afterCount}`
        });
      } else if (beforeCount > 0) {
        this.passedChecks.push({
          type: 'analytics_check',
          eventType,
          count: beforeCount,
          message: `${eventType} events maintained: ${beforeCount}`
        });
      }
    });
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  loadBaseline(filePath) {
    try {
      if (!path.isAbsolute(filePath)) {
        filePath = path.join(BASELINE_DIR, filePath);
      }
      
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`Failed to load baseline from ${filePath}:`, error.message);
      return null;
    }
  }

  extractPrice(priceString) {
    if (typeof priceString === 'number') {
      return priceString;
    }
    
    if (typeof priceString !== 'string') {
      return null;
    }
    
    // Extract number from strings like "R$ 123,45" or "123.45"
    const matches = priceString.match(/[\d,\.]+/);
    if (matches) {
      const numStr = matches[0].replace(',', '.');
      const num = parseFloat(numStr);
      return isNaN(num) ? null : num;
    }
    
    return null;
  }

  extractCouponCodes(coupons) {
    if (!Array.isArray(coupons)) {
      return [];
    }
    
    return coupons
      .map(coupon => coupon.code || coupon.codigo || coupon)
      .filter(Boolean)
      .map(code => code.toString().toUpperCase());
  }

  compareCartData(before, after) {
    try {
      // If both are objects, compare their essential properties
      if (typeof before === 'object' && typeof after === 'object') {
        // For cart items, compare by essential properties
        if (Array.isArray(before) && Array.isArray(after)) {
          if (before.length !== after.length) return false;
          
          return before.every((beforeItem, index) => {
            const afterItem = after[index];
            if (!afterItem) return false;
            
            // Compare essential properties
            const essentialProps = ['id', 'quantity'];
            return essentialProps.every(prop => beforeItem[prop] === afterItem[prop]);
          });
        }
        
        // For single objects, compare key properties
        const beforeKeys = Object.keys(before).sort();
        const afterKeys = Object.keys(after).sort();
        
        // Allow different key structures if essential data is the same
        const essentialKeys = ['id', 'codigo', 'quantity', 'preco'];
        const beforeEssential = beforeKeys.filter(k => essentialKeys.includes(k));
        const afterEssential = afterKeys.filter(k => essentialKeys.includes(k));
        
        return beforeEssential.every(key => before[key] === after[key]);
      }
      
      // For primitives, direct comparison
      return before === after;
    } catch (error) {
      return false;
    }
  }

  // ============================================================================
  // Report Generation
  // ============================================================================

  generateReport(beforeData, afterData) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalScenarios: Object.keys(beforeData.scenarios).length,
        criticalIssues: this.criticalIssues.length,
        warnings: this.warnings.length,
        passedChecks: this.passedChecks.length,
        overallStatus: this.criticalIssues.length === 0 ? 'PASS' : 'FAIL'
      },
      details: {
        criticalIssues: this.criticalIssues,
        warnings: this.warnings,
        passedChecks: this.passedChecks
      },
      scenarios: this.groupByScenario(),
      recommendations: this.generateRecommendations()
    };
    
    return report;
  }

  groupByScenario() {
    const scenarios = {};
    
    [...this.criticalIssues, ...this.warnings, ...this.passedChecks].forEach(item => {
      if (item.scenario) {
        if (!scenarios[item.scenario]) {
          scenarios[item.scenario] = {
            criticalIssues: [],
            warnings: [],
            passedChecks: []
          };
        }
        
        if (this.criticalIssues.includes(item)) {
          scenarios[item.scenario].criticalIssues.push(item);
        } else if (this.warnings.includes(item)) {
          scenarios[item.scenario].warnings.push(item);
        } else {
          scenarios[item.scenario].passedChecks.push(item);
        }
      }
    });
    
    return scenarios;
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Price-related issues
    const priceIssues = this.criticalIssues.filter(issue => 
      issue.type.includes('price') || issue.type.includes('total')
    );
    
    if (priceIssues.length > 0) {
      recommendations.push({
        type: 'price_validation',
        severity: 'HIGH',
        message: 'Price calculations have changed. Review the discount application logic.',
        affectedScenarios: priceIssues.map(i => i.scenario)
      });
    }
    
    // Coupon-related issues
    const couponIssues = this.criticalIssues.filter(issue =>
      issue.type.includes('coupon') || issue.type.includes('cupom')
    );
    
    if (couponIssues.length > 0) {
      recommendations.push({
        type: 'coupon_validation',
        severity: 'HIGH',
        message: 'Coupon application behavior has changed. Verify coupon logic.',
        affectedScenarios: couponIssues.map(i => i.scenario)
      });
    }
    
    // Storage migration
    const storageWarnings = this.warnings.filter(w => w.type.includes('localStorage'));
    if (storageWarnings.length > 0) {
      recommendations.push({
        type: 'storage_migration',
        severity: 'MEDIUM',
        message: 'localStorage structure has changed. Implement migration strategy.',
        details: storageWarnings
      });
    }
    
    // Cookie removal (might be expected)
    const cookieRemovals = this.warnings.filter(w => w.type === 'cookie_removed');
    if (cookieRemovals.length > 0) {
      recommendations.push({
        type: 'cookie_cleanup',
        severity: 'LOW',
        message: 'Cookies have been removed. Ensure this is intentional and document the change.',
        removedCookies: cookieRemovals.map(w => w.cookie)
      });
    }
    
    // Analytics
    const analyticsIssues = this.criticalIssues.filter(i => i.type.includes('analytics'));
    if (analyticsIssues.length > 0) {
      recommendations.push({
        type: 'analytics_tracking',
        severity: 'MEDIUM',
        message: 'Analytics tracking has changed. Update tracking documentation.',
        affectedEvents: analyticsIssues.map(i => i.eventType)
      });
    }
    
    return recommendations;
  }

  async saveReport(report) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `baseline-comparison-${timestamp}.json`;
    const filepath = path.join(BASELINE_DIR, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    
    // Also save a human-readable version
    const readableReport = this.generateReadableReport(report);
    const readableFilename = `baseline-comparison-${timestamp}.md`;
    const readableFilepath = path.join(BASELINE_DIR, readableFilename);
    
    fs.writeFileSync(readableFilepath, readableReport);
    
    console.log(`💾 Comparison report saved to: ${filepath}`);
    console.log(`📄 Readable report saved to: ${readableFilepath}`);
    
    return { json: filepath, markdown: readableFilepath };
  }

  generateReadableReport(report) {
    let markdown = `# Baseline Comparison Report\n\n`;
    markdown += `**Generated:** ${report.timestamp}\n\n`;
    
    // Summary
    markdown += `## Summary\n\n`;
    markdown += `- **Status:** ${report.summary.overallStatus}\n`;
    markdown += `- **Scenarios:** ${report.summary.totalScenarios}\n`;
    markdown += `- **Critical Issues:** ${report.summary.criticalIssues}\n`;
    markdown += `- **Warnings:** ${report.summary.warnings}\n`;
    markdown += `- **Passed Checks:** ${report.summary.passedChecks}\n\n`;
    
    // Critical Issues
    if (report.details.criticalIssues.length > 0) {
      markdown += `## 🚨 Critical Issues\n\n`;
      report.details.criticalIssues.forEach(issue => {
        markdown += `### ${issue.type} - ${issue.scenario}\n`;
        markdown += `${issue.message}\n\n`;
        if (issue.before !== undefined && issue.after !== undefined) {
          markdown += `**Before:** ${issue.before}\n`;
          markdown += `**After:** ${issue.after}\n\n`;
        }
      });
    }
    
    // Warnings
    if (report.details.warnings.length > 0) {
      markdown += `## ⚠️ Warnings\n\n`;
      report.details.warnings.forEach(warning => {
        markdown += `- **${warning.scenario}**: ${warning.message}\n`;
      });
      markdown += `\n`;
    }
    
    // Recommendations
    if (report.recommendations.length > 0) {
      markdown += `## 💡 Recommendations\n\n`;
      report.recommendations.forEach(rec => {
        markdown += `### ${rec.type} (${rec.severity})\n`;
        markdown += `${rec.message}\n\n`;
      });
    }
    
    // Passed Checks
    if (report.details.passedChecks.length > 0) {
      markdown += `## ✅ Passed Checks\n\n`;
      const checksByScenario = {};
      report.details.passedChecks.forEach(check => {
        if (!checksByScenario[check.scenario]) {
          checksByScenario[check.scenario] = [];
        }
        checksByScenario[check.scenario].push(check);
      });
      
      Object.entries(checksByScenario).forEach(([scenario, checks]) => {
        markdown += `### ${scenario}\n`;
        checks.forEach(check => {
          markdown += `- ${check.message}\n`;
        });
        markdown += `\n`;
      });
    }
    
    return markdown;
  }
}

export { BaselineComparator };

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node baseline-comparator.js <before-file> <after-file>');
    process.exit(1);
  }
  
  const comparator = new BaselineComparator();
  comparator.compareBaselines(args[0], args[1])
    .then(report => {
      console.log(`\n📊 Comparison completed!`);
      console.log(`Status: ${report.summary.overallStatus}`);
      console.log(`Critical Issues: ${report.summary.criticalIssues}`);
      console.log(`Warnings: ${report.summary.warnings}`);
      console.log(`Passed Checks: ${report.summary.passedChecks}`);
    })
    .catch(console.error);
}