#!/usr/bin/env node

/**
 * SafirX Blockchain Listeners - Health Check Test Script
 * Test các endpoints để verify service đang hoạt động
 */

const BASE_URL = 'https://safirx-premium-production.up.railway.app';

const endpoints = [
    { path: '/health', name: 'Health Check' },
    { path: '/ping', name: 'Ping' },
    { path: '/', name: 'Service Info' }
];

async function testEndpoint(url, name) {
    try {
        console.log(`🔍 Testing ${name}: ${url}`);
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (response.ok) {
            console.log(`✅ ${name}: SUCCESS`);
            console.log(`   Status: ${response.status}`);
            console.log(`   Response:`, JSON.stringify(data, null, 2));
            
            // Kiểm tra keyword "alive" cho health check
            if (name === 'Health Check' && data.status === 'alive') {
                console.log(`   🎯 Keyword "alive" detected - UptimeRobot compatible!`);
            }
        } else {
            console.log(`❌ ${name}: FAILED`);
            console.log(`   Status: ${response.status}`);
            console.log(`   Response:`, data);
        }
        
    } catch (error) {
        console.log(`❌ ${name}: ERROR`);
        console.log(`   Error:`, error.message);
    }
    
    console.log(''); // Empty line for spacing
}

async function runTests() {
    console.log('🚀 SafirX Blockchain Listeners - Health Check Tests');
    console.log(`📡 Testing service at: ${BASE_URL}`);
    console.log('═'.repeat(60));
    console.log('');
    
    for (const endpoint of endpoints) {
        const url = BASE_URL + endpoint.path;
        await testEndpoint(url, endpoint.name);
        
        // Delay giữa các requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('═'.repeat(60));
    console.log('✨ Tests completed!');
    console.log('');
    console.log('🔗 UptimeRobot Setup:');
    console.log(`   URL: ${BASE_URL}/health`);
    console.log(`   Keyword: "alive"`);
    console.log(`   Interval: 5 minutes`);
}

// Chạy tests
runTests().catch(console.error);
