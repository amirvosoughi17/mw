"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Menu,
  LayoutDashboard,
  User,
  LogOut,
  Save,           // آیکون اصلی
  ExternalLink,
  Clock,
  BookMarked,
  Bookmark,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { readUserPinnedItems } from "@/actions/pinItem/action";

export default function Header() {
  const sessionHook = authClient.useSession();
  const session = sessionHook.data;
  const isLoading = sessionHook.isPending;
  const isAuthenticated = !!session?.user;
  const user = session?.user;

  const getInitials = (name?: string) =>
    name
      ? name.split(" ").map((n) => n[0]).join("").toUpperCase()
      : "?";

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  const navLinks = [
    { href: "/", label: "Predicts" },
    { href: "/a", label: "New Listings" },
    { href: "/b", label: "Indexes" },
  ];

  const [pinnedItems, setPinnedItems] = useState<any[]>([]);
  const [loadingPinned, setLoadingPinned] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchPinned = async () => {
      setLoadingPinned(true);
      try {
        if (!sessionHook.data) {
          return setPinnedItems([]);
        }
        const res = await readUserPinnedItems(sessionHook.data.user.id);
        setPinnedItems(res);
      } catch (err) {
        console.error("Error fetching pinned:", err);
      } finally {
        setLoadingPinned(false);
      }
    };

    fetchPinned();
  }, [isAuthenticated]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-800 bg-black/70 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-5 py-3 md:py-3 md:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* لوگو و لینک‌ها - بدون تغییر */}
          <div className="flex items-center w-full gap-8 md:gap-8">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <div className="flex flex-col gap-0 items-end">
                <h1 className="text-lg md:text-[20px] font-bold font-montserrat mb-[-4px] md:mb-[-4px]">
                  SINVESMENT
                </h1>
                <div className="flex items-center gap-1 mt-[-2px] md:mt-[-2px]">
                  <span className="font-normal tracking-wide text-[10px] font-montserrat">
                    FINANCE GROUP
                  </span>
                </div>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1.5">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-neutral-400 px-4 py-2 rounded-xl hover:text-neutral-50 duration-300 text-[14px]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* بخش راست */}
          <div className="flex items-center gap-2.5">
            {isLoading ? (
              <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bookmark className="h-5 w-5 text-amber-400" />
                      {pinnedItems.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                          {pinnedItems.length}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="w-80 mt-2 max-h-[70vh] overflow-y-auto bg-neutral-950 border-neutral-800 shadow-2xl" align="end">
                    <DropdownMenuLabel className="font-medium flex items-center gap-2 px-4 py-3 border-b border-neutral-800">
                      <Save className="h-4 w-4 text-amber-400" />
                      <span>پین‌شده‌ها ({pinnedItems.length})</span>
                    </DropdownMenuLabel>

                    {loadingPinned ? (
                      <div className="p-4 space-y-3">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-5/6" />
                      </div>
                    ) : pinnedItems.length === 0 ? (
                      <div className="p-8 text-center text-neutral-500 text-sm">
                        هنوز هیچ پیش‌بینی‌ای پین نکردید
                      </div>
                    ) : (
                      <div className="py-1">
                        {pinnedItems.map((item: any) => (
                          <DropdownMenuItem key={item.id} asChild>
                            <a
                              href={`https://polymarket.com/event/${item.externalId}`} // یا slug اگر داری
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between px-4 py-3 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800/60"
                            >
                              <span className="line-clamp-2 flex-1 pr-2">
                                {item.title || "پیش‌بینی بدون عنوان"}
                              </span>
                              <ExternalLink className="h-4 w-4 opacity-60 flex-shrink-0 ml-2" />
                            </a>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative cursor-pointer rounded-full p-0">
                      <Avatar className="h-8.5 lg:h-10 lg:w-10 w-8.5 border-primary">
                        {user?.image ? (
                          <AvatarImage src={user.image} alt={user.name || "کاربر"} referrerPolicy="no-referrer" />
                        ) : null}
                        <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 mt-2" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/me" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <a href="/register">
                <Button variant="default">Sign Up</Button>
              </a>
            )}

            {/* منوی موبایل */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="secondary" size="icon" className="backdrop-blur-md">
                    <Menu />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-neutral-950 border-neutral-800">
                  <div className="flex flex-col gap-6 mt-10">
                    {navLinks.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        className="text-neutral-300 text-lg font-medium hover:text-white transition-colors px-4 py-3 rounded-lg hover:bg-neutral-800/50"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}