"use client";

import { useEffect, useState, useMemo } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { PolymarketMarket } from "@/types/polymarket";
import { ImSpinner8 } from "react-icons/im";

const mainCategories = [
  "all",
  "politics",
  "sports",
  "crypto",
  "finance",
  "geopolitics",
  "earnings",
  "tech",
  "culture",
  "world",
  "economy",
  "climate-science",
  "elections",
];

const categoryLabels: { [key: string]: string } = {
  all: "All",
  politics: "Politics",
  sports: "Sports",
  crypto: "Crypto",
  finance: "Finance",
  geopolitics: "Geopolitics",
  earnings: "Earnings",
  tech: "Tech",
  culture: "Culture",
  world: "World",
  economy: "Economy",
  "climate-science": "Climate & Science",
  elections: "Elections",
};

const categoryKeywords: { [category: string]: string[] } = {
  politics: [
    "trump",
    "biden",
    "kamala",
    "harris",
    "election",
    "vote",
    "congress",
    "senate",
    "president",
    "democrat",
    "republican",
    "politics",
  ],
  elections: ["election", "vote", "president", "primary", "ballot", "campaign"],
  crypto: [
    "bitcoin",
    "btc",
    "eth",
    "ethereum",
    "solana",
    "crypto",
    "token",
    "blockchain",
    "nft",
    "defi",
  ],
  finance: [
    "stock",
    "fed",
    "interest rate",
    "inflation",
    "bond",
    "treasury",
    "finance",
  ],
  sports: [
    "nfl",
    "nba",
    "super bowl",
    "ncaa",
    "world cup",
    "olympics",
    "football",
    "basketball",
    "baseball",
    "sports",
  ],
  geopolitics: [
    "war",
    "ukraine",
    "russia",
    "china",
    "taiwan",
    "iran",
    "israel",
    "palestine",
    "regime",
    "military",
  ],
  culture: [
    "oscar",
    "grammy",
    "movie",
    "tv",
    "music",
    "celebrity",
    "hollywood",
    "gta",
    "game",
    "album",
    "music",
  ],
  tech: [
    "apple",
    "google",
    "ai",
    "openai",
    "tesla",
    "elon",
    "meta",
    "x.com",
    "tech",
  ],
  economy: ["gdp", "recession", "jobs", "unemployment", "tariff", "economy"],
  world: ["world", "global", "international", "eu", "nato"],
  "climate-science": [
    "climate",
    "temperature",
    "co2",
    "nasa",
    "space",
    "vaccine",
    "science",
  ],
};

