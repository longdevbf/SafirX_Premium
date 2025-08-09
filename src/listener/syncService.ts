/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers } from 'ethers';
import { pool } from '@/lib/db';
import { ABI_CONFIG } from '@/components/config/abi_config';
import axios from 'axios';

// Contract addresses
const AUCTION_ADDRESS = '0x5f3e20d0F39b02CC51EE449ce733d8C3b4FAAb1A';
const MARKET_ADDRESS = '0xAcA4a7Eed013E4b890077d8006fDb0B46e24A932';

// RPC provider for data fetching
const provider = new ethers.JsonRpcProvider('https://testnet.sapphire.oasis.io');
const auctionContract = new ethers.Contract(AUCTION_ADDRESS, ABI_CONFIG.sealedBidAuction.abi, provider);
const marketContract = new ethers.Contract(MARKET_ADDRESS, ABI_CONFIG.marketPlace.abi, provider);

// Fetch NFT metadata
async function fetchNFTMetadata(contractAddress: string, tokenId: string) {
    const url = `https://testnet.nexus.oasis.io/v1/sapphire/evm_tokens/${contractAddress}/nfts/${tokenId}`;
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi fetch metadata cho token ${tokenId}:`, error);
        return null;
    }
}

// Get last synced block from database
async function getLastSyncedBlock(service: 'auction' | 'market'): Promise<number> {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT last_synced_block FROM sync_status WHERE service = $1`,
            [service]
        );
        
        if (result.rows.length > 0) {
            return result.rows[0].last_synced_block;
        }
        
        // Nếu chưa có record, tạo mới và return block hiện tại - 1000 (sync 1000 blocks trước)
        const currentBlock = await provider.getBlockNumber();
        const startBlock = Math.max(0, currentBlock - 1000);
        
        await client.query(
            `INSERT INTO sync_status (service, last_synced_block, created_at) VALUES ($1, $2, NOW())
             ON CONFLICT (service) DO UPDATE SET last_synced_block = $2, updated_at = NOW()`,
            [service, startBlock]
        );
        
        return startBlock;
    } catch (error) {
        console.error(`Lỗi khi lấy last synced block cho ${service}:`, error);
        return 0;
    } finally {
        client.release();
    }
}

// Update last synced block
async function updateLastSyncedBlock(service: 'auction' | 'market', blockNumber: number): Promise<void> {
    const client = await pool.connect();
    try {
        await client.query(
            `INSERT INTO sync_status (service, last_synced_block, updated_at) VALUES ($1, $2, NOW())
             ON CONFLICT (service) DO UPDATE SET last_synced_block = $2, updated_at = NOW()`,
            [service, blockNumber]
        );
    } catch (error) {
        console.error(`Lỗi khi cập nhật last synced block cho ${service}:`, error);
    } finally {
        client.release();
    }
}

// Check if auction exists in database
async function auctionExistsInDB(auctionId: string, auctionType: string): Promise<boolean> {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT 1 FROM auctions WHERE auction_id = $1 AND auction_type = $2`,
            [auctionId, auctionType]
        );
        return result.rows.length > 0;
    } catch (error) {
        console.error('Lỗi khi kiểm tra auction tồn tại:', error);
        return false;
    } finally {
        client.release();
    }
}

// Check if market listing exists in database
async function listingExistsInDB(listingId: string, listingType: string): Promise<boolean> {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT 1 FROM market_listings WHERE listing_id = $1 AND listing_type = $2`,
            [listingId, listingType]
        );
        return result.rows.length > 0;
    } catch (error) {
        console.error('Lỗi khi kiểm tra listing tồn tại:', error);
        return false;
    } finally {
        client.release();
    }
}

