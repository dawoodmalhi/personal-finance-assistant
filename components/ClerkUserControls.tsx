"use client";

import React from 'react';
import { UserButton, SignOutButton } from '@clerk/nextjs';

export default function ClerkUserControls() {
  return (
    <div className="flex items-center space-x-4">
      <UserButton />
      <SignOutButton />
    </div>
  );
}
