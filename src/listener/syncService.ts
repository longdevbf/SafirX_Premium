/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers } from 'ethers';
import { pool } from '../lib/db';
import * as SealedBidAuction from '../../contract/safirX_contract/artifacts/contracts/sealedBidAuction.sol/SealedBidAuction.json';
import * as NFTMarketPlace from '../../contract/safirX_contract/artifacts/contracts/marketPlace.sol/NFTMarket.json';
import axios from 'axios';
import {ABI_CONFIG} from '@/components/config/abi_config'
const AUCTION_ADDRESS = ABI_CONFIG.sealedBidAuction.address;
const MARKET_ADDRESS = ABI_CONFIG.marketPlace.address;
const provider = new ethers.JsonRpcProvider('https://testnet.sapphire.oasis.io');
const auctionContract = new ethers.Contract(AUCTION_ADDRESS, SealedBidAuction.abi, provider);
const marketContract = new ethers.Contract(MARKET_ADDRESS, NFTMarketPlace.abi, provider);
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
    
    // Split large block ranges to avoid RPC limits (max 50 blocks per query for safety)
    const MAX_BLOCKS_PER_QUERY = 50; // Reduced from 90 to 50 for RPC stability
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

// Anti-sniping function with improved logic matching auctionListener
async function handleAntiSniping(auctionId: string): Promise<void> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Get current auction details for both single and bundle types
        const auctionResult = await client.query(
            `SELECT end_time, auction_type FROM auctions WHERE auction_id = $1 AND status = 'active'`,
            [auctionId]
        );
        
        for (const auction of auctionResult.rows) {
            const currentTime = Math.floor(Date.now() / 1000);
            const timeUntilEnd = auction.end_time - currentTime;
            const TEN_MINUTES = 10 * 60; // 10 minutes in seconds
            
            // Anti-sniping: Extend auction if bid placed in last 10 minutes
            if (timeUntilEnd > 0 && timeUntilEnd <= TEN_MINUTES) {
                const newEndTime = currentTime + TEN_MINUTES;
                
                await client.query(
                    `UPDATE auctions 
                     SET total_bid = total_bid + 1, end_time = $1, updated_at = NOW()
                     WHERE auction_id = $2 AND auction_type = $3`,
                    [newEndTime, auctionId, auction.auction_type]
                );
                
                console.log(`� Anti-sniping: Auction ${auctionId} (${auction.auction_type}) extended from ${auction.end_time} to ${newEndTime} (+${newEndTime - auction.end_time}s)`);
            } else {
                // Normal increment without extension
                await client.query(
                    `UPDATE auctions SET total_bid = total_bid + 1 WHERE auction_id = $1 AND auction_type = $2`,
                    [auctionId, auction.auction_type]
                );
            }
        }
        
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in anti-sniping logic:', error);
    } finally {
        client.release();
    }
}

// Sync bid events from auction contracts
async function syncBidEvents(fromBlock: number, toBlock: number): Promise<void> {
    console.log(`🔄 Syncing bid events from block ${fromBlock} to ${toBlock}...`);
    
    try {
        // Get BidPlaced events from auction contract
        const bidPlacedFilter = auctionContract.filters.BidPlaced();
        const bidPlacedEvents = await auctionContract.queryFilter(bidPlacedFilter, fromBlock, toBlock);
        
        for (const event of bidPlacedEvents) {
            const eventLog = event as ethers.EventLog;
            const args = eventLog.args;
            if (!args) continue;
            
            const auctionId = args[0].toString();
            const bidder = args[1];
            const timestamp = Number(args[2]);
            
            console.log(`💰 Processing bid: Auction ${auctionId}, Bidder: ${bidder}, Timestamp: ${timestamp}`);
            
            // Apply anti-sniping logic
            await handleAntiSniping(auctionId);
            
            // Increment total_bid for both auction types
            try {
                await pool.query(
                    'UPDATE auctions SET total_bid = total_bid + 1 WHERE auction_id = $1',
                    [auctionId]
                );
                
                console.log(`✅ Incremented total_bid for auction ${auctionId}`);
            } catch (error) {
                console.error(`❌ Error incrementing total_bid for auction ${auctionId}:`, error);
            }
        }
        
        console.log(`✅ Synced ${bidPlacedEvents.length} bid events`);
        
    } catch (error) {
        console.error('❌ Error syncing bid events:', error);
        throw error;
    }
}

