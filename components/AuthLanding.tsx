"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { IconChartLine } from "@tabler/icons-react";

import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function AuthLanding() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg border border-border bg-card p-8 text-card-foreground">
        <div className="mb-6 flex size-12 items-center justify-center bg-primary text-primary-foreground">
          <IconChartLine className="size-6" />
        </div>

        <h1 className="mb-3 text-2xl font-semibold tracking-tight">
          Welcome to Your Personal Finance Assistant
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Manage your finances effectively and efficiently.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row h-24">
          <Link
            href="/sign-in"
            className={cn(buttonVariants({ size: "lg" }), "sm:flex-1")}
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "sm:flex-1"
            )}
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
