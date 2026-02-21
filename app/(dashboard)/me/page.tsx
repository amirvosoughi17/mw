"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, BookMarked, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { readUserPinnedItems } from "@/actions/pinItem/action";
import { ItemCard } from "@/components/Item/ItemCard";

export default function UserPage() {
  const sessionHook = authClient.useSession();
  const session = sessionHook.data;
  const isLoadingSession = sessionHook.isPending;
  const isAuthenticated = !!session?.user;
  const user = session?.user;

  const [pinnedItems, setPinnedItems] = useState<any[]>([]);
  const [loadingPinned, setLoadingPinned] = useState(true);

  const getInitials = (name?: string) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "?";

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const fetchPinned = async () => {
      setLoadingPinned(true);
      try {
        const res = await readUserPinnedItems(user.id);
        setPinnedItems(res || []);
      } catch (err) {
        console.error("Error fetching pinned items:", err);
      } finally {
        setLoadingPinned(false);
      }
    };

    fetchPinned();
  }, [isAuthenticated, user?.id]);

  const pinnedToMarket = (pinned: any) => ({
    id: pinned.externalId || pinned.id || "unknown",
    question: pinned.title || "پیش‌بینی بدون عنوان",
    slug: pinned.slug || pinned.externalId || "unknown", 
    image: pinned.imageUrl || undefined,
    volume: 0,
    endDateIso: undefined, 
    outcomes: pinned.value ? ["Yes", "No"] : [],
    outcomePrices: pinned.value
      ? [
          (parseFloat(pinned.value.replace(/Yes\s*/i, "").replace("%", "")) ||
            50) / 100,
          (100 -
            (parseFloat(pinned.value.replace(/Yes\s*/i, "").replace("%", "")) ||
              50)) /
            100,
        ]
      : [],
  });
  return (
    <div className="flex min-h-svh flex-col gap-6 mt-[80px] px-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-neutral-800">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 border-2 border-primary">
            {user?.image ? (
              <AvatarImage
                src={user.image}
                alt={user.name || "کاربر"}
                referrerPolicy="no-referrer"
              />
            ) : null}
            <AvatarFallback className="text-2xl">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <h1 className="font-bold text-3xl tracking-wide">{user?.name}</h1>
            <p className="text-neutral-400 text-lg">{user?.email}</p>
          </div>
        </div>

        <Button
          variant="destructive"
          className="flex gap-2 items-center self-start md:self-center"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <div className="">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
          Pinned Items
        </h2>

        {loadingPinned ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        ) : pinnedItems.length === 0 ? (
          <div className="text-center py-16 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
            no pinned pridects
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pinnedItems.map((item) => (
              <ItemCard key={item.id} market={pinnedToMarket(item)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
