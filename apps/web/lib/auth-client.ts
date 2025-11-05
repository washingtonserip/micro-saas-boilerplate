"use client";

import { createAuthClient } from "better-auth/react";
import { stripeClient } from "@better-auth/stripe/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [stripeClient()],
});

// Export commonly used hooks and methods for convenience
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  resetPassword,
  forgetPassword,
  verifyEmail,
} = authClient;
