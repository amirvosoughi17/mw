// app/api/raw-markets/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { fetchRawPolymarketPage } from '@/lib/polymarket'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const offset = parseInt(searchParams.get('offset') || '0', 10)
  const limit = parseInt(searchParams.get('limit') || '500', 10)

  try {
    const rawData = await fetchRawPolymarketPage(offset, limit)
    return NextResponse.json({ rawMarkets: rawData, hasMore: rawData.length === limit })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch raw markets' }, { status: 500 })
  }
}