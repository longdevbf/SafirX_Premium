/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers } from 'ethers';
import { pool } from '../lib/db';
import * as SealedBidAuction from '../../contract/safirX_contract/artifacts/contracts/sealedBidAuction.sol/SealedBidAuction.json';
import * as NFTMarketPlace from '../../contract/safirX_contract/artifacts/contracts/marketPlace.sol/NFTMarket.json';
import axios from 'axios';
import {ABI_CONFIG} from '@/components/config/abi_config'
const AUCTION_ADDRESS = ABI_CONFIG.sealedBidAuction.address;
const MARKET_ADDRESS = ABI_CONFIG.marketPlace.address;
const provider = new ethers.JsonRpcProvider('https://sapphire.oasis.io');
const auctionContract = new ethers.Contract(AUCTION_ADDRESS, SealedBidAuction.abi, provider);
const marketContract = new ethers.Contract(MARKET_ADDRESS, NFTMarketPlace.abi, provider);
async function fetchNFTMetadata(contractAddress: string, tokenId: string) {
    const url = `https://nexus.oasis.io/v1/sapphire/evm_tokens/${contractAddress}/nfts/${tokenId}`;
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
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
        //(`Lỗi khi lấy last synced block cho ${service}:`, error);
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
        //(`Lỗi khi cập nhật last synced block cho ${service}:`, error);
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
        //('Lỗi khi kiểm tra auction tồn tại:', error);
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
        //('Lỗi khi kiểm tra listing tồn tại:', error);
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
        //(`✅ Synced auction ${data.auction_id} (${data.auction_type})`);
    } catch (error) {
        //('Lỗi khi sync auction vào database:', error);
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
        //(`✅ Synced listing ${data.listing_id} (${data.listing_type})`);
    } catch (error) {
        //('Lỗi khi sync listing vào database:', error);
    } finally {
        client.release();
    }
}

// Conditional sync bid events - only when server just restarted
async function syncBidEventsIfNeeded(fromBlock: number, toBlock: number): Promise<void> {
    const uptime = process.uptime();
    
    if (uptime < 120) { // Server vừa restart trong 2 phút
        console.log(`🔄 Process uptime ${uptime.toFixed(2)}s < 120s, syncing missed bid events from block ${fromBlock} to ${toBlock}...`);
        
        try {
            const bidPlacedFilter = auctionContract.filters.BidPlaced();
            const bidPlacedEvents = await auctionContract.queryFilter(bidPlacedFilter, fromBlock, toBlock);
            
            for (const event of bidPlacedEvents) {
                const eventLog = event as ethers.EventLog;
                const args = eventLog.args;
                if (!args) continue;
                
                const auctionId = args[0].toString();
                
                // Apply same logic as real-time listener: update both single and bundle types
                await incrementTotalBidWithAntiSnipingSync(auctionId, 'single');
                await incrementTotalBidWithAntiSnipingSync(auctionId, 'bundle');
                
                console.log(`✅ Processed missed bid event for auction ${auctionId}`);
            }
            
            console.log(`✅ Synced ${bidPlacedEvents.length} missed bid events`);
            
        } catch (error) {
            console.error('❌ Error syncing bid events:', error);
        }
    } else {
    }
}

// Anti-sniping function for sync service (matching auctionListener logic)
async function incrementTotalBidWithAntiSnipingSync(auctionId: string, auctionType: string): Promise<void> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const auctionResult = await client.query(
            `SELECT end_time FROM auctions WHERE auction_id = $1 AND auction_type = $2 AND status = 'active'`,
            [auctionId, auctionType]
        );

        if (auctionResult.rows.length > 0) {
            const auction = auctionResult.rows[0];
            const currentTime = Math.floor(Date.now() / 1000);
            const timeUntilEnd = auction.end_time - currentTime;
            const TEN_MINUTES = 10 * 60; 
            
            if (timeUntilEnd > 0 && timeUntilEnd <= TEN_MINUTES) {
                const newEndTime = currentTime + TEN_MINUTES;
                
                await client.query(
                    `UPDATE auctions 
                     SET total_bid = total_bid + 1, end_time = $1, updated_at = NOW()
                     WHERE auction_id = $2 AND auction_type = $3`,
                    [newEndTime, auctionId, auctionType]
                );
            } else {
                await client.query(
                    `UPDATE auctions SET total_bid = total_bid + 1 WHERE auction_id = $1 AND auction_type = $2`,
                    [auctionId, auctionType]
                );
            }
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in sync anti-sniping logic:', error);
    } finally {
        client.release();
    }
}