// Save auction to database (reuse from auctionListener)
async function saveAuctionToDatabase(data: any) {
    const client = await pool.connect();
    try {
        await client.query(
            `INSERT INTO auctions (
                auction_id, seller_address, nft_contract_address, auction_type, token_ids,
                starting_price, end_time, title, collection_name, image_url, description,
                nft_individual, status, nft_claimed, nft_reclaimed, total_bid
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
             ON CONFLICT (auction_id, auction_type) DO NOTHING`,
            [
                data.auction_id,
                data.seller_address,
                data.nft_contract_address,
                data.auction_type,
                JSON.stringify(data.token_ids),
                data.starting_price,
                data.end_time,
                data.title,
                data.collection_name,
                data.image_url,
                data.description,
                JSON.stringify(data.nft_individual),
                data.status,
                data.nft_claimed,
                data.nft_reclaimed,
                0 
            ]
        );
        console.log(`✅ Synced auction ${data.auction_id} (${data.auction_type})`);
    } catch (error) {
        console.error('Lỗi khi sync auction vào database:', error);
    } finally {
        client.release();
    }
}

// Save market listing to database (reuse from marketListener)
async function saveListingToDatabase(data: any) {
    const client = await pool.connect();
    try {
        await client.query(
            `INSERT INTO market_listings (
                listing_id, nft_contract_address, seller_address, token_ids, price,
                listing_type, collection_name, image_url, description, name, nft_individual
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             ON CONFLICT (listing_id, listing_type) DO NOTHING`,
            [
                data.listing_id,
                data.nft_contract_address,
                data.seller_address,
                JSON.stringify(data.token_ids),
                data.price,
                data.listing_type,
                data.collection_name,
                data.image_url,
                data.description,
                data.name,
                JSON.stringify(data.nft_individual)
            ]
        );
        console.log(`✅ Synced listing ${data.listing_id} (${data.listing_type})`);
    } catch (error) {
        console.error('Lỗi khi sync listing vào database:', error);
    } finally {
        client.release();
    }
}

// Sync auction events from a specific block range
export async function syncAuctionEvents(fromBlock: number, toBlock: number): Promise<void> {
    console.log(`🔄 Syncing auction events from block ${fromBlock} to ${toBlock}...`);
    
    // Split large block ranges to avoid RPC limits (max 100 blocks per query)
    const MAX_BLOCKS_PER_QUERY = 90; // Use 90 to be safe
    const totalBlocks = toBlock - fromBlock + 1;
    
    if (totalBlocks > MAX_BLOCKS_PER_QUERY) {
        // Split into smaller chunks
        for (let start = fromBlock; start <= toBlock; start += MAX_BLOCKS_PER_QUERY) {
            const end = Math.min(start + MAX_BLOCKS_PER_QUERY - 1, toBlock);
            await syncAuctionEventsChunk(start, end);
        }
        return;
    }
    
    // If range is small enough, process directly
    await syncAuctionEventsChunk(fromBlock, toBlock);
}

