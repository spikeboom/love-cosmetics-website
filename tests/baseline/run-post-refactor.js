// tests/baseline/run-post-refactor.js
// SCRIPT PARA RODAR CAPTURAS PÓS-REFATORAÇÃO

import { BaselineCapture } from './baseline-capture.js';
import { APICapture } from './api-capture.js';
import fs from 'fs';
import path from 'path';

console.log('🔄 Starting POST-REFACTOR baseline captures...');
console.log('📍 This will create new baseline files with "post-refactor" prefix');
console.log('📍 Your pre-refactor files will NOT be overwritten');
console.log('');

// Set environment variable to indicate post-refactor mode
process.env.POST_REFACTOR = 'true';

async function runPostRefactorCaptures() {
  const results = {
    startTime: new Date().toISOString(),
    uiCapture: null,
    apiCapture: null,
    errors: []
  };

  try {
    // Run UI Baseline Capture
    console.log('==================================================');
    console.log('📸 Running UI Baseline Capture (Post-Refactor)...');
    console.log('==================================================');
    
    const uiCapture = new BaselineCapture();
    await uiCapture.runCompleteBaseline();
    results.uiCapture = 'Success';
    
    console.log('');
    console.log('✅ UI Baseline capture completed!');
    console.log('');
    
    // Wait a bit between captures
    console.log('⏳ Waiting 3 seconds before API capture...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Run API Capture
    console.log('==================================================');
    console.log('🔍 Running API Capture (Post-Refactor)...');
    console.log('==================================================');
    
    const apiCapture = new APICapture();
    await apiCapture.runFullAPICapture();
    results.apiCapture = 'Success';
    
    console.log('');
    console.log('✅ API capture completed!');
    
  } catch (error) {
    console.error('❌ Error during post-refactor capture:', error);
    results.errors.push({
      message: error.message,
      stack: error.stack
    });
  }

  // Save summary
  results.endTime = new Date().toISOString();
  const summaryPath = path.join('./tests/baseline/snapshots', 'post-refactor-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));

  console.log('');
  console.log('==================================================');
  console.log('📊 POST-REFACTOR CAPTURE SUMMARY');
  console.log('==================================================');
  console.log(`UI Capture: ${results.uiCapture || 'Failed'}`);
  console.log(`API Capture: ${results.apiCapture || 'Failed'}`);
  console.log(`Errors: ${results.errors.length}`);
  console.log('');
  console.log('📁 Files created:');
  console.log('  - baseline-post-refactor-latest.json');
  console.log('  - baseline-post-refactor-cart-coupons-[timestamp].json');
  console.log('  - api-capture-post-refactor-latest.json');
  console.log('  - api-capture-post-refactor-[timestamp].json');
  console.log('  - post-refactor-summary.json');
  console.log('');
  console.log('📍 Your pre-refactor files are preserved:');
  console.log('  - baseline-pre-refactor-latest.json');
  console.log('  - api-capture-latest.json');
  console.log('');
  console.log('🔍 You can now run the comparator to see differences!');
  console.log('   npm run compare');
  console.log('');
}

// Run the captures
runPostRefactorCaptures().catch(console.error);