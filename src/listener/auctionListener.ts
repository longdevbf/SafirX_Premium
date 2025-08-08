/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers } from 'ethers';
import * as SealedBidAuction from '../../contract/safirX_contract/artifacts/contracts/sealedBidAuction.sol/SealedBidAuction.json';
import axios from 'axios';
import { server } from './keepAlive';

// Địa chỉ contract
const auctionAddress = '0xC6b5b863FaaEf7fb0e41889D237a910EA81D15E9';

// Kết nối với Oasis Sapphire Testnet qua WebSocket
const provider = new ethers.WebSocketProvider('wss://testnet.sapphire.oasis.io/ws');
const auctionContract = new ethers.Contract(auctionAddress, SealedBidAuction.abi, provider);

// Kết nối database từ file db.ts
import { pool } from '../lib/db';

// Hàm fetch metadata NFT
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

// Hàm lưu thông tin vào database
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
                0 // Khởi tạo total_bid là 0
            ]
        );
    } catch (error) {
        console.error('Lỗi khi lưu vào database:', error);
    } finally {
        client.release();
    }
}



// Hàm cập nhật trạng thái đấu giá và reclaim_nft - THÊM MỚI
async function updateAuctionStatusWithReclaim(auctionId: string, auctionType: string, status: string) {
    const client = await pool.connect();
    try {
        // Tính timestamp hiện tại + 3 ngày (3 * 24 * 60 * 60 = 259200 giây)
        const currentTimestamp = Math.floor(Date.now() / 1000); // Timestamp hiện tại
        const reclaimTimestamp = currentTimestamp + (3 * 24 * 60 * 60); // Cộng thêm 3 ngày
        
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

// Hàm cập nhật trạng thái claim/reclaim
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

// Hàm cập nhật total_bid
async function incrementTotalBid(auctionId: string, auctionType: string) {
    const client = await pool.connect();
    try {
        await client.query(
            `UPDATE auctions SET total_bid = total_bid + 1 WHERE auction_id = $1 AND auction_type = $2`,
            [auctionId, auctionType]
        );
    } catch (error) {
        console.error('Lỗi khi cập nhật total_bid:', error);
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
    console.log('🎯 Đang lắng nghe các sự kiện từ auction...');

    // Sự kiện AuctionCreated
    auctionContract.on('AuctionCreated', async (auctionId, seller, nftContract, auctionType, tokenId, tokenIds, startingPrice, endTime, title) => {
        const auctionIdStr = auctionId.toString();
        const tokenIdStr = tokenId.toString();
        const tokenIdsStr = tokenIds.map((id: { toString: () => any; }) => id.toString());
        const startingPriceStr = ethers.formatEther(startingPrice); // Convert wei to Ether
        const endTimeNum = Number(endTime); // Convert BigInt to number
        console.log('AuctionCreated:', { auctionIdStr, seller, nftContract, auctionType, tokenIdStr, tokenIdsStr, startingPriceStr, endTime: endTimeNum, title });

        // Fetch metadata
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
            auction_type: Number(auctionType) === 0 ? 'single' : 'bundle', // Convert BigInt to number
            token_ids: tokenIdsStr.length > 0 ? tokenIdsStr : [tokenIdStr],
            starting_price: startingPriceStr,
            end_time: endTimeNum, // Store as Unix timestamp
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

    // Sự kiện BidPlaced
    auctionContract.on('BidPlaced', async (auctionId, bidder, amount, timestamp) => {
        const auctionIdStr = auctionId.toString();
        const amountStr = ethers.formatEther(amount); // Convert wei to Ether
        const timestampNum = Number(timestamp); // Convert BigInt to number
        console.log('BidPlaced:', { auctionIdStr, bidder, amountStr, timestamp: timestampNum });

        // Cập nhật total_bid cho cả single và bundle
        await incrementTotalBid(auctionIdStr, 'single');
        await incrementTotalBid(auctionIdStr, 'bundle');
    });

    // Sự kiện AuctionFinalized - CẬP NHẬT
    auctionContract.on('AuctionFinalized', async (auctionId, winner, finalPrice, platformFeeAmount, sellerAmount) => {
        const auctionIdStr = auctionId.toString();
        const finalPriceStr = ethers.formatEther(finalPrice); // Convert wei to Ether
        console.log('AuctionFinalized:', { 
            auctionIdStr, 
            winner, 
            finalPriceStr, 
            platformFeeAmount: ethers.formatEther(platformFeeAmount), 
            sellerAmount: ethers.formatEther(sellerAmount) 
        });

        // Sử dụng hàm mới để cập nhật cả status và reclaim_nft
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
        const amountPaidStr = ethers.formatEther(amountPaid); // Convert wei to Ether
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

    
    await new Promise(() => {});
}

main().catch(console.error);