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

    client = await pool.connect()
    
    try {
      // Start transaction
      await client.query('BEGIN')

      // First, auto-update expired auctions globally
      const currentTime = Math.floor(Date.now() / 1000)
      await client.query(`
        UPDATE auctions 
        SET status = 'ended', updated_at = NOW()
        WHERE status = 'active' AND end_time <= $1
      `, [currentTime])

      // Check if auction exists and is ended
      const auctionResult = await client.query(`
        SELECT * FROM auctions 
        WHERE auction_id = $1
      `, [auctionId])

      if (auctionResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json(
          { success: false, error: 'Auction not found' },
          { status: 404 }
        )
      }

      const auction = auctionResult.rows[0]

      // Check if auction is ended (should be after auto-update)
      if (auction.status !== 'ended') {
        await client.query('ROLLBACK')
        return NextResponse.json(
          { success: false, error: 'Auction is not ended yet or already finalized' },
          { status: 400 }
        )
      }

      // Update auction status to finalized
      await client.query(`
        UPDATE auctions 
        SET status = 'finalized', updated_at = NOW()
        WHERE auction_id = $1
      `, [auctionId])

      // Commit transaction
      await client.query('COMMIT')

      return NextResponse.json({
        success: true,
        message: 'Auction finalized successfully'
      })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    }

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to finalize auction' },
      { status: 500 }
    )
  } finally {
    if (client) {
      client.release()
    }
  }
}