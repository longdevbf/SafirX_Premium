/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers, formatEther, JsonRpcProvider } from 'ethers';

// Chainstack RPC endpoint - Complete URL format
const rpcUrl = 'https://testnet.sapphire.oasis.dev';

// Contract address on Sapphire
const contractAddress = '0x329Add063f3fcCb700eAb5525AD3E8127ea050a1';

// ABI của hợp đồng NFTMarket
const contractAbi = [
  {
    "inputs": [],
    "name": "getActiveListings",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "listingId",
        "type": "uint256"
      }
    ],
    "name": "getListing",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "nftContract",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "seller",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "price",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "collectionId",
            "type": "uint256"
          }
        ],
        "internalType": "struct NFTMarket.Listing",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "collectionId",
        "type": "uint256"
      }
    ],
    "name": "getCollection",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "collectionId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "nftContract",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "seller",
            "type": "address"
          },
          {
            "internalType": "uint256[]",
            "name": "tokenIds",
            "type": "uint256[]"
          },
          {
            "internalType": "uint256[]",
            "name": "prices",
            "type": "uint256[]"
          },
          {
            "internalType": "uint256",
            "name": "bundlePrice",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalItems",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "soldItems",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "isBundleType",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "collectionName",
            "type": "string"
          },
          {
            "internalType": "enum NFTMarket.ListingType",
            "name": "listingType",
            "type": "uint8"
          }
        ],
        "internalType": "struct NFTMarket.CollectionListing",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "getListingInfo",
    "outputs": [
      {
        "internalType": "bool",
        "name": "isBundle",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "nftContract",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "seller",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      },
      {
        "internalType": "string",
        "name": "collectionName",
        "type": "string"
      },
      {
        "internalType": "uint256[]",
        "name": "tokenIds",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Create provider with error handling
const provider = new JsonRpcProvider(rpcUrl);

// Create contract instance
const contract = new ethers.Contract(contractAddress, contractAbi, provider);

// Enhanced function with better error handling and timing
async function fetchMarketplaceData() {
  // Start timing
  const startTime = performance.now();
  console.log('🚀 Starting marketplace data fetch...');
  console.log(`⏰ Start time: ${new Date().toISOString()}`);
  
  try {
    console.log('Connecting to network...');
    const networkStartTime = performance.now();
    
    // Test network connection first
    const network = await provider.getNetwork();
    const networkEndTime = performance.now();
    const networkConnectionTime = networkEndTime - networkStartTime;
    
    console.log(`Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
    console.log(`⏱️ Network connection time: ${networkConnectionTime.toFixed(2)}ms`);
    
    // Get active listings
    const listingsStartTime = performance.now();
    const activeListings = await contract.getActiveListings();
    const listingsEndTime = performance.now();
    const listingsFetchTime = listingsEndTime - listingsStartTime;
    
    console.log(`Total active listings: ${activeListings.length}`);
    console.log(`⏱️ Active listings fetch time: ${listingsFetchTime.toFixed(2)}ms`);

    // Lưu trữ thông tin chi tiết
    const nftData = [];
    const processingStartTime = performance.now();
    let successfulProcessed = 0;
    let failedProcessed = 0;

    for (const id of activeListings) {
      const itemStartTime = performance.now();
      try {
        // Convert BigInt to Number for comparison
        const listingId = Number(id);
        
        // Nếu ID > 1000000, đây là bundle collection
        if (listingId > 1000000) {
          const collectionId = listingId - 1000000;
          const collection = await contract.getCollection(collectionId);
          if (collection.isActive && collection.isBundleType) {
            nftData.push({
              type: 'Bundle Collection',
              collectionId: collection.collectionId.toString(),
              nftContract: collection.nftContract,
              seller: collection.seller,
              price: formatEther(collection.bundlePrice),
              tokenIds: collection.tokenIds.map((tid: any) => tid.toString()),
              collectionName: collection.collectionName,
              isActive: collection.isActive,
              createdAt: new Date(Number(collection.createdAt) * 1000).toISOString()
            });
          }
        } else {
          // Đây là single listing hoặc collection individual
          const listing = await contract.getListing(id);
          if (listing.isActive) {
            nftData.push({
              type: Number(listing.collectionId) > 0 ? 'Collection Individual' : 'Single Listing',
              listingId: id.toString(),
              nftContract: listing.nftContract,
              tokenId: listing.tokenId.toString(),
              seller: listing.seller,
              price: formatEther(listing.price),
              isActive: listing.isActive,
              createdAt: new Date(Number(listing.createdAt) * 1000).toISOString(),
              collectionId: Number(listing.collectionId) > 0 ? listing.collectionId.toString() : 'N/A'
            });
          }
        }
        
        const itemEndTime = performance.now();
        const itemProcessTime = itemEndTime - itemStartTime;
        console.log(`  ✅ Processed listing ${id} in ${itemProcessTime.toFixed(2)}ms`);
        successfulProcessed++;
        
      } catch (itemError) {
        const itemEndTime = performance.now();
        const itemProcessTime = itemEndTime - itemStartTime;
        console.warn(`  ❌ Error processing listing ${id} (${itemProcessTime.toFixed(2)}ms):`, itemError);
        failedProcessed++;
        continue;
      }
    }

    const processingEndTime = performance.now();
    const totalProcessingTime = processingEndTime - processingStartTime;

    // In kết quả
    console.log('\n=====================================');
    console.log('📊 PROCESSING STATISTICS');
    console.log('=====================================');
    console.log(`⏱️ Total processing time: ${totalProcessingTime.toFixed(2)}ms`);
    console.log(`✅ Successfully processed: ${successfulProcessed} listings`);
    console.log(`❌ Failed to process: ${failedProcessed} listings`);
    console.log(`📈 Average time per listing: ${(totalProcessingTime / activeListings.length).toFixed(2)}ms`);
    
    console.log('\n=====================================');
    console.log('📋 MARKETPLACE LISTINGS');
    console.log('=====================================');
    
    if (nftData.length === 0) {
      console.log('No active NFT listings found.');
    } else {
      nftData.forEach((item, index) => {
        console.log(`\n#${index + 1}:`);
        console.log(`  Type: ${item.type}`);
        console.log(`  ${item.type === 'Bundle Collection' ? 'Collection ID' : 'Listing ID'}: ${item.type === 'Bundle Collection' ? item.collectionId : item.listingId}`);
        console.log(`  NFT Contract: ${item.nftContract}`);
        console.log(`  Seller: ${item.seller}`);
        console.log(`  Price: ${item.price} ROSE`);
        
        if (item.type === 'Bundle Collection') {
          console.log(`  Token IDs: [${item.tokenIds.join(', ')}]`);
          console.log(`  Collection Name: ${item.collectionName}`);
        } else {
          console.log(`  Token ID: ${item.tokenId}`);
          console.log(`  Collection ID: ${item.collectionId}`);
        }
        
        console.log(`  Active: ${item.isActive}`);
        console.log(`  Created At: ${item.createdAt}`);
        console.log('---');
      });
      
      console.log(`\nSummary: Found ${nftData.length} active listings`);
    }

    // End timing and show final results
    const endTime = performance.now();
    const totalExecutionTime = endTime - startTime;
    
    console.log('\n=====================================');
    console.log('⏰ TIMING SUMMARY');
    console.log('=====================================');
    console.log(`🔗 Network connection: ${networkConnectionTime.toFixed(2)}ms`);
    console.log(`📋 Fetch active listings: ${listingsFetchTime.toFixed(2)}ms`);
    console.log(`⚙️ Process all listings: ${totalProcessingTime.toFixed(2)}ms`);
    console.log(`🎯 Total execution time: ${totalExecutionTime.toFixed(2)}ms (${(totalExecutionTime / 1000).toFixed(2)}s)`);
    console.log(`📅 End time: ${new Date().toISOString()}`);

    return nftData;
  } catch (error: any) {
    const endTime = performance.now();
    const totalExecutionTime = endTime - startTime;
    
    console.error('\n❌ ERROR OCCURRED');
    console.error('=====================================');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error(`⏱️ Time before error: ${totalExecutionTime.toFixed(2)}ms`);
    
    if (error.code === 'UNSUPPORTED_OPERATION') {
      console.error('Fix: Check your RPC URL format. It should start with https://');
    }
    if (error.code === 'NETWORK_ERROR') {
      console.error('Fix: Check your internet connection and RPC endpoint');
    }
    if (error.code === 'CALL_EXCEPTION') {
      console.error('Fix: Check if the contract address is correct and the contract is deployed');
    }
    
    return [];
  }
}

// Run the function with overall timing
const scriptStartTime = performance.now();
console.log('🔄 Script execution started');

fetchMarketplaceData()
  .then((data) => {
    const scriptEndTime = performance.now();
    const scriptTotalTime = scriptEndTime - scriptStartTime;
    
    console.log('\n=====================================');
    console.log('🏁 SCRIPT COMPLETION');
    console.log('=====================================');
    
    if (data.length > 0) {
      console.log(`✅ Successfully fetched marketplace data`);
      console.log(`📊 Retrieved ${data.length} listings`);
    } else {
      console.log(`⚠️ No listings found or error occurred`);
    }
    
    console.log(`🕐 Total script runtime: ${scriptTotalTime.toFixed(2)}ms (${(scriptTotalTime / 1000).toFixed(2)}s)`);
    console.log(`📅 Script completed at: ${new Date().toISOString()}`);
  })
  .catch((error) => {
    const scriptEndTime = performance.now();
    const scriptTotalTime = scriptEndTime - scriptStartTime;
    
    console.error('\n❌ SCRIPT FAILED');
    console.error('=====================================');
    console.error('Error:', error.message);
    console.error(`⏱️ Runtime before failure: ${scriptTotalTime.toFixed(2)}ms`);
  });