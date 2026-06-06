"use client";

import React from 'react';
import { SignUp } from '@clerk/nextjs';

export default function ClerkSignUpClient() {
  return <SignUp fallbackRedirectUrl="/dashboard" signInUrl="/sign-in" />;
}
