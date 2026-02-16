"use client";

import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription
} from "@/components/ui/field";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/me",
      });
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      setError(
        err?.message || "مشکلی پیش آمد. دوباره امتحان کنید یا بعداً مراجعه کنید."
      );
      setIsLoading(false);
    }
  };


  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Field>
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              aria-busy={isLoading}
              className={cn(
                "h-11 gap-2 text-base font-medium",
                isLoading && "opacity-80 cursor-wait"
              )}
            >
              {isLoading ? (
                <>
                 Loading ...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                  >
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Login with google
                </>
              )}
            </Button>
          </Field>
        </CardContent>
      </Card>
      {/* <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription> */}
    </div>
  );
}

