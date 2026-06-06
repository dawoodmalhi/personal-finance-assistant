"use client";

import React from 'react';
import { SignIn, ClerkLoading, ClerkLoaded } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';

export default function ClerkSignInClient() {
  return (
    <div className="flex min-h-[500px] w-full items-center justify-center">
      {/* Shows while Clerk is fetching its external scripts */}
      <ClerkLoading>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading secure sign-in...</p>
        </div>
      </ClerkLoading>

      {/* Shows once Clerk is fully ready */}
      <ClerkLoaded>
        <SignIn fallbackRedirectUrl="/dashboard" signUpUrl="/sign-up" />
      </ClerkLoaded>
    </div>
  );
}