// Update auction status with reclaim timestamp
async function updateAuctionStatusWithReclaim(auctionId: string, auctionType: string, status: string): Promise<void> {
    const client = await pool.connect();
    try {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const reclaimTimestamp = currentTimestamp + (3 * 24 * 60 * 60); // +3 days
        
        await client.query(
            `UPDATE auctions SET status = $1, reclaim_nft = $2 WHERE auction_id = $3 AND auction_type = $4`,
            [status, reclaimTimestamp, auctionId, auctionType]
        );
        
        console.log(`✅ Updated auction ${auctionId} (${auctionType}): status = ${status}, reclaim_nft = ${reclaimTimestamp}`);
    } catch (error) {
        console.error('Error updating auction status with reclaim:', error);
    } finally {
        client.release();
    }
}

// Update claim status
async function updateClaimStatus(auctionId: string, auctionType: string, field: string, value: boolean): Promise<void> {
    const client = await pool.connect();
    try {
        await client.query(
            `UPDATE auctions SET ${field} = $1 WHERE auction_id = $2 AND auction_type = $3`,
            [value, auctionId, auctionType]
        );
        console.log(`✅ Updated ${field} = ${value} for auction ${auctionId} (${auctionType})`);
    } catch (error) {
        console.error(`Error updating ${field}:`, error);
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
        console.log(`✅ Deleted auction ${auctionId} (${auctionType})`);
    } catch (error) {
        console.error('Error deleting auction:', error);
    } finally {
        client.release();
    }
}

// Helper function to sync a chunk of auction events
async function syncAuctionEventsChunk(fromBlock: number, toBlock: number): Promise<void> {
    console.log(`  📦 Processing auction chunk: blocks ${fromBlock} to ${toBlock}`);
    
    try {
        // 1. Sync AuctionCreated events
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
        
        // 2. Sync AuctionFinalized events
        const auctionFinalizedFilter = auctionContract.filters.AuctionFinalized();
        const auctionFinalizedEvents = await auctionContract.queryFilter(auctionFinalizedFilter, fromBlock, toBlock);
        
        for (const event of auctionFinalizedEvents) {
            const eventLog = event as ethers.EventLog;
            const args = eventLog.args;
            if (!args) continue;
            
            const auctionId = args[0].toString();
            console.log(`📋 Processing AuctionFinalized: ${auctionId}`);
            
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
            console.log(`🚫 Processing AuctionCancelled: ${auctionId}`);
            
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
            console.log(`🎁 Processing NFTClaimed: ${auctionId}`);
            
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
            console.log(`🔄 Processing NFTReclaimed: ${auctionId}`);
            
            await updateClaimStatus(auctionId, 'single', 'nft_reclaimed', true);
            await updateClaimStatus(auctionId, 'bundle', 'nft_reclaimed', true);
        }
        
        console.log(`  ✅ Synced ${auctionCreatedEvents.length} created, ${auctionFinalizedEvents.length} finalized, ${auctionCancelledEvents.length} cancelled, ${nftClaimedEvents.length} claimed, ${nftReclaimedEvents.length} reclaimed`);
        
    } catch (error) {
        console.error('  ❌ Error syncing auction chunk:', error);
        throw error;
    }
}

// Sync market events from a specific block range
export async function syncMarketEvents(fromBlock: number, toBlock: number): Promise<void> {
    console.log(`🔄 Syncing market events from block ${fromBlock} to ${toBlock}...`);
    
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
        console.log(`✅ Updated price for listing ${listingId} (${listingType}): ${newPrice}`);
    } catch (error) {
        console.error('Error updating listing price:', error);
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
        console.log(`✅ Deleted listing ${listingId} (${listingType})`);
    } catch (error) {
        console.error('Error deleting listing:', error);
    } finally {
        client.release();
    }
}

