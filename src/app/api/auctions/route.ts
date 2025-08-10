import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET() {
  try {
    const client = await pool.connect()
    
    try {
      // First, update expired auctions to 'ended' status
      const currentTime = Math.floor(Date.now() / 1000)
      await client.query(`
        UPDATE auctions 
        SET status = 'ended' 
        WHERE status = 'active' AND end_time <= $1
      `, [currentTime])

      // Fetch all auctions with time calculations and reclaim_nft
      const result = await client.query(`
        SELECT 
          *,
          CASE 
            WHEN end_time <= $1 THEN true 
            ELSE false 
          END as is_ended,
          CASE 
            WHEN end_time <= $1 THEN 'Ended'
            ELSE CONCAT(
              CASE 
                WHEN (end_time - $1) >= 86400 THEN CONCAT(FLOOR((end_time - $1) / 86400), 'd ')
                ELSE ''
              END,
              CASE 
                WHEN (end_time - $1) >= 3600 THEN CONCAT(FLOOR(((end_time - $1) % 86400) / 3600), 'h ')
                ELSE ''
              END,
              CONCAT(FLOOR(((end_time - $1) % 3600) / 60), 'm')
            )
          END as time_left,
          CASE 
            WHEN reclaim_nft > 0 AND reclaim_nft > $1 THEN CONCAT(
              CASE 
                WHEN (reclaim_nft - $1) >= 86400 THEN CONCAT(FLOOR((reclaim_nft - $1) / 86400), 'd ')
                ELSE ''
              END,
              CASE 
                WHEN (reclaim_nft - $1) >= 3600 THEN CONCAT(FLOOR(((reclaim_nft - $1) % 86400) / 3600), 'h ')
                ELSE ''
              END,
              CONCAT(FLOOR(((reclaim_nft - $1) % 3600) / 60), 'm left to reclaim')
            )
            WHEN reclaim_nft > 0 AND reclaim_nft <= $1 THEN 'Reclaim period expired'
            ELSE NULL
          END as reclaim_time_left
        FROM auctions 
        ORDER BY 
          CASE status 
            WHEN 'active' THEN 1 
            WHEN 'ended' THEN 2 
            WHEN 'finalized' THEN 3 
            ELSE 4 
          END,
          end_time ASC
      `, [currentTime])

      return NextResponse.json({
        success: true,
        data: result.rows
      })

    } finally {
      client.release()
    }

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch auctions' },
      { status: 500 }
    )
  }
}