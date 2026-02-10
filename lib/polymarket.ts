// lib/polymarket.ts
import { PolymarketMarket } from "@/types/polymarket"

export async function fetchRawPolymarketPage(offset: number, limit: number = 500): Promise<any[]> {
  const BASE_URL = `https://gamma-api.polymarket.com/markets?closed=false&limit=${limit}&order=volume&ascending=false&volume_num_min=500&offset=${offset}`

  const res = await fetch(BASE_URL)

  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.statusText}`)
  }

  return await res.json()
}