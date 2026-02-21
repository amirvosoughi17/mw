"use client";

import { useEffect, useState, useMemo } from "react";

import {
  categoryKeywords,
} from "@/constants/categories";
import { MarketFilter } from "@/components/Filters/MarketFilter";
import { ListItems } from "@/components/Item/ListItems";
import { PolymarketMarket } from "@/types/polymarket";

export default function HomePage() {
  const [rawMarkets, setRawMarkets] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [seenIds] = useState<Set<string>>(new Set());

  const limit = 100;
  const maxRawToFetch = 6000;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [minYesProb, setMinYesProb] = useState(2);
  const [maxYesProb, setMaxYesProb] = useState(98);
  const [sortKey, setSortKey] = useState<"volume" | "daysLeft" | null>(null);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    loadMoreRaw();
  }, []);

  const loadMoreRaw = async () => {
    if (!hasMore || rawMarkets.length >= maxRawToFetch) {
      setHasMore(false);
      return;
    }

    try {
      const categoryParam = selectedCategory === "all" ? "" : selectedCategory;
      const res = await fetch(
        `/api/raw-markets?offset=${offset}&limit=${limit}&minYes=${minYesProb}&maxYes=${maxYesProb}&category=${categoryParam}`
      );

      if (!res.ok) throw new Error("Fetch failed");

      const { rawMarkets: newRaw, hasMore: newHasMore } = await res.json();

      const uniqueNew = newRaw.filter((m: any) => !seenIds.has(m.id));

      if (uniqueNew.length > 0) {
        setRawMarkets((prev) => [...prev, ...uniqueNew]);
        uniqueNew.forEach((m: any) => seenIds.add(m.id));
      }

      setHasMore(newHasMore && rawMarkets.length + uniqueNew.length < maxRawToFetch);
      setOffset((prev) => prev + limit);
    } catch (err) {
      console.error(err);
      setHasMore(false);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const filteredMarkets = useMemo(() => {
    let markets = rawMarkets
      .map((market: any) => {
        let outcomePrices: number[] = [];
        let outcomes: string[] = [];
        try {
          outcomePrices = JSON.parse(market.outcomePrices || "[]").map((p: string) => parseFloat(p)).filter((p: number) => !isNaN(p));
        } catch { }
        try {
          outcomes = JSON.parse(market.outcomes || "[]").map((o: string) => o.trim());
        } catch { }

        const q = (market.question || "").toLowerCase();
        let cat = "other";
        for (const [key, keywords] of Object.entries(categoryKeywords)) {
          if (keywords.some((kw) => q.includes(kw))) {
            cat = key;
            break;
          }
        }

        let daysLeft = 0;
        let hoursLeft = 0;
        if (market.endDateIso) {
          const endTime = new Date(market.endDateIso).getTime();
          const now = Date.now();
          const diffMs = Math.max(0, endTime - now);
          daysLeft = Math.floor(diffMs / 86400000);
          hoursLeft = Math.floor((diffMs % 86400000) / 3600000);
        }

        return {
          ...market,
          outcomes,
          outcomePrices,
          category: cat,
          daysLeft,
          hoursLeft,
          image: market.image || market.icon || "",
        } as PolymarketMarket & { daysLeft: number; hoursLeft: number; image?: string };
      })
      .filter((m) => {
        if (!m.outcomePrices?.length || !m.active) return false;
        const isBinary = m.outcomes.length === 2 && m.outcomePrices.length === 2;
        if (!isBinary) return true;
        const yesProb = Math.round((m.outcomePrices[0] ?? 0) * 100);
        return yesProb >= minYesProb && yesProb <= maxYesProb;
      })
      .filter((m) =>
        searchTerm.trim() === "" ? true : m.question.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((m) =>
        searchTerm.trim() !== "" ? true : selectedCategory === "all" || m.category === selectedCategory
      )
      // sort
      .sort((a, b) => {
        if (!sortKey) return 0;
        const valA = sortKey === "volume" ? a.volume : a.daysLeft;
        const valB = sortKey === "volume" ? b.volume : b.daysLeft;
        return sortOrder === "desc" ? valB - valA : valA - valB;
      });

    return markets;
  }, [
    rawMarkets,
    selectedCategory,
    minYesProb,
    maxYesProb,
    searchTerm,
    sortKey,
    sortOrder,
  ]);

  const toggleSort = (key: "volume" | "daysLeft") => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="h-[80px] md:h-[80px]" />
      <div className="mx-auto px-4 md:px-6 ">
        <div className="flex flex-col gap-4">
          <MarketFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            minYesProb={minYesProb}
            maxYesProb={maxYesProb}
            onYesProbChange={(min, max) => {
              setMinYesProb(min);
              setMaxYesProb(max);
            }}
            sortKey={sortKey}
            sortOrder={sortOrder}
            onToggleSort={toggleSort}
          />

        </div>
      </div>

      <div className="mx-auto px-4 md:px-6 mb-4 flex items-center justify-between gap-4"></div>

      <ListItems
        filteredMarkets={filteredMarkets}
        hasMore={hasMore}
        isLoading={isInitialLoading}
        onLoadMore={loadMoreRaw}
      />
      {filteredMarkets.length === 0 && (
        <p className="text-center text-neutral-500 mt-16 text-xl">
          No markets found with Yes between {minYesProb}% and {maxYesProb}%
        </p>
      )}
    </main>
  );
}