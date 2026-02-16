"use client";

import { ModeToggle } from "@/components/dark-light";
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
import { Menu, LayoutDashboard, User, LogOut } from "lucide-react";

export default function Header() {
  const sessionHook = authClient.useSession();
  const session = sessionHook.data;
  const isLoading = sessionHook.isPending;
  const isAuthenticated = !!session?.user;
  const user = session?.user;

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

  const navLinks = [
    { href: "/", label: "Predicts" },
    { href: "/a", label: "New Listings" },
    { href: "/b", label: "Indexes" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-800 bg-black/70 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-5 py-3 md:py-3 md:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* لوگو */}
          <div className="flex items-center w-full gap-8 md:gap-8">
            <div className="flex flex-col gap-0 items-end">
              <h1
                className="
                  text-lg md:text-[20px]
                  font-bold 
                  font-montserrat !important
                  mb-[-4px] md:mb-[-4px]
                "
              >
                SINVESMENT
              </h1>
              <div className="flex items-center gap-1 mt-[-2px] md:mt-[-2px]">
                <span
                  className="font-normal tracking-wide text-[10px]
                  font-montserrat !important
                  "
                >
                  FINANCE GROUP
                </span>
              </div>
            </div>

            {/* لینک‌های دسکتاپ (بالای md) */}
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

          {/* بخش راست: Sign Up / پروفایل + Sheet در موبایل */}
          <div className="flex items-center gap-2.5">
          {isLoading ? (
              <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative cursor-pointer  rounded-full p-0"
                  >
                    <Avatar className="h-8.5  lg:h-10 lg:w-10 w-8.5  border-primary">
                      {user?.image ? (
                        <AvatarImage
                          src={user.image}
                          alt={user.name || "کاربر"}
                          referrerPolicy="no-referrer"
                        />
                      ) : null}
                      <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-2" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
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
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <a href="/register">
                <Button variant="default">Sign Up</Button>
              </a>
            )}
            {/* دکمه Sheet فقط در موبایل (زیر md) */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="secondary" size="icon" className=" backdrop-blur-md" >
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

            {/* پروفایل یا Sign Up */}
           
          </div>
        </div>
      </div>
    </header>
  );
}