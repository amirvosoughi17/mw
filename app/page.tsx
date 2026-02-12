"use client";

import { useEffect, useState, useMemo } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { ImSpinner8 } from "react-icons/im";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

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
  const [rawMarkets, setRawMarkets] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 100;
  const maxRawToFetch = 10000;
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [minYesProb, setMinYesProb] = useState(20);
  const [maxYesProb, setMaxYesProb] = useState(40);

  const [searchTerm, setSearchTerm] = useState("");

  const [sortKey, setSortKey] = useState<"volume" | "daysLeft" | null>(null);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const [sheetOpen, setSheetOpen] = useState(false);

  const loadMoreRaw = async () => {
    if (!hasMore || rawMarkets.length >= maxRawToFetch) {
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

      if (uniqueNew.length > 0) {
        setRawMarkets((prev) => [...prev, ...uniqueNew]);
        setSeenIds((prev) => {
          const newSet = new Set(prev);
          uniqueNew.forEach((m: any) => newSet.add(m.id));
          return newSet;
        });
      }

      setHasMore(
        newHasMore && rawMarkets.length + uniqueNew.length < maxRawToFetch
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
    let markets = rawMarkets
      .map((market: any) => {
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

        const endDate = market.endDateIso ?? "";
        const daysLeft = endDate
          ? Math.max(
              0,
              Math.ceil(
                (new Date(endDate).getTime() - new Date().getTime()) /
                  (1000 * 3600 * 24)
              )
            )
          : 0;

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
          endDate,
          daysLeft,
        };
      })
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
      );

    if (sortKey) {
      markets = markets.sort((a, b) => {
        const valA = sortKey === "volume" ? a.volume : a.daysLeft;
        const valB = sortKey === "volume" ? b.volume : b.daysLeft;
        return sortOrder === "desc" ? valB - valA : valA - valB;
      });
    }

    return markets;
  }, [rawMarkets, selectedCategory, minYesProb, maxYesProb, searchTerm, sortKey, sortOrder]);

  const toggleSort = (key: "volume" | "daysLeft") => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
    setSheetOpen(false);
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {/* نوار بالا - ثابت با ظاهر جدید */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-800 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
          <div className="flex items-center justify-between gap-4">
            {/* لوگو جدید */}
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Money <span className="text-blue-500">Wins</span>
            </h1>

            {/* سرچ جدید */}
            <div className="hidden md:block flex-1 max-w-xl">
              <Input
                type="search"
                placeholder="Search Predictions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-blue-500 h-10 rounded-lg"
              />
            </div>

            {/* دکمه فیلتر جدید */}
            <div className="flex items-center gap-3">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="md:hidden">
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden md:flex">
                    Show Filters
                  </Button>
                </SheetTrigger>

                <SheetContent side="right" className="w-full sm:w-[380px] bg-neutral-950 border-l border-neutral-800">
                  <SheetHeader>
                    <SheetTitle className="text-white text-xl mb-6">Filters & Sort</SheetTitle>
                  </SheetHeader>

                  <div className="space-y-8 py-6">
                    {/* سرچ در موبایل */}
                    <div className="md:hidden">
                      <Input
                        type="search"
                        placeholder="Search Predictions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-blue-500 rounded-lg"
                      />
                    </div>

                    {/* اسلایدر Yes جدید */}
                    <div>
                      <label className="block text-gray-300 text-sm mb-4 font-medium text-center">
                        Yes Probability Range
                      </label>
                      <div className="space-y-6">
                        <div className="flex justify-between text-sm text-gray-400 px-1">
                          <span>Min: {minYesProb}%</span>
                          <span>Max: {maxYesProb}%</span>
                        </div>
                        <Slider
                          value={[minYesProb, maxYesProb]}
                          min={0}
                          max={100}
                          step={5}
                          onValueChange={(values) => {
                            const [newMin, newMax] = values;
                            setMinYesProb(newMin);
                            setMaxYesProb(newMax);
                          }}
                          className="w-full"
                        />
                        <p className="text-center text-gray-500 text-xs">
                          Showing markets with Yes between {minYesProb}% and {maxYesProb}%
                        </p>
                      </div>
                    </div>

                    {/* مرتب‌سازی جدید */}
                    <div className="space-y-4">
                      <label className="block text-gray-300 text-sm font-medium text-center">
                        Sort By
                      </label>
                      <div className="grid gap-3">
                        <Button
                          variant={sortKey === "volume" ? "default" : "outline"}
                          onClick={() => toggleSort("volume")}
                          className="justify-between"
                        >
                          <span>Volume</span>
                          <span>{sortKey === "volume" ? (sortOrder === "desc" ? "High to Low ↓" : "Low to High ↑") : ""}</span>
                        </Button>
                        <Button
                          variant={sortKey === "daysLeft" ? "default" : "outline"}
                          onClick={() => toggleSort("daysLeft")}
                          className="justify-between"
                        >
                          <span>Time Left</span>
                          <span>{sortKey === "daysLeft" ? (sortOrder === "desc" ? "Longest First ↓" : "Shortest First ↑") : ""}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* دسته‌بندی‌ها با ظاهر جدید */}
          <div className="flex gap-3 md:gap-6 justify-start overflow-x-auto py-4 scrollbar-hide">
            {mainCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-sm md:text-base font-medium transition-all duration-300 whitespace-nowrap ${
                  selectedCategory === cat
                    ? "text-white underline underline-offset-4 decoration-blue-500"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* فضای خالی زیر نوار */}
      <div className="h-[140px] md:h-[160px]" />

      {/* تعداد مارکت‌ها */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 mb-6">
        <p className="text-gray-400 text-sm">
          Fetched {rawMarkets.length} markets • Showing {filteredMarkets.length} matching criteria
        </p>
      </div>

      {/* کارت‌ها - ظاهر کمی مدرن‌تر شد ولی منطق همونه */}
      <div className="mx-auto max-w-7xl px-4 md:px-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMarkets.map((market) => {
              const highestProb = Math.max(...market.outcomePrices) * 100;
              const isBinary =
                market.outcomes.length === 2 && market.outcomePrices.length === 2;
              const yesProb = isBinary ? market.outcomePrices[0] * 100 : null;
              const noProb = isBinary ? market.outcomePrices[1] * 100 : null;

              return (
                <a
                  key={`${market.id}-${market.slug}`} // کلید ترکیبی - ارور duplicate حل شد
                  href={`https://polymarket.com/market/${market.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border border-neutral-800 rounded-xl overflow-hidden transition-all hover:border-neutral-600 bg-neutral-950/50 backdrop-blur-sm"
                >
                  <div className="p-4 flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      {market.image && (
                        <img
                          src={market.image}
                          alt={market.question}
                          className="w-12 h-12 rounded-lg object-cover border border-neutral-700 flex-shrink-0"
                          onError={(e) => (e.target as HTMLImageElement).style.display = "none"}
                        />
                      )}
                      <h2 className="font-semibold text-base leading-5 line-clamp-2">
                        {market.question}
                      </h2>
                    </div>

                    <div className="flex gap-2">
                      {isBinary ? (
                        <>
                          <div className="flex-1 bg-green-950/50 rounded-lg py-2 px-3 text-center font-semibold text-green-400 text-sm">
                            Yes {yesProb?.toFixed(0)}%
                          </div>
                          <div className="flex-1 bg-red-950/50 rounded-lg py-2 px-3 text-center font-semibold text-red-400 text-sm">
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
                                  ? "bg-blue-950/50 text-blue-300"
                                  : "bg-neutral-900 text-neutral-300"
                              }`}
                            >
                              {outcome.slice(0, 12)}... {(market.outcomePrices[i] * 100).toFixed(0)}%
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-neutral-500 flex justify-between">
                      <span>Highest: {highestProb.toFixed(1)}%</span>
                      <span>Vol: ${(market.volume / 1000).toFixed(1)}k</span>
                      <span>Time: {market.daysLeft}d</span>
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </InfiniteScroll>
      </div>

      {filteredMarkets.length === 0 && !hasMore && (
        <p className="text-center text-neutral-500 mt-16 text-xl">
          No markets with Yes between {minYesProb}% and {maxYesProb}%
        </p>
      )}
    </main>
  );
}