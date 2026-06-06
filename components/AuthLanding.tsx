"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  IconChartLine,
  IconWallet,
  IconTrendingUp,
  IconShieldLock,
  IconCoin,
  IconArrowRight,
} from "@tabler/icons-react";

import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function AuthLanding() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  // Redirect authenticated users directly to the dashboard
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  // Don't flash the landing page while Clerk is loading auth state
  if (!isLoaded) return null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* 1. HERO SECTION */}
      <section className="flex flex-col items-center justify-center px-4 pt-24 pb-16 text-center md:pt-32 md:pb-24">
        <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <IconChartLine className="size-8" />
        </div>

        <h1 className="mb-6 max-w-4xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl text-balance">
          Take control of your{" "}
          <span className="bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            financial future.
          </span>
        </h1>

        <p className="mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl text-balance">
          The smart, secure, and modern way to track your spending, manage your
          budgets, and grow your wealth all in one place.
        </p>

        <div
          className="flex flex-col sm:flex-row sm:w-auto gap-4 w-64"
          style={{ width: "16rem" }}
        >
          <Link
            href="/sign-up"
            className={cn(
              buttonVariants({ size: "lg" }),
              "w-full sm:w-auto font-medium",
            )}
          >
            Get Started for Free
            <IconArrowRight className="ml-2 size-4" />
          </Link>
          <Link
            href="/sign-in"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "w-full sm:w-auto font-medium",
            )}
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* 2. HOW IT HELPS / VALUE PROPOSITION */}
      <section className="bg-muted/50 border-y border-border py-16 md:py-24 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Stop guessing where your money goes.
              </h2>
              <p className="text-muted-foreground mb-6 text-lg">
                Most people lose hundreds of dollars a month simply because they
                lack visibility. Our platform automatically categorizes your
                transactions, spots hidden subscriptions, and gives you
                actionable insights to save money instantly.
              </p>
              <ul className="space-y-4">
                {[
                  "Identify wasteful spending automatically",
                  "Set realistic budgets you can actually stick to",
                  "Project your future wealth based on current habits",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-foreground font-medium"
                  >
                    <div className="flex size-6 items-center justify-center rounded-full bg-green-500/20 text-green-600">
                      ✓
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Actual Dashboard Screenshot */}
            <div className="rounded-xl border border-border bg-card p-2 shadow-2xl">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
                <Image
                  src="/dashboard-preview.png"
                  alt="Preview of the personal finance dashboard"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES GRID */}
      <section className="py-16 md:py-24 px-4 mx-auto max-w-6xl w-full">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Everything you need to succeed
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powerful tools designed to simplify your financial life without the
            confusing accounting jargon.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconWallet className="size-5" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Smart Tracking</h3>
            <p className="text-sm text-muted-foreground text-balance">
              Import transactions via CSV or connect your bank securely. We'll
              automatically clean up merchant names and categorize them.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
              <IconCoin className="size-5" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Automated Budgets</h3>
            <p className="text-sm text-muted-foreground text-balance">
              Set limits for dining out, groceries, or shopping. We'll alert you
              before you cross the line, keeping your savings on track.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
              <IconTrendingUp className="size-5" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Deep Analytics</h3>
            <p className="text-sm text-muted-foreground text-balance">
              Visualize your cash flow with beautiful, easy-to-read charts. See
              month-over-month trends to ensure you're always growing.
            </p>
          </div>
        </div>
      </section>

      {/* 4. FINAL CTA */}
      <section className="py-16 md:py-24 px-4 border-t border-border mt-auto">
        <div className="mx-auto max-w-3xl text-center flex flex-col items-center">
          <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <IconShieldLock className="size-6" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Ready to fix your finances?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Join thousands of users who are building better financial habits
            today. Secure, private, and built for you.
          </p>
          <Link
            href="/sign-up"
            className={cn(
              buttonVariants({ size: "lg" }),
              "w-1/2 sm:w-auto font-medium",
            )}
          >
            Create Your Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}
