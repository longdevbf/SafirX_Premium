import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

// Types for better type safety
interface NFTMetadata {
  id?: string
  name?: string
  image?: string
  description?: string
  attributes?: Array<{
    trait_type: string
    value: string | number
  }>
  external_url?: string
}

interface NFTToken {
  name?: string
  type?: string
  symbol?: string
  decimals?: number
  is_verified?: boolean
  num_holders?: number
  total_supply?: string
  contract_addr?: string
  num_transfers?: number
  eth_contract_addr?: string
  verification_level?: string
}

interface NFTIndividual {
  token_id: string
  metadata?: {
    metadata?: NFTMetadata
    token?: NFTToken
    owner?: string
    owner_eth?: string
    description?: string
    metadata_uri?: string
    num_transfers?: number
    metadata_accessed?: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let client
  try {
    const { id } = await params
    const auctionId = parseInt(id)

    if (isNaN(auctionId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid auction ID'
      }, { status: 400 })
    }

    client = await pool.connect()

    // Lấy dữ liệu từ bảng auctions
    const auctionQuery = `
      SELECT * FROM auctions
      WHERE auction_id = $1
    `
    const auctionResult = await client.query(auctionQuery, [auctionId])

    if (auctionResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Auction not found'
      }, { status: 404 })
    }

    const auction = auctionResult.rows[0]

    // Auto-update status if needed
    const now = Math.floor(Date.now() / 1000)
    if (auction.status === 'active' && auction.end_time <= now) {
      try {
        const updateStatusQuery = `
          UPDATE auctions 
          SET status = 'ended', updated_at = NOW()
          WHERE auction_id = $1
        `
        await client.query(updateStatusQuery, [auctionId])
        auction.status = 'ended'
      } catch (updateError) {
        //('Status update error (non-critical):', updateError)
      }
    }

    // Parse và enhance NFT data từ nft_individual JSONB
    let enhancedNFTData = []
    if (auction.nft_individual && Array.isArray(auction.nft_individual)) {
      enhancedNFTData = auction.nft_individual.map((nft: NFTIndividual) => {
        const metadata = nft.metadata?.metadata || {}
        const tokenInfo = nft.metadata?.token || {}
        
        return {
          token_id: nft.token_id,
          name: metadata.name || `NFT #${nft.token_id}`,
          image: metadata.image || auction.image_url,
          description: metadata.description || nft.metadata?.description || auction.description,
          
          // Contract information
          contract: {
            address: tokenInfo.contract_addr || auction.nft_contract_address,
            eth_address: tokenInfo.eth_contract_addr,
            name: tokenInfo.name,
            symbol: tokenInfo.symbol,
            type: tokenInfo.type,
            total_supply: tokenInfo.total_supply,
            is_verified: tokenInfo.is_verified,
            verification_level: tokenInfo.verification_level
          },
          
          // Owner information
          owner: {
            oasis_address: nft.metadata?.owner,
            eth_address: nft.metadata?.owner_eth
          },
          
          // Creator information (từ attributes)
          creator: metadata.attributes?.find(attr => attr.trait_type === 'Creator')?.value,
          created_date: metadata.attributes?.find(attr => attr.trait_type === 'Created Date')?.value,
          edition: metadata.attributes?.find(attr => attr.trait_type === 'Edition')?.value,
          
          // Metadata details
          attributes: metadata.attributes || [],
          external_url: metadata.external_url,
          metadata_uri: nft.metadata?.metadata_uri,
          
          // Transfer stats
          num_transfers: nft.metadata?.num_transfers || tokenInfo.num_transfers,
          metadata_accessed: nft.metadata?.metadata_accessed,
          
          // Collection info
          collection: metadata.attributes?.find(attr => attr.trait_type === 'Collection')?.value || auction.collection_name
        }
      })
    }

    // Prepare enhanced response
    const response = {
      // Basic auction info
      ...auction,
      
      // Ensure token_ids is always an array
      token_ids: Array.isArray(auction.token_ids) ? auction.token_ids : [auction.token_ids].filter(Boolean),
      
      // Enhanced NFT data
      nft_individual: enhancedNFTData,
      
      // Additional computed fields
      nft_count: enhancedNFTData.length || (auction.token_ids ? auction.token_ids.length : 0),
      
      // Seller information
      seller: {
        address: auction.seller_address,
        is_verified: false // Có thể mở rộng sau
      },
      
      // Auction timeline
      timeline: {
        created_at: auction.created_at,
        end_time: auction.end_time,
        is_ended: now >= auction.end_time,
        time_left_seconds: Math.max(0, auction.end_time - now)
      },
      
      // Contract information (from first NFT or auction data)
      contract_info: enhancedNFTData.length > 0 ? enhancedNFTData[0].contract : {
        address: auction.nft_contract_address,
        eth_address: null,
        name: auction.collection_name,
        symbol: null,
        type: 'ERC721',
        is_verified: false
      }
    }

    return NextResponse.json({
      success: true,
      data: response
    })

  } catch (error) {
   // //('❌ Error fetching auction details:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch auction details',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  } finally {
    if (client) {
      client.release()
    }
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let client
  try {
    const { id } = await params
    const auctionId = parseInt(id)
    const body = await request.json()
    
    if (isNaN(auctionId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid auction ID' 
      }, { status: 400 })
    }

    client = await pool.connect()
    
    const { status, nft_claimed, nft_reclaimed, total_bid } = body
    
    // Build dynamic update query
    const updateFields = []
    const values = [auctionId]
    let paramIndex = 2

    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex}`)
      values.push(status)
      paramIndex++
    }

    if (nft_claimed !== undefined) {
      updateFields.push(`nft_claimed = $${paramIndex}`)
      values.push(nft_claimed)
      paramIndex++
    }

    if (nft_reclaimed !== undefined) {
      updateFields.push(`nft_reclaimed = $${paramIndex}`)
      values.push(nft_reclaimed)
      paramIndex++
    }

    if (total_bid !== undefined) {
      updateFields.push(`total_bid = $${paramIndex}`)
      values.push(total_bid)
      paramIndex++
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No fields to update' 
      }, { status: 400 })
    }

    const updateQuery = `
      UPDATE auctions 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE auction_id = $1
      RETURNING *
    `
    
    const result = await client.query(updateQuery, values)
    
    if (result.rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Auction not found' 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Auction updated successfully'
    })

  } catch (error) {
    ////('❌ Error updating auction:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update auction',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  } finally {
    if (client) {
      client.release()
    }
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let client
  try {
    const { id } = await params
    const auctionId = parseInt(id)
    
    if (isNaN(auctionId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid auction ID' 
      }, { status: 400 })
    }

    client = await pool.connect()
    
    // Check if auction exists and can be canceled
    const checkQuery = `
      SELECT status, seller_address 
      FROM auctions 
      WHERE auction_id = $1
    `
    
    const checkResult = await client.query(checkQuery, [auctionId])
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Auction not found' 
      }, { status: 404 })
    }

    const auction = checkResult.rows[0]
    
    if (auction.status !== 'active') {
      return NextResponse.json({ 
        success: false, 
        error: 'Only active auctions can be canceled' 
      }, { status: 400 })
    }

    // Update status to canceled
    const cancelQuery = `
      UPDATE auctions 
      SET status = 'cancelled', updated_at = NOW()
      WHERE auction_id = $1
      RETURNING *
    `
    
    const result = await client.query(cancelQuery, [auctionId])

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Auction canceled successfully'
    })

  } catch (error) {
//    //('❌ Error canceling auction:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to cancel auction',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  } finally {
    if (client) {
      client.release()
    }
  }
}