export default function HomePage() {
  const [markets, setMarkets] = useState<PolymarketMarket[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 200; // Reduced for faster loads
  const maxRawToFetch = 10000;
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [minYesProb, setMinYesProb] = useState(20);
  const [maxYesProb, setMaxYesProb] = useState(40);

  const [searchTerm, setSearchTerm] = useState("");

  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const processMarket = (market: any): PolymarketMarket => {
    let outcomePrices: number[] = [];
    let outcomes: string[] = [];

    try {
      outcomePrices = JSON.parse(market.outcomePrices || "[]")
        .map((p: string) => parseFloat(p))
        .filter((p: number) => !isNaN(p));
    } catch {}

    try {
      outcomes = JSON.parse(market.outcomes || "[]").map((o: string) =>
        o.trim()
      );
    } catch {}

    const q = (market.question || "").toLowerCase();
    let cat = "other";

    for (const [key, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((kw) => q.includes(kw))) {
        cat = key;
        break;
      }
    }

    return {
      id: market.id ?? "",
      question: market.question ?? "",
      slug: market.slug ?? "",
      outcomes,
      outcomePrices,
      volume: parseFloat(market.volume ?? "0") || 0,
      active: market.active ?? false,
      category: cat,
      image: market.image || market.icon || "",
    };
  };

  const loadMoreRaw = async () => {
    if (!hasMore || markets.length >= maxRawToFetch) {
      setHasMore(false);
      return;
    }

    try {
      const res = await fetch(
        `/api/raw-markets?offset=${offset}&limit=${limit}`
      );
      if (!res.ok) throw new Error("Fetch failed");
      const { rawMarkets: newRaw, hasMore: newHasMore } = await res.json();

      const uniqueNew = newRaw.filter((m: any) => !seenIds.has(m.id));

      const processedNew = uniqueNew.map(processMarket);

      if (processedNew.length > 0) {
        setMarkets((prev) => [...prev, ...processedNew]);
        setSeenIds((prev) => {
          const newSet = new Set(prev);
          uniqueNew.forEach((m: any) => newSet.add(m.id));
          return newSet;
        });
      }

      setHasMore(
        newHasMore && markets.length + processedNew.length < maxRawToFetch
      );
      setOffset((prev) => prev + limit);
    } catch (err) {
      console.error(err);
      setHasMore(false);
    }
  };

  useEffect(() => {
    loadMoreRaw();
  }, []);

  useEffect(() => {
    if (minYesProb > maxYesProb) {
      setMaxYesProb(minYesProb);
    }
  }, [minYesProb]);

  useEffect(() => {
    if (maxYesProb < minYesProb) {
      setMinYesProb(maxYesProb);
    }
  }, [maxYesProb]);

  const filteredMarkets = useMemo(() => {
    return markets
      .filter((m) => {
        if (!m.outcomePrices.length || !m.active) return false;

        const isBinary =
          m.outcomes.length === 2 && m.outcomePrices.length === 2;
        if (!isBinary) return true;

        const yesProb = m.outcomePrices[0] * 100;

        return yesProb >= minYesProb && yesProb <= maxYesProb;
      })
      .filter(
        (m) => selectedCategory === "all" || m.category === selectedCategory
      )
      .filter((m) =>
        m.question.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) =>
        sortOrder === "desc" ? b.volume - a.volume : a.volume - b.volume
      );
  }, [markets, selectedCategory, minYesProb, maxYesProb, searchTerm, sortOrder]);

  return (
    <main className=" mx-auto py-6 px-4 md:px-10">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Polymarket Predictions – Yes بین {minYesProb}% تا {maxYesProb}%
      </h1>

      <div className="mb-6 flex justify-center items-center gap-4">
        <input
          type="text"
          placeholder="جستجوی نام پریدیکت..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 rounded-full bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none text-sm placeholder-gray-400"
        />
        <button
          onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
          className="px-5 py-2.5 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 text-sm font-medium transition-all"
        >
          مرتب‌سازی حجم {sortOrder === "desc" ? "↓" : "↑"}
        </button>
      </div>

      <div className="mb-8 flex flex-wrap gap-3 justify-center overflow-x-auto pb-2">
        {mainCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? "bg-blue-600 text-white shadow-lg scale-105"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      <div className="mb-10 bg-gray-800 p-6 rounded-xl">
        <label className="block text-gray-300 text-sm mb-6 text-center">
          محدوده احتمال گزینه Yes (گزینه اول)
        </label>

        <div className="flex flex-col gap-6">
          <div>
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>حداقل Yes: {minYesProb}%</span>
              <span>Min</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={minYesProb}
              onChange={(e) => setMinYesProb(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>حداکثر Yes: {maxYesProb}%</span>
              <span>Max</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={maxYesProb}
              onChange={(e) => setMaxYesProb(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
          </div>
        </div>

        <p className="text-center text-gray-400 mt-6 text-sm">
          فقط مارکت‌های باینری که احتمال Yesشون بین {minYesProb}% تا {maxYesProb}% هست نمایش داده می‌شود
        </p>
      </div>

      <p className="text-center text-gray-400 mb-8">
        Fetched {markets.length} markets • Showing {filteredMarkets.length}{" "}
        matching criteria
      </p>

      <InfiniteScroll
        dataLength={filteredMarkets.length}
        next={loadMoreRaw}
        hasMore={hasMore}
        loader={
          <p className="text-center my-10 text-gray-400 text-lg">
            <ImSpinner8 className="animate-spin inline mr-2" /> Loading...
          </p>
        }
        endMessage={
          <p className="text-center my-10 text-gray-500 text-lg">
            No more matching markets.
          </p>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMarkets.map((market) => {
            const highestProb = Math.max(...market.outcomePrices) * 100;
            const isBinary =
              market.outcomes.length === 2 && market.outcomePrices.length === 2;
            const yesProb = isBinary ? market.outcomePrices[0] * 100 : null;
            const noProb = isBinary ? market.outcomePrices[1] * 100 : null;

            return (
              <a
                key={market.id}
                href={`https://polymarket.com/market/${market.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-gray-700 rounded-xl overflow-hidden transition-all hover:border-gray-500 duration-300 cursor-pointer bg-gray-900/80"
              >
                <div className="p-4 flex flex-col gap-5">
                  <div className="flex items-start gap-3">
                    {market.image && (
                      <img
                        src={market.image}
                        alt={market.question}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-700 shadow-md flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}
                    <h2 className="font-bold text-[15px] leading-5 line-clamp-2 text-white">
                      {market.question}
                    </h2>
                  </div>

                  <div className="flex gap-2 mb-">
                    {isBinary ? (
                      <>
                        <div className="flex-1 bg-green-900/50 rounded-lg py-2.5 px-3 text-center font-bold text-green-300 text-sm">
                          Yes {yesProb?.toFixed(0)}%
                        </div>
                        <div className="flex-1 bg-red-900/50 rounded-lg py-2.5 px-3 text-center font-bold text-red-300 text-sm">
                          No {noProb?.toFixed(0)}%
                        </div>
                      </>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 w-full">
                        {market.outcomes.map((outcome, i) => (
                          <div
                            key={i}
                            className={`text-center rounded-lg py-2 px-3 font-medium text-xs ${
                              market.outcomePrices[i] * 100 === highestProb
                                ? "bg-blue-900/60 text-blue-200"
                                : "bg-gray-800 text-gray-300"
                            }`}
                          >
                            {outcome.slice(0, 12)}...{" "}
                            {(market.outcomePrices[i] * 100).toFixed(0)}%
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    Highest: {highestProb.toFixed(1)}% • Vol: $
                    {(market.volume / 1000).toFixed(1)}k
                  </p>

                </div>
              </a>
            );
          })}
        </div>
      </InfiniteScroll>

      {filteredMarkets.length === 0 && !hasMore && (
        <p className="text-center text-gray-500 mt-16 text-xl">
          No markets with Yes between {minYesProb}% and {maxYesProb}%
        </p>
      )}
    </main>
  );
}