// Helper function to sync a chunk of auction events
async function syncAuctionEventsChunk(fromBlock: number, toBlock: number): Promise<void> {
    console.log(`  📦 Processing auction chunk: blocks ${fromBlock} to ${toBlock}`);
    
    try {
        // 1. AuctionCreated events
        const auctionCreatedFilter = auctionContract.filters.AuctionCreated();
        const auctionCreatedEvents = await auctionContract.queryFilter(auctionCreatedFilter, fromBlock, toBlock);
        
        for (const event of auctionCreatedEvents) {
            const eventLog = event as ethers.EventLog;
            const args = eventLog.args;
            if (!args) continue;
            
            const auctionId = args[0].toString();
            const auctionTypeNum = Number(args[3]);
            const auctionTypeString = auctionTypeNum === 0 ? 'single' : 'bundle';
            
            // Check if already exists
            const exists = await auctionExistsInDB(auctionId, auctionTypeString);
            if (exists) {
                console.log(`⏭️ Auction ${auctionId} (${auctionTypeString}) already exists, skipping...`);
                continue;
            }
            
            const seller = args[1];
            const nftContract = args[2];
            const tokenId = args[4].toString();
            const tokenIds = args[5].map((id: any) => id.toString());
            const startingPrice = ethers.formatEther(args[6]);
            const endTime = Number(args[7]);
            const title = args[8];
            
            // Fetch metadata
            const metadataPromises = tokenIds.length > 0 ? 
                tokenIds.map((id: string) => fetchNFTMetadata(nftContract, id)) : 
                [fetchNFTMetadata(nftContract, tokenId)];
            const metadataResults = await Promise.all(metadataPromises);
            
            if (metadataResults.some((result: any) => result === null)) {
                console.log(`❌ Failed to fetch metadata for auction ${auctionId}, skipping...`);
                continue;
            }
            
            const representativeMetadata = metadataResults[0];
            const activeTokenIds = tokenIds.length > 0 ? tokenIds : [tokenId];
            const nftIndividual = activeTokenIds.map((id: string, index: number) => ({
                token_id: id,
                metadata: metadataResults[index] || metadataResults[0]
            }));
            
            const auctionData = {
                auction_id: auctionId,
                seller_address: seller,
                nft_contract_address: nftContract,
                auction_type: auctionTypeString,
                token_ids: activeTokenIds,
                starting_price: startingPrice,
                end_time: endTime,
                title: title || representativeMetadata?.name || '',
                collection_name: representativeMetadata?.token?.name || '',
                image_url: representativeMetadata?.image || '',
                description: representativeMetadata?.description || '',
                nft_individual: nftIndividual,
                status: 'active',
                nft_claimed: false,
                nft_reclaimed: false
            };
            
            await saveAuctionToDatabase(auctionData);
        }

        // 2. BidPlaced events
        const bidPlacedFilter = auctionContract.filters.BidPlaced();
        const bidPlacedEvents = await auctionContract.queryFilter(bidPlacedFilter, fromBlock, toBlock);
        
        for (const event of bidPlacedEvents) {
            const eventLog = event as ethers.EventLog;
            const args = eventLog.args;
            if (!args) continue;
            
            const auctionId = args[0].toString();
            // Update total_bid for both single and bundle (same as listener)
            await incrementTotalBid(auctionId, 'single');
            await incrementTotalBid(auctionId, 'bundle');
        }

        // 3. AuctionFinalized events
        const auctionFinalizedFilter = auctionContract.filters.AuctionFinalized();
        const auctionFinalizedEvents = await auctionContract.queryFilter(auctionFinalizedFilter, fromBlock, toBlock);
        
        for (const event of auctionFinalizedEvents) {
            const eventLog = event as ethers.EventLog;
            const args = eventLog.args;
            if (!args) continue;
            
            const auctionId = args[0].toString();
            // Update status and reclaim_nft (same as listener)
            await updateAuctionStatusWithReclaim(auctionId, 'single', 'finalized');
            await updateAuctionStatusWithReclaim(auctionId, 'bundle', 'finalized');
        }

        // 4. AuctionCancelled events
        const auctionCancelledFilter = auctionContract.filters.AuctionCancelled();
        const auctionCancelledEvents = await auctionContract.queryFilter(auctionCancelledFilter, fromBlock, toBlock);
        
        for (const event of auctionCancelledEvents) {
            const eventLog = event as ethers.EventLog;
            const args = eventLog.args;
            if (!args) continue;
            
            const auctionId = args[0].toString();
            // Delete from database (same as listener)
            await deleteAuctionFromDatabase(auctionId, 'single');
            await deleteAuctionFromDatabase(auctionId, 'bundle');
        }

        // 5. NFTClaimed events
        const nftClaimedFilter = auctionContract.filters.NFTClaimed();
        const nftClaimedEvents = await auctionContract.queryFilter(nftClaimedFilter, fromBlock, toBlock);
        
        for (const event of nftClaimedEvents) {
            const eventLog = event as ethers.EventLog;
            const args = eventLog.args;
            if (!args) continue;
            
            const auctionId = args[0].toString();
            // Update claim status (same as listener)
            await updateClaimStatus(auctionId, 'single', 'nft_claimed', true);
            await updateClaimStatus(auctionId, 'bundle', 'nft_claimed', true);
        }

        // 6. NFTReclaimed events
        const nftReclaimedFilter = auctionContract.filters.NFTReclaimed();
        const nftReclaimedEvents = await auctionContract.queryFilter(nftReclaimedFilter, fromBlock, toBlock);
        
        for (const event of nftReclaimedEvents) {
            const eventLog = event as ethers.EventLog;
            const args = eventLog.args;
            if (!args) continue;
            
            const auctionId = args[0].toString();
            // Update reclaim status (same as listener)
            await updateClaimStatus(auctionId, 'single', 'nft_reclaimed', true);
            await updateClaimStatus(auctionId, 'bundle', 'nft_reclaimed', true);
        }
        
        console.log(`  ✅ Synced ${auctionCreatedEvents.length} auction creations, ${bidPlacedEvents.length} bids, ${auctionFinalizedEvents.length} finalizations, ${auctionCancelledEvents.length} cancellations, ${nftClaimedEvents.length} claims, ${nftReclaimedEvents.length} reclaims`);
        
    } catch (error) {
        console.error('  ❌ Lỗi khi sync auction chunk:', error);
        throw error;
    }
}

