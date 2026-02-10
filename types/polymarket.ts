// types/polymarket.ts
export interface PolymarketMarket {
  id: string;
  question: string;
  slug: string;
  outcomes: string[];
  outcomePrices: number[];
  volume: number;
  active: boolean;
  category: string;  // slug مثل us-current-affairs یا crypto
}