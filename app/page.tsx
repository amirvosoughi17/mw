"use client";

import { useEffect, useState, useMemo } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { ImSpinner8 } from "react-icons/im";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VscSettings } from "react-icons/vsc";
import { IoIosSearch } from "react-icons/io";
import { IoFilter } from "react-icons/io5";
import { IoTimerOutline } from "react-icons/io5";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ArrowUpDown } from "lucide-react";
import {
  mainCategories,
  categoryLabels,
  categoryKeywords,
} from "@/constants/categories";
import { ModeToggle } from "@/components/dark-light";

export default function HomePage() {
  const [rawMarkets, setRawMarkets] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 100;
  const maxRawToFetch = 6000;
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [minYesProb, setMinYesProb] = useState(2);
  const [maxYesProb, setMaxYesProb] = useState(98);

  const [searchTerm, setSearchTerm] = useState("");

  const [sortKey, setSortKey] = useState<"volume" | "daysLeft" | null>(null);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const [sheetOpen, setSheetOpen] = useState(false);

  const minDisplayItems = 20;

  // تگ‌های ثابت مورد نظر شما
  const trendingTags = ["fed", "iran", "f1", "trump"];

  const loadMoreRaw = async () => {
    if (!hasMore || rawMarkets.length >= maxRawToFetch) {
      setHasMore(false);
      return;
    }

    try {
      const res = await fetch(
        `/api/raw-markets?offset=${offset}&limit=${limit}&minYes=${minYesProb}&maxYes=${maxYesProb}&category=${
          selectedCategory === "all" ? "" : selectedCategory
        }`
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
    if (minYesProb > maxYesProb) setMaxYesProb(minYesProb);
  }, [minYesProb]);

  useEffect(() => {
    if (maxYesProb < minYesProb) setMinYesProb(maxYesProb);
  }, [maxYesProb]);

  const filteredMarkets = useMemo(() => {
    const seen = new Set<string>();
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
        const endTime = new Date(endDate).getTime();
        const now = new Date().getTime();
        const timeLeftMs = Math.max(0, endTime - now);
        const daysLeft = Math.floor(timeLeftMs / (1000 * 3600 * 24));
        const hoursLeft = Math.floor(
          (timeLeftMs % (1000 * 3600 * 24)) / (1000 * 3600)
        );

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
          hoursLeft,
        };
      })
      .filter((m) => {
        if (!m.outcomePrices.length || !m.active) return false;

        const isBinary =
          m.outcomes.length === 2 && m.outcomePrices.length === 2;
        if (!isBinary) return true;

        const yesProb = Math.round((m.outcomePrices[0] ?? 0) * 100);
        return yesProb >= minYesProb && yesProb <= maxYesProb;
      })
      .filter((m) => {
        // وقتی سرچ فعال است → کتگوری را نادیده بگیر
        if (searchTerm.trim() !== "") {
          return true;
        }
        return selectedCategory === "all" || m.category === selectedCategory;
      })
      .filter((m) =>
        m.question.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((m) => {
        const compositeKey = `${m.id}-${m.slug}`;
        if (seen.has(compositeKey)) return false;
        seen.add(compositeKey);
        return true;
      });

    if (sortKey) {
      markets = markets.sort((a, b) => {
        const valA = sortKey === "volume" ? a.volume : a.daysLeft;
        const valB = sortKey === "volume" ? b.volume : b.daysLeft;
        return sortOrder === "desc" ? valB - valA : valA - valB;
      });
    }

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

  useEffect(() => {
    if (
      filteredMarkets.length < minDisplayItems &&
      hasMore &&
      rawMarkets.length < maxRawToFetch
    ) {
      loadMoreRaw();
    }
  }, [filteredMarkets, hasMore, rawMarkets.length]);

  const toggleSort = (key: "volume" | "daysLeft") => {
    if (sortKey === key) {
      if (sortOrder === "desc") {
        setSortOrder("asc");
      } else {
        setSortKey(null);
        setSortOrder("desc");
      }
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
    setSheetOpen(false);
  };

  const effectiveHasMore =
    hasMore &&
    (filteredMarkets.length < 100 || rawMarkets.length < maxRawToFetch - limit);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-800 bg-black/70 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-5 py-3 md:py-3 md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center w-full gap-8 md:gap-6">
              <div className="flex flex-col gap-0 items-end">
                <h1
                  className="
                    text-lg md:text-[20px] 
                    font-bold tracking-tight
                    font-montserrat !important  mb-[-4px] md:mb-[-5.5px]
                  "
                >
                  FINANCE
                </h1>
                <div className="flex items-center gap-1 mt-[-4.5px] md:mt-[-5.5px]">
                  <span className="font-light tracking-wide text-[15px] ">
                    GROUP
                  </span>
                </div>
              </div>
            </div>
            <div className="flex"></div>
          </div>
        </div>
      </div>

      <div className="h-[80px] md:h-[90px]" />

      <div className="mx-auto max-w-7xl px-4 md:px-6 ">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="relative w-full">
              <Input
                type="search"
                placeholder="Search Predictions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
                  h-10 pl-10 pr-4
                  rounded-full
                  border-none
                  bg-neutral-800/70
                  backdrop-blur-sm
                  text-white
                  placeholder:text-neutral-400/90
                "
              />

              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoIosSearch className="h-5 w-5 text-neutral-400" />
              </div>

              {/* تگ‌های ثابت مورد نظر شما - فقط در md به بالا */}
              {/* <div className="hidden md:flex absolute inset-y-0 right-0 items-center pr-4 gap-1.5 overflow-x-auto">
                {["federal", "iran", "f1", "trump"].map((tag) => (
                  <Badge variant="ghost" className=" text-neutral-300 cursor-pointer px-4 py-1" key={tag} onClick={() => setSearchTerm(tag)}>
                    {tag}
                  </Badge>
                ))}
              </div> */}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 md:gap-2">
                {/* دکمه Volume */}
                <Button
                  variant={sortKey === "volume" ? "default" : "ghost"}
                  onClick={() => toggleSort("volume")}
                  size="icon"
                  className="
                    md:size-auto
                    md:px-4 md:py-2
                    md:text-sm font-medium
                    justify-center
                    transition-all duration-200
                  "
                >
                  <ArrowUpDown className="h-5 w-5" />
                  <span className="hidden md:inline ml-2">Volume</span>
                </Button>

                <Button
                  variant={sortKey === "daysLeft" ? "default" : "ghost"}
                  onClick={() => toggleSort("daysLeft")}
                  size="icon"
                  className="
                    md:size-auto
                    md:px-4 md:py-2
                    md:text-sm font-medium
                    justify-center
                    transition-all duration-200
                  "
                >
                  <IoTimerOutline className="h-5 w-5" />
                  <span className="hidden md:inline ml-2">Time Left</span>
                </Button>
              </div>

              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="secondary" size="icon" className="md:hidden">
                    <IoFilter />
                  </Button>
                </SheetTrigger>
                <SheetTrigger asChild>
                  <Button
                    variant="secondary"
                    size="default"
                    className="hidden md:flex"
                  >
                    <VscSettings />
                    Show Filters
                  </Button>
                </SheetTrigger>

                <SheetContent
                  side="right"
                  className="w-full sm:w-[380px] bg-neutral-950 border-l border-neutral-800"
                >
                  <SheetHeader>
                    <SheetTitle className="text-white text-xl mb-6">
                      Filters & Sort
                    </SheetTitle>
                  </SheetHeader>

                  <div className="space-y-8 px-4 py-6">
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
                          step={1}
                          onValueChange={(values) => {
                            const [newMin, newMax] = values;
                            setMinYesProb(newMin);
                            setMaxYesProb(newMax);
                          }}
                          className="w-full"
                        />
                        <p className="text-center text-gray-500 text-xs">
                          Showing markets with Yes between {minYesProb}% and{" "}
                          {maxYesProb}%
                        </p>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* بخش کتگوری‌ها با افکت گرادینت fade فقط از سمت راست */}
          <div className="relative w-full overflow-hidden">
            {/* گرادینت fade فقط سمت راست */}
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-neutral-950 to-transparent z-10" />

            <div className="flex gap-1 justify-start overflow-x-auto scrollbar-hide relative z-0">
              {mainCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[15px] px-4 py-2 font-medium rounded-lg cursor-pointer transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                    selectedCategory === cat
                      ? "text-white bg-neutral-700/50 "
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  {categoryLabels[cat]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6 mb-4 flex items-center justify-between gap-4"></div>

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <InfiniteScroll
          dataLength={filteredMarkets.length}
          next={loadMoreRaw}
          hasMore={effectiveHasMore}
          loader={
            <p className="text-center my-10 text-gray-400 text-lg">
              <ImSpinner8 className="animate-spin inline mr-2" /> Loading
              more...
            </p>
          }
          endMessage={
            <p className="text-center my-10 text-neutral-500 text-lg">
              {rawMarkets.length >= maxRawToFetch
                ? "Reached maximum fetchable markets"
                : "No more matching markets found"}
            </p>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMarkets.map((market, index) => {
              const highestProb = Math.max(...market.outcomePrices) * 100;
              const isBinary =
                market.outcomes.length === 2 &&
                market.outcomePrices.length === 2;
              const yesProb = isBinary
                ? Math.round(market.outcomePrices[0] * 100)
                : null;
              const noProb = isBinary
                ? Math.round(market.outcomePrices[1] * 100)
                : null;
              const timeDisplay =
                market.daysLeft < 3
                  ? `${market.daysLeft}d ${market.hoursLeft}h`
                  : `${market.daysLeft}d`;

              return (
                <a
                  key={`${market.id}-${market.slug}-${index}`}
                  href={`https://polymarket.com/market/${market.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border border-neutral-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-neutral-600 bg-neutral-900 backdrop-blur-sm"
                >
                  <div className="p-4 flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      {market.image && (
                        <img
                          src={market.image}
                          alt={market.question}
                          className="w-12 h-12 rounded-lg object-cover border border-neutral-700 flex-shrink-0"
                          onError={(e) =>
                            ((e.target as HTMLImageElement).style.display =
                              "none")
                          }
                        />
                      )}
                      <h2 className="font-semibold text-sm md:text-[15px] leading-5 line-clamp-2">
                        {market.question}
                      </h2>
                    </div>

                    <div className="flex gap-2">
                      {isBinary ? (
                        <>
                          <div className="flex-1 bg-green-950/50 rounded-lg py-2 px-3 text-center font-semibold text-green-400 text-sm">
                            Yes {yesProb}%
                          </div>
                          <div className="flex-1 bg-red-950/50 rounded-lg py-2 px-3 text-center font-semibold text-red-400 text-sm">
                            No {noProb}%
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
                              {outcome.slice(0, 12)}...{" "}
                              {(market.outcomePrices[i] * 100).toFixed(0)}%
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-neutral-400/70 flex justify-between">
                      <span>Vol: ${(market.volume / 1000).toFixed(1)}k</span>
                      <span>Time: {timeDisplay}</span>
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </InfiniteScroll>
      </div>

      {filteredMarkets.length === 0 && !effectiveHasMore && (
        <p className="text-center text-neutral-500 mt-16 text-xl">
          No markets found with Yes between {minYesProb}% and {maxYesProb}%
        </p>
      )}
    </main>
  );
}