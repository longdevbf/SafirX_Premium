import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function POST(request: NextRequest) {
  let client
  try {
    client = await pool.connect()
    
    const currentTime = Math.floor(Date.now() / 1000)
    
    // Update all expired auctions
    const result = await client.query(`
      UPDATE auctions 
      SET status = 'ended'
      WHERE status = 'active' AND end_time <= $1
      RETURNING auction_id, title
    `, [currentTime])

    return NextResponse.json({
      success: true,
      message: `Updated ${result.rows.length} expired auctions`,
      updated_auctions: result.rows
    })

  } catch (error) {
  //  //('❌ Error updating expired auctions:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update expired auctions'
    }, { status: 500 })
  } finally {
    if (client) {
      client.release()
    }
  }
}