// Sync auction events from a specific block range
export async function syncAuctionEvents(fromBlock: number, toBlock: number): Promise<void> {
    const MAX_BLOCKS_PER_QUERY = 50; 
    const totalBlocks = toBlock - fromBlock + 1;
    
    if (totalBlocks > MAX_BLOCKS_PER_QUERY) {
        // Split into smaller chunks
        for (let start = fromBlock; start <= toBlock; start += MAX_BLOCKS_PER_QUERY) {
            const end = Math.min(start + MAX_BLOCKS_PER_QUERY - 1, toBlock);
            await syncAuctionEventsChunk(start, end);
        }
        return;
    }
    
    
    await syncAuctionEventsChunk(fromBlock, toBlock);
}
async function updateAuctionStatusWithReclaim(auctionId: string, auctionType: string, status: string): Promise<void> {
    const client = await pool.connect();
    try {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const reclaimTimestamp = currentTimestamp + (3 * 24 * 60 * 60); // +3 days
        
        await client.query(
            `UPDATE auctions SET status = $1, reclaim_nft = $2 WHERE auction_id = $3 AND auction_type = $4`,
            [status, reclaimTimestamp, auctionId, auctionType]
        );
    } catch (error) {
    } finally {
        client.release();
    }
}

async function updateClaimStatus(auctionId: string, auctionType: string, field: string, value: boolean): Promise<void> {
    const client = await pool.connect();
    try {
        await client.query(
            `UPDATE auctions SET ${field} = $1 WHERE auction_id = $2 AND auction_type = $3`,
            [value, auctionId, auctionType]
        );
    } catch (error) {
        //(`Error updating ${field}:`, error);
    } finally {
        client.release();
    }
}

