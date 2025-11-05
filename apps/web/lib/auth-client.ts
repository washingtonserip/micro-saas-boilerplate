"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
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