// Helper function to sync a chunk of market events
async function syncMarketEventsChunk(fromBlock: number, toBlock: number): Promise<void> {
    console.log(`  📦 Processing market chunk: blocks ${fromBlock} to ${toBlock}`);
    
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
                console.log(`⏭️ Listing ${listingId} (${listingType}) already exists, skipping...`);
                continue;
            }
            
            const nftContract = args[1];
            const tokenId = args[2].toString();
            const seller = args[3];
            const price = ethers.formatEther(args[4]);
            
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
        
        // 2. Sync CollectionBundleListed events
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
                console.log(`⏭️ Bundle ${collectionId} (${listingType}) already exists, skipping...`);
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
        
        // 3. Sync PriceUpdated events
        const priceUpdatedFilter = marketContract.filters.PriceUpdated();
        const priceUpdatedEvents = await marketContract.queryFilter(priceUpdatedFilter, fromBlock, toBlock);
        
        for (const event of priceUpdatedEvents) {
            const eventLog = event as ethers.EventLog;
            const args = eventLog.args;
            if (!args) continue;
            
            const listingId = args[0].toString();
            const newPrice = ethers.formatEther(args[2]);
            console.log(`💰 Processing PriceUpdated: ${listingId}`);
            
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
            console.log(`💰 Processing BundlePriceUpdated: ${collectionId}`);
            
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
            console.log(`🚫 Processing ListingCancelled: ${listingId}`);
            
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
            console.log(`🚫 Processing CollectionCancelled: ${collectionId}`);
            
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
            console.log(`💸 Processing NFTSold: ${listingId}`);
            
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
            console.log(`💸 Processing CollectionBundleSold: ${collectionId}`);
            
            await deleteListingFromDB(collectionId, 'bundle');
        }
        
        console.log(`  ✅ Synced ${nftListedEvents.length} single + ${bundleListedEvents.length} bundle listings, ${priceUpdatedEvents.length + bundlePriceUpdatedEvents.length} price updates, ${listingCancelledEvents.length + collectionCancelledEvents.length} cancellations, ${nftSoldEvents.length + collectionBundleSoldEvents.length} sales`);
        
    } catch (error) {
        console.error('  ❌ Error syncing market chunk:', error);
        throw error;
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
            const maxBlockRange = 1000; // Reduced from 10000 to 1000 for RPC stability
            for (let fromBlock = Number(lastAuctionBlock) + 1; fromBlock <= currentBlock; fromBlock += maxBlockRange) {
                const toBlock = Math.min(fromBlock + maxBlockRange - 1, currentBlock);
                await syncAuctionEvents(fromBlock, toBlock);
                await syncBidEvents(fromBlock, toBlock); // Also sync bid events
                await updateLastSyncedBlock('auction', toBlock);
                
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 200)); // Increased delay
            }
        }
        
        // Sync market events
        const lastMarketBlock = await getLastSyncedBlock('market');
        console.log(`Last synced market block: ${lastMarketBlock}`);
        
        if (currentBlock > lastMarketBlock) {
            const maxBlockRange = 1000; // Reduced from 10000 to 1000 for RPC stability
            for (let fromBlock = Number(lastMarketBlock) + 1; fromBlock <= currentBlock; fromBlock += maxBlockRange) {
                const toBlock = Math.min(fromBlock + maxBlockRange - 1, currentBlock);
                await syncMarketEvents(fromBlock, toBlock);
                await updateLastSyncedBlock('market', toBlock);
                
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 200)); // Increased delay
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
        
        // Sync recent auction events (last 50 blocks to reduce RPC load)
        const lastAuctionBlock = await getLastSyncedBlock('auction');
        const auctionFromBlock = Math.max(Number(lastAuctionBlock) + 1, currentBlock - 50); // Reduced from 100 to 50
        
        if (currentBlock >= auctionFromBlock) {
            await syncAuctionEvents(auctionFromBlock, currentBlock);
            await syncBidEvents(auctionFromBlock, currentBlock); // Also sync bid events
            await updateLastSyncedBlock('auction', currentBlock);
        }
        
        // Sync recent market events (last 50 blocks to reduce RPC load)
        const lastMarketBlock = await getLastSyncedBlock('market');
        const marketFromBlock = Math.max(Number(lastMarketBlock) + 1, currentBlock - 50); // Reduced from 100 to 50
        
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
        await performIncrementalSync(); // Use incremental instead of full sync for faster startup
        
        // Set up incremental sync with Railway-optimized interval
        const syncIntervalMs = process.env.RAILWAY_ENVIRONMENT ? 5 * 60 * 1000 : 2 * 60 * 1000; // 5min on Railway, 2min locally
        syncInterval = setInterval(async () => {
            if (isServiceRunning) {
                try {
                    await performIncrementalSync();
                } catch (error) {
                    console.error('❌ Error in scheduled sync:', error);
                }
            }
        }, syncIntervalMs);
        
        console.log(`✅ Sync service started with ${syncIntervalMs/1000/60}-minute intervals`);
        
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
