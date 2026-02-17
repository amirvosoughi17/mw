"use client";

import { useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { ImSpinner8 } from "react-icons/im";
import { ItemCard } from "./ItemCard";
import type { PolymarketMarket } from "@/types/polymarket";

interface ListItemsProps {
    filteredMarkets: PolymarketMarket[];
    hasMore: boolean;
    isLoading: boolean;
    onLoadMore: () => void;
}

export function ListItems({
    filteredMarkets,
    hasMore,
    isLoading,
    onLoadMore,
}: ListItemsProps) {
    const effectiveHasMore = hasMore && filteredMarkets.length > 0;

    useEffect(() => {
        if (filteredMarkets.length < 12 && hasMore && !isLoading) {
            onLoadMore();
        }
    }, [filteredMarkets.length, hasMore, isLoading, onLoadMore]);

    if (isLoading && filteredMarkets.length === 0) {
        return (
            <div className="mx-auto max-w-7xl px-4 md:px-6">

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div
                            key={i}
                            className="border border-neutral-800 rounded-xl bg-neutral-900/50 animate-pulse h-64"
                        />
                    ))}
                </div>
            </div>

        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 md:px-6">
            <InfiniteScroll
                dataLength={filteredMarkets.length}
                next={onLoadMore}
                hasMore={effectiveHasMore}
                loader={
                    <div className="text-center my-12 text-neutral-500">
                        <ImSpinner8 className="animate-spin inline mr-2 text-xl" />
                        در حال بارگذاری...
                    </div>
                }
                endMessage={
                    filteredMarkets.length > 0 && (
                        <p className="text-center my-10 text-neutral-600 text-base">
                            {hasMore ? "در حال بررسی بیشتر..." : "همه پیش‌بینی‌های ممکن نمایش داده شد"}
                        </p>
                    )
                }
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                    {filteredMarkets.map((market) => (
                        <ItemCard key={`${market.id}-${market.slug}`} market={market} />
                    ))}
                </div>
            </InfiniteScroll>

            {filteredMarkets.length === 0 && !isLoading && (
                <div className="text-center py-20 text-neutral-500 text-lg">
                    هیچ پیش‌بینی‌ای با فیلترهای انتخاب‌شده یافت نشد
                </div>
            )}
        </div>
    );
}