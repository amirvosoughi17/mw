import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export default async function UserPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/register");
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <h1 className="text-2xl font-semibold">
        Welcome back, {session.user.name ?? session.user.email}
      </h1>
    </div>
  );
}