// Delete auction from database
async function deleteAuctionFromDB(auctionId: string, auctionType: string): Promise<void> {
    const client = await pool.connect();
    try {
        await client.query(
            `DELETE FROM auctions WHERE auction_id = $1 AND auction_type = $2`,
            [auctionId, auctionType]
        );
    } catch (error) {
        
    } finally {
        client.release();
    }
}
async function syncAuctionEventsChunk(fromBlock: number, toBlock: number): Promise<void> {
    try {
        const auctionCreatedFilter = auctionContract.filters.AuctionCreated();
        const auctionCreatedEvents = await auctionContract.queryFilter(auctionCreatedFilter, fromBlock, toBlock);
        
        for (const event of auctionCreatedEvents) {
            const eventLog = event as ethers.EventLog;
            const args = eventLog.args;
            if (!args) continue;
            
            const auctionId = args[0].toString();
            const auctionTypeNum = Number(args[3]);
            const auctionTypeString = auctionTypeNum === 0 ? 'single' : 'bundle';
            
            const exists = await auctionExistsInDB(auctionId, auctionTypeString);
            if (exists) {
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
        
        // 2. Sync AuctionFinalized events
        const auctionFinalizedFilter = auctionContract.filters.AuctionFinalized();
        const auctionFinalizedEvents = await auctionContract.queryFilter(auctionFinalizedFilter, fromBlock, toBlock);
        
        for (const event of auctionFinalizedEvents) {
            const eventLog = event as ethers.EventLog;
            const args = eventLog.args;
            if (!args) continue;
            
            const auctionId = args[0].toString();
            //(`📋 Processing AuctionFinalized: ${auctionId}`);
            
            await updateAuctionStatusWithReclaim(auctionId, 'single', 'finalized');
            await updateAuctionStatusWithReclaim(auctionId, 'bundle', 'finalized');
        }
        
        // 3. Sync AuctionCancelled events
        const auctionCancelledFilter = auctionContract.filters.AuctionCancelled();
        const auctionCancelledEvents = await auctionContract.queryFilter(auctionCancelledFilter, fromBlock, toBlock);
        
        for (const event of auctionCancelledEvents) {
            const eventLog = event as ethers.EventLog;
            const args = eventLog.args;
            if (!args) continue;
            
            const auctionId = args[0].toString();
            //(`🚫 Processing AuctionCancelled: ${auctionId}`);
            
            await deleteAuctionFromDB(auctionId, 'single');
            await deleteAuctionFromDB(auctionId, 'bundle');
        }
        
        // 4. Sync NFTClaimed events
        const nftClaimedFilter = auctionContract.filters.NFTClaimed();
        const nftClaimedEvents = await auctionContract.queryFilter(nftClaimedFilter, fromBlock, toBlock);
        
        for (const event of nftClaimedEvents) {
            const eventLog = event as ethers.EventLog;
            const args = eventLog.args;
            if (!args) continue;
            
            const auctionId = args[0].toString();
            //(`🎁 Processing NFTClaimed: ${auctionId}`);
            
            await updateClaimStatus(auctionId, 'single', 'nft_claimed', true);
            await updateClaimStatus(auctionId, 'bundle', 'nft_claimed', true);
        }
        
        // 5. Sync NFTReclaimed events
        const nftReclaimedFilter = auctionContract.filters.NFTReclaimed();
        const nftReclaimedEvents = await auctionContract.queryFilter(nftReclaimedFilter, fromBlock, toBlock);
        
        for (const event of nftReclaimedEvents) {
            const eventLog = event as ethers.EventLog;
            const args = eventLog.args;
            if (!args) continue;
            
            const auctionId = args[0].toString();
            //(`🔄 Processing NFTReclaimed: ${auctionId}`);
            
            await updateClaimStatus(auctionId, 'single', 'nft_reclaimed', true);
            await updateClaimStatus(auctionId, 'bundle', 'nft_reclaimed', true);
        }
        
        //(`  ✅ Synced ${auctionCreatedEvents.length} created, ${auctionFinalizedEvents.length} finalized, ${auctionCancelledEvents.length} cancelled, ${nftClaimedEvents.length} claimed, ${nftReclaimedEvents.length} reclaimed`);
        
    } catch (error) {
        //('  ❌ Error syncing auction chunk:', error);
        throw error;
    }
}

// Sync market events from a specific block range
export async function syncMarketEvents(fromBlock: number, toBlock: number): Promise<void> {
    //(`🔄 Syncing market events from block ${fromBlock} to ${toBlock}...`);
    
    // Split large block ranges to avoid RPC limits (max 50 blocks per query for safety)
    const MAX_BLOCKS_PER_QUERY = 50; // Reduced from 90 to 50 for RPC stability
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

// Update market listing price
async function updateListingPrice(listingId: string, newPrice: string, listingType: string): Promise<void> {
    const client = await pool.connect();
    try {
        await client.query(
            `UPDATE market_listings SET price = $1 WHERE listing_id = $2 AND listing_type = $3`,
            [newPrice, listingId, listingType]
        );
    } catch (error) {
    } finally {
        client.release();
    }
}

// Delete market listing from database
async function deleteListingFromDB(listingId: string, listingType: string): Promise<void> {
    const client = await pool.connect();
    try {
        await client.query(
            `DELETE FROM market_listings WHERE listing_id = $1 AND listing_type = $2`,
            [listingId, listingType]
        );
    } catch (error) {
    } finally {
        client.release();
    }
}

async function syncMarketEventsChunk(fromBlock: number, toBlock: number): Promise<void> {
    try {
        // 1. Sync NFTListed events
        const nftListedFilter = marketContract.filters.NFTListed();
        const nftListedEvents = await marketContract.queryFilter(nftListedFilter, fromBlock, toBlock);
        
        for (const event of nftListedEvents) {
            const eventLog = event as ethers.EventLog;
            const args = eventLog.args;
            if (!args) continue;
            
            const listingId = args[0].toString();
            const listingType = 'single';
            
            const exists = await listingExistsInDB(listingId, listingType);
            if (exists) {
                continue;
            }
            
            const nftContract = args[1];
            const tokenId = args[2].toString();
            const seller = args[3];
            const price = ethers.formatEther(args[4]);
            
            const metadata = await fetchNFTMetadata(nftContract, tokenId);
            if (!metadata) {
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
        const bundleListedFilter = marketContract.filters.CollectionBundleListed();
        const bundleListedEvents = await marketContract.queryFilter(bundleListedFilter, fromBlock, toBlock);
        
        for (const event of bundleListedEvents) {
            const eventLog = event as ethers.EventLog;
            const args = eventLog.args;
            if (!args) continue;
            
            const collectionId = args[0].toString();
            const listingType = 'bundle';
            
            const exists = await listingExistsInDB(collectionId, listingType);
            if (exists) {
                continue;
            }
            
            const nftContract = args[1];
            const seller = args[2];
            const tokenIds = args[3].map((id: any) => id.toString());
            const bundlePrice = ethers.formatEther(args[4]);
            const collectionName = args[5];
            
            const metadataPromises = tokenIds.map((id: string) => fetchNFTMetadata(nftContract, id));
            const metadataResults = await Promise.all(metadataPromises);
            
            if (metadataResults.some((result: any) => result === null)) {
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
        
        // 3. Sync PriceUpdated events
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
        
        // 4. Sync BundlePriceUpdated events
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
        
        // 5. Sync ListingCancelled events
        const listingCancelledFilter = marketContract.filters.ListingCancelled();
        const listingCancelledEvents = await marketContract.queryFilter(listingCancelledFilter, fromBlock, toBlock);
        
        for (const event of listingCancelledEvents) {
            const eventLog = event as ethers.EventLog;
            const args = eventLog.args;
            if (!args) continue;
            
            const listingId = args[0].toString();
            //(`🚫 Processing ListingCancelled: ${listingId}`);
            
            await deleteListingFromDB(listingId, 'single');
        }
        
        // 6. Sync CollectionCancelled events
        const collectionCancelledFilter = marketContract.filters.CollectionCancelled();
        const collectionCancelledEvents = await marketContract.queryFilter(collectionCancelledFilter, fromBlock, toBlock);
        
        for (const event of collectionCancelledEvents) {
            const eventLog = event as ethers.EventLog;
            const args = eventLog.args;
            if (!args) continue;
            
            const collectionId = args[0].toString();
            //(`🚫 Processing CollectionCancelled: ${collectionId}`);
            
            await deleteListingFromDB(collectionId, 'bundle');
        }
        
        // 7. Sync NFTSold events
        const nftSoldFilter = marketContract.filters.NFTSold();
        const nftSoldEvents = await marketContract.queryFilter(nftSoldFilter, fromBlock, toBlock);
        
        for (const event of nftSoldEvents) {
            const eventLog = event as ethers.EventLog;
            const args = eventLog.args;
            if (!args) continue;
            
            const listingId = args[0].toString();
            //(`💸 Processing NFTSold: ${listingId}`);
            
            await deleteListingFromDB(listingId, 'single');
        }
        
        // 8. Sync CollectionBundleSold events
        const collectionBundleSoldFilter = marketContract.filters.CollectionBundleSold();
        const collectionBundleSoldEvents = await marketContract.queryFilter(collectionBundleSoldFilter, fromBlock, toBlock);
        
        for (const event of collectionBundleSoldEvents) {
            const eventLog = event as ethers.EventLog;
            const args = eventLog.args;
            if (!args) continue;
            
            const collectionId = args[0].toString();
           
            await deleteListingFromDB(collectionId, 'bundle');
        }
        
       
    } catch (error) {
         throw error;
    }
}


export async function performFullSync(): Promise<void> {
   
    try {
        const currentBlock = await provider.getBlockNumber();
       
        const lastAuctionBlock = await getLastSyncedBlock('auction');
         
        if (currentBlock > lastAuctionBlock) {
            const maxBlockRange = 1000; 
            for (let fromBlock = Number(lastAuctionBlock) + 1; fromBlock <= currentBlock; fromBlock += maxBlockRange) {
                const toBlock = Math.min(fromBlock + maxBlockRange - 1, currentBlock);
                await syncAuctionEvents(fromBlock, toBlock);
                await syncBidEventsIfNeeded(fromBlock, toBlock);
                await updateLastSyncedBlock('auction', toBlock);
                
                await new Promise(resolve => setTimeout(resolve, 200)); // Increased delay
            }
        }
        
        // Sync market events
        const lastMarketBlock = await getLastSyncedBlock('market');
        //(`Last synced market block: ${lastMarketBlock}`);
        
        if (currentBlock > lastMarketBlock) {
            const maxBlockRange = 1000; // Reduced from 10000 to 1000 for RPC stability
            for (let fromBlock = Number(lastMarketBlock) + 1; fromBlock <= currentBlock; fromBlock += maxBlockRange) {
                const toBlock = Math.min(fromBlock + maxBlockRange - 1, currentBlock);
                await syncMarketEvents(fromBlock, toBlock);
                await updateLastSyncedBlock('market', toBlock);
                
                await new Promise(resolve => setTimeout(resolve, 200)); // Increased delay
            }
        }
        
       
    } catch (error) {
           }
}


export async function performIncrementalSync(): Promise<void> {
    try {
        const currentBlock = await provider.getBlockNumber();
        
        // Sync recent auction events (last 50 blocks to reduce RPC load)
        const lastAuctionBlock = await getLastSyncedBlock('auction');
        const auctionFromBlock = Math.max(Number(lastAuctionBlock) + 1, currentBlock - 50); // Reduced from 100 to 50
        
        if (currentBlock >= auctionFromBlock) {
            await syncAuctionEvents(auctionFromBlock, currentBlock);
            await syncBidEventsIfNeeded(auctionFromBlock, currentBlock); // Conditional bid sync
            await updateLastSyncedBlock('auction', currentBlock);
        }
        
        // Sync recent market events (last 50 blocks to reduce RPC load)
        const lastMarketBlock = await getLastSyncedBlock('market');
        const marketFromBlock = Math.max(Number(lastMarketBlock) + 1, currentBlock - 50); // Reduced from 100 to 50
        
        if (currentBlock >= marketFromBlock) {
            await syncMarketEvents(marketFromBlock, currentBlock);
            await updateLastSyncedBlock('market', currentBlock);
        }
        
        //('Incremental synchronization completed!');
        
    } catch (error) {
        //('❌ Error during incremental sync:', error);
    }
}

// Auto-start sync scheduler
let syncInterval: NodeJS.Timeout | null = null;
let isServiceRunning = false;

// Start automatic sync service
export async function startSyncService(): Promise<void> {
    if (isServiceRunning) {
        //('⚠️ Sync service is already running');
        return;
    }
    
    //('🚀 Starting automatic sync service...');
    isServiceRunning = true;
    
    try {
        await performIncrementalSync(); 
        const syncIntervalMs = process.env.RAILWAY_ENVIRONMENT ? 5 * 60 * 1000 : 2 * 60 * 1000; // 5min on Railway, 2min locally
        syncInterval = setInterval(async () => {
            if (isServiceRunning) {
                try {
                    await performIncrementalSync();
                } catch (error) {
                    }
            }
        }, syncIntervalMs);
       
    } catch (error) {
         isServiceRunning = false;
        throw error;
    }
}


export async function stopSyncService(): Promise<void> {
    if (!isServiceRunning) {
         return;
    }
    
    isServiceRunning = false;
    
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
    }
    
    
}

// Get sync service status
export function getSyncServiceStatus(): { isRunning: boolean; intervalMs: number | null } {
    return {
        isRunning: isServiceRunning,
        intervalMs: syncInterval ? 30000 : null
    };
}


process.on('SIGINT', async () => {
     await stopSyncService();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await stopSyncService();
    process.exit(0);
});
