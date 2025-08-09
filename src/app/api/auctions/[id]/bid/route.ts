import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function POST(
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

    const body = await request.json()
    const { bidder_address, bid_amount, auction_type = 'single' } = body

    if (!bidder_address || !bid_amount) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: bidder_address, bid_amount'
      }, { status: 400 })
    }

    client = await pool.connect()
    
    try {
      // Start transaction
      await client.query('BEGIN')

      // Get current auction details
      const auctionResult = await client.query(
        `SELECT * FROM auctions WHERE auction_id = $1 AND auction_type = $2`,
        [auctionId, auction_type]
      )

      if (auctionResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({
          success: false,
          error: 'Auction not found'
        }, { status: 404 })
      }

      const auction = auctionResult.rows[0]

      // Check if auction is still active
      if (auction.status !== 'active') {
        await client.query('ROLLBACK')
        return NextResponse.json({
          success: false,
          error: 'Auction is not active'
        }, { status: 400 })
      }

      const currentTime = Math.floor(Date.now() / 1000)

      // Check if auction has ended
      if (auction.end_time <= currentTime) {
        await client.query('ROLLBACK')
        return NextResponse.json({
          success: false,
          error: 'Auction has already ended'
        }, { status: 400 })
      }

      // 🎯 ANTI-SNIPING LOGIC: Check if bid is placed in last 10 minutes
      const TEN_MINUTES = 10 * 60 // 10 minutes in seconds
      const timeUntilEnd = auction.end_time - currentTime
      let newEndTime = auction.end_time

      if (timeUntilEnd <= TEN_MINUTES) {
        // Extend auction by 10 minutes
        newEndTime = currentTime + TEN_MINUTES
        
        console.log(`🕒 Anti-sniping activated for auction ${auctionId}:`)
        console.log(`   - Original end time: ${auction.end_time}`)
        console.log(`   - Time left: ${timeUntilEnd} seconds`)
        console.log(`   - New end time: ${newEndTime}`)
        console.log(`   - Extended by: ${newEndTime - auction.end_time} seconds`)
      }

      // Update auction with incremented total_bid and potentially new end_time
      const updateQuery = newEndTime !== auction.end_time 
        ? `UPDATE auctions 
           SET total_bid = total_bid + 1, end_time = $1, updated_at = NOW()
           WHERE auction_id = $2 AND auction_type = $3
           RETURNING *`
        : `UPDATE auctions 
           SET total_bid = total_bid + 1, updated_at = NOW()
           WHERE auction_id = $1 AND auction_type = $2
           RETURNING *`

      const updateParams = newEndTime !== auction.end_time 
        ? [newEndTime, auctionId, auction_type]
        : [auctionId, auction_type]

      const updateResult = await client.query(updateQuery, updateParams)

      // Commit transaction
      await client.query('COMMIT')

      const updatedAuction = updateResult.rows[0]
      const wasExtended = newEndTime !== auction.end_time

      return NextResponse.json({
        success: true,
        message: wasExtended 
          ? `Bid placed successfully! Auction extended by 10 minutes due to anti-sniping protection.`
          : 'Bid placed successfully!',
        data: {
          auction_id: auctionId,
          auction_type: auction_type,
          total_bid: updatedAuction.total_bid,
          end_time: updatedAuction.end_time,
          original_end_time: auction.end_time,
          extended: wasExtended,
          extension_seconds: wasExtended ? newEndTime - auction.end_time : 0,
          bidder_address,
          bid_amount,
          timestamp: currentTime
        }
      })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    }

  } catch (error) {
    console.error('❌ Error processing bid:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process bid',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  } finally {
    if (client) {
      client.release()
    }
  }
}
