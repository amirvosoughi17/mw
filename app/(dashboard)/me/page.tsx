"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Menu, LayoutDashboard, User, LogOut } from "lucide-react";

export default function UserPage() {
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
    <div className="flex min-h-svh flex-col  gap-6 mt-[80px] px-6 max-w-xl mx-auto">
      <div className="flex items-center gap-1 md:gap-2">
        
      </div>
      <div className="w-full flex flex-col items-start justify-center gap-4">
        <Avatar className="w-11 h-11  border-primary">
          {user?.image ? (
            <AvatarImage
              src={user.image}
              alt={user.name || "کاربر"}
              referrerPolicy="no-referrer"
            />
          ) : null}
          <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-2xl tracking-wide">{user?.name}</h1>
          <h1 className="text-neutral-400 text-md ">{user?.email}</h1>
          {/* <h1 className="text-neutral-400 text-md ">{user?.id}</h1> */}
        </div>
        <button  className="flex gap-2 rounded-full py-1.5 px-4 items-center cursor-pointer bg-red-500/30" onSelect={handleSignOut}>
          <LogOut className="h-4 w-4 text-red-300" />
          <span className="text-red-300 text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
