"use client";

import type { PolymarketMarket } from "@/types/polymarket";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useTransition, useState } from "react";
import { togglePinAction } from "@/actions/pinItem/action";
import { FaRegBookmark, FaBookmark } from "react-icons/fa";
import { BsStars } from "react-icons/bs";
import { ShineBorder } from "../ui/shine-border";

// یک نوع loose برای سازگاری با pinned → market
interface LooseMarket {
  id: string;
  question: string;
  slug: string;
  image?: string;
  volume?: number;
  endDateIso?: string;
  outcomes?: string[];
  outcomePrices?: number[];
  // بقیه فیلدها اختیاری می‌مونن
  [key: string]: any;
}

interface ItemCardProps {
  market: LooseMarket;  // به جای PolymarketMarket کامل
}

export function ItemCard({ market }: ItemCardProps) {
  const [isPending, startTransition] = useTransition();
  const [localPinned, setLocalPinned] = useState(false);

  const sessionHook = authClient.useSession();
  const session = sessionHook.data;
  const isAuthenticated = !!session?.user;
  const isLoadingSession = sessionHook.isPending;

  // محاسبه زمان باقی‌مانده
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

  const volumeDisplay = market.volume ? `$${(market.volume / 1000).toFixed(1)}k` : "—";

  const isBinary = (market.outcomes?.length === 2) && (market.outcomePrices?.length === 2);
  const yesProb = isBinary ? Math.round((market.outcomePrices?.[0] ?? 0) * 100) : null;

  const handlePin = () => {
    if (!isAuthenticated || !market.id) {
      toast("برای پین کردن نیاز به ورود و اطلاعات بازار دارید");
      return;
    }

    startTransition(async () => {
      const result = await togglePinAction(session.user.id, {
        externalId: market.id,
        type: "POLYMARKET",
        title: market.question,
        imageUrl: market.image,
        value: isBinary && yesProb ? `Yes ${yesProb}%` : null,
      });

      if (result.success) {
        setLocalPinned(result.action === "pinned");
        toast(result.action === "pinned" ? "Pinned" : "Pin deleted");
      } else {
        toast.error(result.error || "خطا");
      }
    });
  };

  const handleAnalyze = () => {
    if (!isAuthenticated) return toast("نیاز به ورود دارید");
    toast("در حال آماده‌سازی تحلیل...");
  };

  return (
    <div
      className="
        border border-neutral-800 rounded-xl overflow-hidden
        bg-neutral-900/80 backdrop-blur-sm
        transition-all duration-300 hover:border-neutral-600
        hover:shadow-lg hover:shadow-neutral-900/40
        flex flex-col h-full group
      "
    >
      <div className="flex-1 flex flex-col p-5 gap-4">
        <div className="flex items-start gap-3">
          {market.image && (
            <img
              src={market.image}
              alt={market.question}
              className="w-9 h-9 rounded-md object-cover shadow-md flex-shrink-0"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
          <div className="group flex-1">
            <a
              href={`https://polymarket.com/market/${market.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <h2 className="font-semibold text-[15px] md:text-[16px] text-neutral-200 leading-5 line-clamp-2 group-hover:underline group-hover:underline-offset-2 group-hover:decoration-white transition-all duration-200">
                {market.question}
              </h2>
            </a>
          </div>
        </div>

        <div className="flex gap-2">
          {isBinary && yesProb != null ? (
            <div className="flex w-full">
              <div
                className="bg-green-950/60 rounded-l-lg py-2 px-3 text-center font-semibold text-green-400 text-sm min-w-[60px]"
                style={{ flex: yesProb / 100 }}
              >
                {yesProb}%
              </div>
              <div
                className="bg-red-950/60 rounded-r-lg py-2 px-3 text-center font-semibold text-red-400 text-sm min-w-[60px]"
                style={{ flex: (100 - yesProb) / 100 }}
              >
                {100 - yesProb}%
              </div>
            </div>
          ) : (
            <div className="text-xs text-neutral-500 text-center w-full py-2 italic">
              اطلاعات احتمال موجود نیست
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-auto">
          <p className="text-xs text-neutral-400/80 flex items-center gap-3">
            <span>Vol: {volumeDisplay}</span>
            <span>Time: {timeDisplay}</span>
          </p>

          <div className="flex items-center gap-3">
            <div className="relative">
              <ShineBorder
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full z-20"
                shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
              />
              <button
                className="relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-neutral-300 hover:text-white bg-neutral-800/60 hover:bg-neutral-700/80 transition-colors duration-200"
                disabled={!isAuthenticated || isLoadingSession || isPending}
                onClick={handleAnalyze}
              >
                <BsStars className="h-3.5 w-3.5" />
                <span>AI Analysis</span>
              </button>
            </div>

            <button
              className={`text-neutral-300 hover:text-white transition-colors ${isPending ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
              disabled={!isAuthenticated || isLoadingSession || isPending}
              onClick={handlePin}
            >
              {localPinned ? <FaBookmark className="h-4 w-4" /> : <FaRegBookmark className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}