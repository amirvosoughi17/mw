"use client";

import type { PolymarketMarket } from "@/types/polymarket";
import { Eye, BrainCircuit, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useTransition } from "react";
import { togglePinAction } from "@/actions/pinItem/action"; // مسیر رو درست کن

interface ItemCardProps {
    market: PolymarketMarket & {
        endDateIso?: string;
        image?: string;
        daysLeft?: number;
        hoursLeft?: number;
    };
}

export function ItemCard({ market }: ItemCardProps) {
    const [isPending, startTransition] = useTransition();

    const sessionHook = authClient.useSession();
    const session = sessionHook.data;
    const isAuthenticated = !!session?.user;
    const isLoadingSession = sessionHook.isPending;

    let daysLeft = 0;
    let hoursLeft = 0;
    let timeDisplay = "—";
    if (market.endDateIso) {
        try {
            const endTime = new Date(market.endDateIso).getTime();
            const now = Date.now();
            const timeLeftMs = Math.max(0, endTime - now);
            daysLeft = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
            hoursLeft = Math.floor((timeLeftMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            timeDisplay = daysLeft < 3 ? `${daysLeft}d ${hoursLeft}h` : `${daysLeft}d`;
        } catch {
            timeDisplay = "—";
        }
    }

    const highestProb = Math.max(...(market.outcomePrices || [])) * 100;
    const isBinary = market.outcomes.length === 2 && market.outcomePrices.length === 2;
    const yesProb = isBinary ? Math.round((market.outcomePrices[0] ?? 0) * 100) : null;
    // const noProb = isBinary ? Math.round((market.outcomePrices[1] ?? 0) * 100) : null;

    const handlePin = () => {
        if (!isAuthenticated) {
            toast("نیاز به ورود دارید", {
                description: "برای پین کردن پیش‌بینی باید ابتدا وارد حساب کاربری شوید.",
            });
            return;
        }

        startTransition(async () => {
            const result = await togglePinAction(session.user.id, {
                externalId: market.id,
                type: "POLYMARKET",
                title: market.question,
                imageUrl: market.image,
                value: isBinary ? `Yes ${yesProb}%` : null,
            });

            if (result.success) {
                toast(
                    result.action === "pinned" ? "پین شد!" : "از پین‌ها حذف شد",
                    {
                        description:
                            result.action === "pinned"
                                ? `"${market.question.slice(0, 40)}..." به لیست پین‌شده‌ها اضافه شد.`
                                : `"${market.question.slice(0, 40)}..." از لیست پین‌شده‌ها حذف شد.`,
                    }
                );
            } else {
                toast("خطا", {
                    description: result.error || "مشکلی پیش آمد، دوباره امتحان کنید",
                });
            }
        });
    };

    const handleAnalyze = () => {
        if (!isAuthenticated) {
            toast("نیاز به ورود دارید", {
                description: "برای تحلیل با هوش مصنوعی باید وارد شوید.",
            });
            return;
        }

        toast("در حال آماده‌سازی تحلیل...", {
            description: "این قابلیت به‌زودی فعال می‌شود.",
        });
        // بعداً اینجا modal یا صفحه تحلیل باز می‌کنی
    };

    return (
        <div
            className="
        border border-neutral-800 rounded-xl overflow-hidden
        bg-neutral-900/80 backdrop-blur-sm
        transition-all duration-300 hover:border-neutral-600
        hover:shadow-lg hover:shadow-neutral-900/40
        flex flex-col h-full
      "
        >
            <div className="flex-1 flex flex-col p-4 gap-4">
                <div className="flex items-start gap-3">
                    {market.image && (
                        <img
                            src={market.image}
                            alt={market.question || "market image"}
                            className="w-9 h-9 rounded-md object-cover shadow-md flex-shrink-0"
                            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                        />
                    )}
                    <h2 className="font-semibold text-sm md:text-[13px] text-neutral-100 leading-5 line-clamp-2">
                        {market.question}
                    </h2>
                </div>

                <div className="flex gap-2">
                    {/* کد احتمالات - بدون تغییر */}
                    {isBinary ? (
                        <>
                            <div className="flex-1 bg-green-950/60 rounded-lg py-2 px-3 text-center font-semibold text-green-400 text-sm">
                                Yes {yesProb}%
                            </div>
                            <div className="flex-1 bg-red-950/60 rounded-lg py-2 px-3 text-center font-semibold text-red-400 text-sm">
                                No {100 - (yesProb ?? 0)}%
                            </div>
                        </>
                    ) : (
                        <div className="grid grid-cols-2 gap-2 w-full">
                            {market.outcomes.map((outcome, i) => {
                                const prob = (market.outcomePrices[i] ?? 0) * 100;
                                return (
                                    <div
                                        key={i}
                                        className={`text-center rounded-lg py-2 px-3 font-medium text-xs ${prob === highestProb
                                                ? "bg-blue-950/60 text-blue-300"
                                                : "bg-neutral-800/70 text-neutral-300"
                                            }`}
                                    >
                                        {outcome.slice(0, 12)}
                                        {outcome.length > 12 ? "..." : ""} {prob.toFixed(0)}%
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <p className="text-xs text-neutral-400/80 flex justify-between mt-auto">
                    <span>Vol: ${(market.volume / 1000).toFixed(1)}k</span>
                    <span>Time: {timeDisplay}</span>
                </p>
            </div>

            {/* بخش اکشن */}
            <div className="border-t border-neutral-800 bg-neutral-950/60 px-3 py-2.5 flex items-center justify-between gap-2">
                {/* مشاهده */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-neutral-300 hover:text-white hover:bg-neutral-800/50 text-xs gap-1.5"
                    asChild
                >
                    <a
                        href={`https://polymarket.com/event/${market.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Eye className="h-3.5 w-3.5" />
                        مشاهده
                    </a>
                </Button>

                {/* تحلیل AI */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-sky-400 hover:text-sky-300 hover:bg-neutral-800/50 text-xs gap-1.5"
                    disabled={!isAuthenticated || isLoadingSession || isPending}
                    onClick={handleAnalyze}
                >
                    <BrainCircuit className="h-3.5 w-3.5" />
                    تحلیل AI
                </Button>

                {/* پین کردن */}
                <Button
                    variant="ghost"
                    size="sm"
                    className={`
            flex-1 text-amber-400 hover:text-amber-300 hover:bg-neutral-800/50 text-xs gap-1.5
            ${isPending ? "opacity-70 cursor-wait" : ""}
          `}
                    disabled={!isAuthenticated || isLoadingSession || isPending}
                    onClick={handlePin}
                >
                    <Pin className="h-3.5 w-3.5" />
                    {isPending ? "در حال انجام..." : "پین"}
                </Button>
            </div>
        </div>
    );
}