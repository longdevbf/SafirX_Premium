/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers } from 'ethers';
import * as SealedBidAuction from '../../contract/safirX_contract/artifacts/contracts/sealedBidAuction.sol/SealedBidAuction.json';
import { performFullSync, performIncrementalSync } from './syncService';
import axios from 'axios';
import {ABI_CONFIG} from '@/components/config/abi_config'
import { pool } from '../lib/db';

const auctionAddress = ABI_CONFIG.sealedBidAuction.address;
const provider = new ethers.WebSocketProvider('wss://testnet.sapphire.oasis.io/ws');
const auctionContract = new ethers.Contract(auctionAddress, SealedBidAuction.abi, provider);

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

async function saveToDatabase(data: any) {
    const client = await pool.connect();
    try {
        await client.query(
            `INSERT INTO auctions (
                auction_id, seller_address, nft_contract_address, auction_type, token_ids,
                starting_price, end_time, title, collection_name, image_url, description,
                nft_individual, status, nft_claimed, nft_reclaimed, total_bid
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
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
    } catch (error) {
        console.error('Lỗi khi lưu vào database:', error);
    } finally {
        client.release();
    }
}


async function updateAuctionStatusWithReclaim(auctionId: string, auctionType: string, status: string) {
    const client = await pool.connect();
    try {
        const currentTimestamp = Math.floor(Date.now() / 1000); 
        const reclaimTimestamp = currentTimestamp + (3 * 24 * 60 * 60); 
        
        await client.query(
            `UPDATE auctions SET status = $1, reclaim_nft = $2 WHERE auction_id = $3 AND auction_type = $4`,
            [status, reclaimTimestamp, auctionId, auctionType]
        );
        
        console.log(`✅ Cập nhật auction ${auctionId} (${auctionType}): status = ${status}, reclaim_nft = ${reclaimTimestamp} (${new Date(reclaimTimestamp * 1000).toISOString()})`);
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái và reclaim_nft:', error);
    } finally {
        client.release();
    }
}
async function updateClaimStatus(auctionId: string, auctionType: string, field: string, value: boolean) {
    const client = await pool.connect();
    try {
        await client.query(
            `UPDATE auctions SET ${field} = $1 WHERE auction_id = $2 AND auction_type = $3`,
            [value, auctionId, auctionType]
        );
    } catch (error) {
        console.error(`Lỗi khi cập nhật ${field}:`, error);
    } finally {
        client.release();
    }
}
async function incrementTotalBidWithAntiSniping(auctionId: string, auctionType: string) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Get current auction details
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
                
                console.log(`🕒 Anti-sniping: Auction ${auctionId} (${auctionType}) extended from ${auction.end_time} to ${newEndTime} (+${newEndTime - auction.end_time}s)`);
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
        console.error('Lỗi khi cập nhật total_bid với anti-sniping:', error);
    } finally {
        client.release();
    }
}

// Hàm xóa bản ghi
async function deleteFromDatabase(auctionId: string, auctionType: string) {
    const client = await pool.connect();
    try {
        await client.query(
            `DELETE FROM auctions WHERE auction_id = $1 AND auction_type = $2`,
            [auctionId, auctionType]
        );
    } catch (error) {
        console.error('Lỗi khi xóa khỏi database:', error);
    } finally {
        client.release();
    }
}

async function main() {
    console.log('🚀 Đang khởi động auction listener...');
    console.log('📡 Keep-alive server đã được khởi động để giữ process hoạt động');
    
    console.log('🔄 Performing initial data synchronization...');
    try {
        await performFullSync();
        console.log('✅ Initial sync completed successfully!');
    } catch (error) {
        console.error('❌ Initial sync failed:', error);
        console.log('⚠️ Continuing with real-time listening...');
    }
    
    console.log('🎯 Đang lắng nghe các sự kiện từ auction...');
    setInterval(async () => {
        try {
            console.log('🔄 Running incremental sync...');
            await performIncrementalSync();
        } catch (error) {
            console.error('❌ Incremental sync failed:', error);
        }
    }, 5 * 60 * 1000); 


    auctionContract.on('AuctionCreated', async (auctionId, seller, nftContract, auctionType, tokenId, tokenIds, startingPrice, endTime, title) => {
        const auctionIdStr = auctionId.toString();
        const tokenIdStr = tokenId.toString();
        const tokenIdsStr = tokenIds.map((id: { toString: () => any; }) => id.toString());
        const startingPriceStr = ethers.formatEther(startingPrice); 
        const endTimeNum = Number(endTime); 
        console.log('AuctionCreated:', { auctionIdStr, seller, nftContract, auctionType, tokenIdStr, tokenIdsStr, startingPriceStr, endTime: endTimeNum, title });
        const metadataPromises = tokenIdsStr.length > 0 ? tokenIdsStr.map((tokenId: string) => fetchNFTMetadata(nftContract, tokenId)) : [fetchNFTMetadata(nftContract, tokenIdStr)];
        const metadataResults = await Promise.all(metadataPromises);

        if (metadataResults.some(result => result === null)) {
            console.error('Lỗi khi fetch metadata cho một số NFT');
            return;
        }

        const representativeMetadata = metadataResults[0];
        const nftIndividual = tokenIdsStr.length > 0 ? tokenIdsStr.map((tokenId: string, index: number) => ({
            token_id: tokenId,
            metadata: metadataResults[index]
        })) : [{ token_id: tokenIdStr, metadata: representativeMetadata }];

        const data = {
            auction_id: auctionIdStr,
            seller_address: seller,
            nft_contract_address: nftContract,
            auction_type: Number(auctionType) === 0 ? 'single' : 'bundle',
            token_ids: tokenIdsStr.length > 0 ? tokenIdsStr : [tokenIdStr],
            starting_price: startingPriceStr,
            end_time: endTimeNum, 
            title: title || '',
            collection_name: representativeMetadata.token?.name || '',
            image_url: representativeMetadata.image || '',
            description: Number(auctionType) === 0 ? representativeMetadata.description || '' : `Bundle of ${tokenIdsStr.length} NFTs: ${metadataResults.map((m: any) => m.name).join(', ')}`,
            nft_individual: nftIndividual,
            status: 'active',
            nft_claimed: false,
            nft_reclaimed: false
        };

        await saveToDatabase(data);
    });


    auctionContract.on('BidPlaced', async (auctionId, bidder, timestamp) => {
        const auctionIdStr = auctionId.toString();
        const timestampNum = Number(timestamp); 
        console.log('BidPlaced:', { auctionIdStr, bidder, timestamp: timestampNum });
        await incrementTotalBidWithAntiSniping(auctionIdStr, 'single');
        await incrementTotalBidWithAntiSniping(auctionIdStr, 'bundle');
    });

    auctionContract.on('AuctionFinalized', async (auctionId, winner, finalPrice, platformFeeAmount, sellerAmount) => {
        const auctionIdStr = auctionId.toString();
        const finalPriceStr = ethers.formatEther(finalPrice); 
        console.log('AuctionFinalized:', { 
            auctionIdStr, 
            winner, 
            finalPriceStr, 
            platformFeeAmount: ethers.formatEther(platformFeeAmount), 
            sellerAmount: ethers.formatEther(sellerAmount) 
        });
        await updateAuctionStatusWithReclaim(auctionIdStr, 'single', 'finalized');
        await updateAuctionStatusWithReclaim(auctionIdStr, 'bundle', 'finalized');
    });

    // Sự kiện AuctionCancelled
    auctionContract.on('AuctionCancelled', async (auctionId, seller, reason) => {
        const auctionIdStr = auctionId.toString();
        console.log('AuctionCancelled:', { auctionIdStr, seller, reason });

        await deleteFromDatabase(auctionIdStr, 'single');
        await deleteFromDatabase(auctionIdStr, 'bundle');
    });

    // Sự kiện NFTClaimed
    auctionContract.on('NFTClaimed', async (auctionId, winner, amountPaid) => {
        const auctionIdStr = auctionId.toString();
        const amountPaidStr = ethers.formatEther(amountPaid); 
        console.log('NFTClaimed:', { auctionIdStr, winner, amountPaidStr });

        await updateClaimStatus(auctionIdStr, 'single', 'nft_claimed', true);
        await updateClaimStatus(auctionIdStr, 'bundle', 'nft_claimed', true);
    });

    // Sự kiện NFTReclaimed
    auctionContract.on('NFTReclaimed', async (auctionId, seller) => {
        const auctionIdStr = auctionId.toString();
        console.log('NFTReclaimed:', { auctionIdStr, seller });

        await updateClaimStatus(auctionIdStr, 'single', 'nft_reclaimed', true);
        await updateClaimStatus(auctionIdStr, 'bundle', 'nft_reclaimed', true);
    });

    console.log('Auction listener setup completed - listening for events...');
    
    // Keep process alive gracefully
    process.on('SIGTERM', () => {
        console.log(' Auction listener received SIGTERM, shutting down...');
        process.exit(0);
    });
    
    process.on('SIGINT', () => {
        console.log('Auction listener received SIGINT, shutting down...');
        process.exit(0);
    });
}

main().catch(console.error);