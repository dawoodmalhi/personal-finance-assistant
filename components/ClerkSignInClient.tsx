"use client";
import React from 'react';
import { SignIn } from '@clerk/nextjs';

export default function ClerkSignInClient() {
  return <SignIn fallbackRedirectUrl="/dashboard" signUpUrl="/sign-up" />;
}
