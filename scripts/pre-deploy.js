#!/usr/bin/env node
/**
 * Quick pre-deploy script for Railway
 * Performs fast checks and exits immediately
 */

/* eslint-disable @typescript-eslint/no-require-imports */

console.log('🚀 Starting pre-deploy checks...');

// Check if required files exist
const fs = require('fs');
const requiredFiles = [
  'package.json',
  'src/listener/index.ts',
  'src/listener/keepAlive.ts'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Missing required file: ${file}`);
    process.exit(1);
  }
}

console.log('✅ All required files found');
console.log('✅ Pre-deploy checks complete - ready for deployment!');
console.log('⏱️  Pre-deploy completed in <1 second');

// Exit immediately
process.exit(0);
