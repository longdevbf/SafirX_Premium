// #!/usr/bin/env node
// /**
//  * Sync Service Test Script
//  * Test và chạy manual sync để kiểm tra
//  */

// import { performFullSync, performIncrementalSync } from '../listener/syncService';
// import { runMigration } from './migrate';

// async function testSync() {
//     console.log('🧪 Starting Sync Service Test...');
    
//     try {
//         // Step 1: Run migration first
//         console.log('\n📁 Step 1: Running database migration...');
//         await runMigration();
        
//         // Step 2: Test full sync
//         console.log('\n🔄 Step 2: Testing full synchronization...');
//         await performFullSync();
        
//         // Step 3: Test incremental sync
//         console.log('\n⚡ Step 3: Testing incremental synchronization...');
//         await performIncrementalSync();
        
//         console.log('\n✅ All sync tests completed successfully!');
//         console.log('🎯 The sync service is working properly.');
//         console.log('💡 Now your listeners will automatically catch up on missed events when they restart.');
        
//     } catch (error) {
//         console.error('\n❌ Sync test failed:', error);
//         process.exit(1);
//     }
// }

// // Run if this file is executed directly
// if (require.main === module) {
//     testSync().catch(console.error);
// }

// export { testSync };