// Sync market events from a specific block range
export async function syncMarketEvents(fromBlock: number, toBlock: number): Promise<void> {
    console.log(`🔄 Syncing market events from block ${fromBlock} to ${toBlock}...`);
    
    // Split large block ranges to avoid RPC limits (max 100 blocks per query)
    const MAX_BLOCKS_PER_QUERY = 90; // Use 90 to be safe
    const totalBlocks = toBlock - fromBlock + 1;
    
    if (totalBlocks > MAX_BLOCKS_PER_QUERY) {
        // Split into smaller chunks
        for (let start = fromBlock; start <= toBlock; start += MAX_BLOCKS_PER_QUERY) {
            const end = Math.min(start + MAX_BLOCKS_PER_QUERY - 1, toBlock);
            await syncMarketEventsChunk(start, end);
        }
        return;
    }
    
    // If range is small enough, process directly
    await syncMarketEventsChunk(fromBlock, toBlock);
}

// Helper function to sync a chunk of market events
async function syncMarketEventsChunk(fromBlock: number, toBlock: number): Promise<void> {
    console.log(`  📦 Processing market chunk: blocks ${fromBlock} to ${toBlock}`);
    
    try {
        // Get NFTListed events
        const nftListedFilter = marketContract.filters.NFTListed();
        const nftListedEvents = await marketContract.queryFilter(nftListedFilter, fromBlock, toBlock);
        
        for (const event of nftListedEvents) {
            const eventLog = event as ethers.EventLog;
            const args = eventLog.args;
            if (!args) continue;
            
            const listingId = args[0].toString();
            const listingType = 'single';
            
            // Kiểm tra xem listing đã tồn tại chưa
            const exists = await listingExistsInDB(listingId, listingType);
            if (exists) {
                console.log(`⏭️ Listing ${listingId} (${listingType}) already exists, skipping...`);
                continue;
            }
            
            const nftContract = args[1];
            const tokenId = args[2].toString();
            const seller = args[3];
            const price = ethers.formatEther(args[4]);
            
            // Fetch metadata
            const metadata = await fetchNFTMetadata(nftContract, tokenId);
            if (!metadata) {
                console.log(`❌ Failed to fetch metadata for listing ${listingId}, skipping...`);
                continue;
            }
            
            const listingData = {
                listing_id: listingId,
                nft_contract_address: nftContract,
                seller_address: seller,
                token_ids: [tokenId],
                price: price,
                listing_type: listingType,
                collection_name: metadata.token?.name || '',
                image_url: metadata.image || '',
                description: metadata.description || '',
                name: metadata.name || '',
                nft_individual: [{ token_id: tokenId, metadata }]
            };
            
            await saveListingToDatabase(listingData);
        }
        
        // Get CollectionBundleListed events
        const bundleListedFilter = marketContract.filters.CollectionBundleListed();
        const bundleListedEvents = await marketContract.queryFilter(bundleListedFilter, fromBlock, toBlock);
        
        for (const event of bundleListedEvents) {
            const eventLog = event as ethers.EventLog;
            const args = eventLog.args;
            if (!args) continue;
            
            const collectionId = args[0].toString();
            const listingType = 'bundle';
            
            // Kiểm tra xem bundle đã tồn tại chưa
            const exists = await listingExistsInDB(collectionId, listingType);
            if (exists) {
                console.log(`⏭️ Bundle ${collectionId} (${listingType}) already exists, skipping...`);
                continue;
            }
            
            const nftContract = args[1];
            const seller = args[2];
            const tokenIds = args[3].map((id: any) => id.toString());
            const bundlePrice = ethers.formatEther(args[4]);
            const collectionName = args[5];
            
            // Fetch metadata cho tất cả NFT trong bundle
            const metadataPromises = tokenIds.map((id: string) => fetchNFTMetadata(nftContract, id));
            const metadataResults = await Promise.all(metadataPromises);
            
            if (metadataResults.some((result: any) => result === null)) {
                console.log(`❌ Failed to fetch metadata for bundle ${collectionId}, skipping...`);
                continue;
            }
            
            const representativeMetadata = metadataResults[0];
            const nftIndividual = tokenIds.map((id: string, index: number) => ({
                token_id: id,
                metadata: metadataResults[index]
            }));
            
            const bundleData = {
                listing_id: collectionId,
                nft_contract_address: nftContract,
                seller_address: seller,
                token_ids: tokenIds,
                price: bundlePrice,
                listing_type: listingType,
                collection_name: collectionName || representativeMetadata?.token?.name || '',
                image_url: representativeMetadata?.image || '',
                description: representativeMetadata?.description || '',
                name: collectionName || `${representativeMetadata?.token?.name || ''} Bundle`,
                nft_individual: nftIndividual
            };
            
            await saveListingToDatabase(bundleData);
        }

        // 3. PriceUpdated events
        const priceUpdatedFilter = marketContract.filters.PriceUpdated();
        const priceUpdatedEvents = await marketContract.queryFilter(priceUpdatedFilter, fromBlock, toBlock);
        
        for (const event of priceUpdatedEvents) {
            const eventLog = event as ethers.EventLog;
            const args = eventLog.args;
            if (!args) continue;
            
            const listingId = args[0].toString();
            const newPrice = ethers.formatEther(args[2]);
            await updateListingPrice(listingId, newPrice, 'single');
        }

        // 4. BundlePriceUpdated events
        const bundlePriceUpdatedFilter = marketContract.filters.BundlePriceUpdated();
        const bundlePriceUpdatedEvents = await marketContract.queryFilter(bundlePriceUpdatedFilter, fromBlock, toBlock);
        
        for (const event of bundlePriceUpdatedEvents) {
            const eventLog = event as ethers.EventLog;
            const args = eventLog.args;
            if (!args) continue;
            
            const collectionId = args[0].toString();
            const newPrice = ethers.formatEther(args[2]);
            await updateListingPrice(collectionId, newPrice, 'bundle');
        }

        // 5. ListingCancelled events
        const listingCancelledFilter = marketContract.filters.ListingCancelled();
        const listingCancelledEvents = await marketContract.queryFilter(listingCancelledFilter, fromBlock, toBlock);
        
        for (const event of listingCancelledEvents) {
            const eventLog = event as ethers.EventLog;
            const args = eventLog.args;
            if (!args) continue;
            
            const listingId = args[0].toString();
            await deleteListingFromDatabase(listingId, 'single');
        }

        // 6. CollectionCancelled events
        const collectionCancelledFilter = marketContract.filters.CollectionCancelled();
        const collectionCancelledEvents = await marketContract.queryFilter(collectionCancelledFilter, fromBlock, toBlock);
        
        for (const event of collectionCancelledEvents) {
            const eventLog = event as ethers.EventLog;
            const args = eventLog.args;
            if (!args) continue;
            
            const collectionId = args[0].toString();
            await deleteListingFromDatabase(collectionId, 'bundle');
        }

        // 7. NFTSold events
        const nftSoldFilter = marketContract.filters.NFTSold();
        const nftSoldEvents = await marketContract.queryFilter(nftSoldFilter, fromBlock, toBlock);
        
        for (const event of nftSoldEvents) {
            const eventLog = event as ethers.EventLog;
            const args = eventLog.args;
            if (!args) continue;
            
            const listingId = args[0].toString();
            await deleteListingFromDatabase(listingId, 'single');
        }

        // 8. CollectionBundleSold events
        const collectionBundleSoldFilter = marketContract.filters.CollectionBundleSold();
        const collectionBundleSoldEvents = await marketContract.queryFilter(collectionBundleSoldFilter, fromBlock, toBlock);
        
        for (const event of collectionBundleSoldEvents) {
            const eventLog = event as ethers.EventLog;
            const args = eventLog.args;
            if (!args) continue;
            
            const collectionId = args[0].toString();
            await deleteListingFromDatabase(collectionId, 'bundle');
        }
        
        console.log(`  ✅ Synced ${nftListedEvents.length} single listings and ${bundleListedEvents.length} bundle listings`);
        
    } catch (error) {
        console.error('  ❌ Lỗi khi sync market chunk:', error);
        throw error; // Re-throw để parent function có thể handle
    }
}

