"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import {
  IconHome,
  IconLayoutDashboard,
  IconInfoCircle,
  IconMail,
  IconCloudUpload,
  IconArrowsLeftRight,
  IconMessageCircle
} from "@tabler/icons-react";

import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const publicNavItems = [
  { href: "/", label: "Home", icon: IconHome },
  { href: "/about", label: "About", icon: IconInfoCircle },
  { href: "/contact", label: "Contact", icon: IconMail },
] as const;

const signedInNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: IconArrowsLeftRight },
  { href: "/transactions/import", label: "Import Data", icon: IconCloudUpload },
  { href: "/dashboard/chat", label: "Assistant", icon: IconMessageCircle   },
] as const;

const Nav = () => {
  const pathname = usePathname();
  const { isSignedIn } = useUser();

  const navItems = isSignedIn
    ? signedInNavItems : [...publicNavItems];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="flex size-8 items-center justify-center bg-primary text-primary-foreground">
            <span className="text-xs font-bold">PF</span>
          </div>
          <span className="text-sm font-semibold text-foreground">
            Personal Finance
          </span>
        </Link>

        <nav className="flex flex-1 items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/"
                ? pathname === "/"
                : pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "gap-1.5",
                  isActive &&
                    "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="size-4" />
                <span className="sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {isSignedIn ? (
            <>
              <UserButton appearance={{ variables: { colorPrimary: '#23c62b' }}}/>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className={buttonVariants({ variant: "default", size: "sm" })}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Nav;
