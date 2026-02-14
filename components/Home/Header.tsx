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

import { LayoutDashboard, User, LogOut } from "lucide-react";

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

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-800 bg-black/70 backdrop-blur-lg">
            <div className="mx-auto max-w-7xl px-5 py-3 md:py-3 md:px-8">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center w-full gap-8 md:gap-6">
                        <div className="flex flex-col gap-0 items-end">
                            <h1
                                className="
                  text-lg md:text-[20px]
                  font-bold tracking-tight
                  font-montserrat !important mb-[-4px] md:mb-[-5.5px]
                "
                            >
                                FINANCE
                            </h1>
                            <div className="flex items-center gap-1 mt-[-4.5px] md:mt-[-5.5px]">
                                <span className="font-light tracking-wide text-[15px]">
                                    GROUP - SInvestment
                                </span>
                            </div>
                        </div>

                        {/* اگر بعداً بخوای لینک یا منو یا چیز دیگه اضافه کنی، اینجا جا داره */}
                    </div>

                    <div className="flex items-center gap-4">
                        {isLoading ? (
                            <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
                        ) : isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="relative cursor-pointer h-10 w-10 rounded-full p-0"
                                    >
                                        <Avatar className="h-10 w-10 border-2 border-primary">
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
                                <DropdownMenuContent className="w-56 mt-2" align="center">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user?.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user?.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild dir="rtl">
                                        <Link href="/me" className="flex items-center gap-2">
                                            <LayoutDashboard className="h-4 w-4" />
                                            <span>داشبورد</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild dir="rtl">
                                        <Link href="/profile" className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            <span>پروفایل</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onSelect={handleSignOut}
                                        dir="rtl"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>خروج</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <>
                                <Button className="rounded-xs p-4" asChild>
                                    <Link href="/register">ثبت نام</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}