// Main sync function
export async function performFullSync(): Promise<void> {
    console.log('🚀 Starting full data synchronization...');
    
    try {
        const currentBlock = await provider.getBlockNumber();
        console.log(`Current block number: ${currentBlock}`);
        
        // Sync auction events
        const lastAuctionBlock = await getLastSyncedBlock('auction');
        console.log(`Last synced auction block: ${lastAuctionBlock}`);
        
        if (currentBlock > lastAuctionBlock) {
            const maxBlockRange = 10000; // Sync in chunks of 10000 blocks
            for (let fromBlock = Number(lastAuctionBlock) + 1; fromBlock <= currentBlock; fromBlock += maxBlockRange) {
                const toBlock = Math.min(fromBlock + maxBlockRange - 1, currentBlock);
                await syncAuctionEvents(fromBlock, toBlock);
                await updateLastSyncedBlock('auction', toBlock);
                
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        // Sync market events
        const lastMarketBlock = await getLastSyncedBlock('market');
        console.log(`Last synced market block: ${lastMarketBlock}`);
        
        if (currentBlock > lastMarketBlock) {
            const maxBlockRange = 10000; // Sync in chunks of 10000 blocks
            for (let fromBlock = Number(lastMarketBlock) + 1; fromBlock <= currentBlock; fromBlock += maxBlockRange) {
                const toBlock = Math.min(fromBlock + maxBlockRange - 1, currentBlock);
                await syncMarketEvents(fromBlock, toBlock);
                await updateLastSyncedBlock('market', toBlock);
                
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        console.log('✅ Full synchronization completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during synchronization:', error);
    }
}

// Incremental sync function (for regular updates)
export async function performIncrementalSync(): Promise<void> {
    try {
        const currentBlock = await provider.getBlockNumber();
        
        // Sync recent auction events (last 100 blocks)
        const lastAuctionBlock = await getLastSyncedBlock('auction');
        const auctionFromBlock = Math.max(Number(lastAuctionBlock) + 1, currentBlock - 100);
        
        if (currentBlock >= auctionFromBlock) {
            await syncAuctionEvents(auctionFromBlock, currentBlock);
            await updateLastSyncedBlock('auction', currentBlock);
        }
        
        // Sync recent market events (last 100 blocks)
        const lastMarketBlock = await getLastSyncedBlock('market');
        const marketFromBlock = Math.max(Number(lastMarketBlock) + 1, currentBlock - 100);
        
        if (currentBlock >= marketFromBlock) {
            await syncMarketEvents(marketFromBlock, currentBlock);
            await updateLastSyncedBlock('market', currentBlock);
        }
        
        console.log('Incremental synchronization completed!');
        
    } catch (error) {
        console.error('❌ Error during incremental sync:', error);
    }
}

// Auto-start sync scheduler
let syncInterval: NodeJS.Timeout | null = null;
let isServiceRunning = false;

// Start automatic sync service
export async function startSyncService(): Promise<void> {
    if (isServiceRunning) {
        console.log('⚠️ Sync service is already running');
        return;
    }
    
    console.log('🚀 Starting automatic sync service...');
    isServiceRunning = true;
    
    try {
        // Perform initial sync when service starts
        console.log('📊 Performing initial synchronization...');
        await performIncrementalSync();
        
        // Set up incremental sync every 30 seconds
        syncInterval = setInterval(async () => {
            if (isServiceRunning) {
                try {
                    await performIncrementalSync();
                } catch (error) {
                    console.error('❌ Error in scheduled sync:', error);
                }
            }
        }, 30000); // 30 seconds
        
        console.log('✅ Sync service started with 30-second intervals');
        
    } catch (error) {
        console.error('❌ Error starting sync service:', error);
        isServiceRunning = false;
        throw error;
    }
}

// Stop sync service
export async function stopSyncService(): Promise<void> {
    if (!isServiceRunning) {
        console.log('⚠️ Sync service is not running');
        return;
    }
    
    isServiceRunning = false;
    
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
    }
    
    console.log('🛑 Sync service stopped');
}

// Get sync service status
export function getSyncServiceStatus(): { isRunning: boolean; intervalMs: number | null } {
    return {
        isRunning: isServiceRunning,
        intervalMs: syncInterval ? 30000 : null
    };
}

// Additional helper functions for complete event sync

// Update auction status with reclaim timestamp (from listener)
async function updateAuctionStatusWithReclaim(auctionId: string, auctionType: string, status: string) {
    const client = await pool.connect();
    try {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const reclaimTimestamp = currentTimestamp + (3 * 24 * 60 * 60); // 3 days
        
        await client.query(
            `UPDATE auctions SET status = $1, reclaim_nft = $2 WHERE auction_id = $3 AND auction_type = $4`,
            [status, reclaimTimestamp, auctionId, auctionType]
        );
    } catch (error) {
        console.error('Error updating auction status with reclaim:', error);
    } finally {
        client.release();
    }
}

// Update claim status (from listener)
async function updateClaimStatus(auctionId: string, auctionType: string, field: string, value: boolean) {
    const client = await pool.connect();
    try {
        await client.query(
            `UPDATE auctions SET ${field} = $1 WHERE auction_id = $2 AND auction_type = $3`,
            [value, auctionId, auctionType]
        );
    } catch (error) {
        console.error(`Error updating ${field}:`, error);
    } finally {
        client.release();
    }
}

// Increment total_bid (from listener)
async function incrementTotalBid(auctionId: string, auctionType: string) {
    const client = await pool.connect();
    try {
        await client.query(
            `UPDATE auctions SET total_bid = total_bid + 1 WHERE auction_id = $1 AND auction_type = $2`,
            [auctionId, auctionType]
        );
    } catch (error) {
        console.error('Error incrementing total_bid:', error);
    } finally {
        client.release();
    }
}

// Delete auction from database (from listener)
async function deleteAuctionFromDatabase(auctionId: string, auctionType: string) {
    const client = await pool.connect();
    try {
        await client.query(
            `DELETE FROM auctions WHERE auction_id = $1 AND auction_type = $2`,
            [auctionId, auctionType]
        );
    } catch (error) {
        console.error('Error deleting auction:', error);
    } finally {
        client.release();
    }
}

// Update market listing price (from listener)
async function updateListingPrice(listingId: string, newPrice: string, listingType: string) {
    const client = await pool.connect();
    try {
        await client.query(
            `UPDATE market_listings SET price = $1 WHERE listing_id = $2 AND listing_type = $3`,
            [newPrice, listingId, listingType]
        );
    } catch (error) {
        console.error('Error updating listing price:', error);
    } finally {
        client.release();
    }
}

// Delete market listing from database (from listener)
async function deleteListingFromDatabase(listingId: string, listingType: string) {
    const client = await pool.connect();
    try {
        await client.query(
            `DELETE FROM market_listings WHERE listing_id = $1 AND listing_type = $2`,
            [listingId, listingType]
        );
    } catch (error) {
        console.error('Error deleting listing:', error);
    } finally {
        client.release();
    }
}

// Graceful shutdown handlers
process.on('SIGINT', async () => {
    console.log('🛑 Received SIGINT, shutting down sync service...');
    await stopSyncService();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('🛑 Received SIGTERM, shutting down sync service...');
    await stopSyncService();
    process.exit(0);
});
