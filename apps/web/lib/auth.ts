import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@repo/db";
import { Resend } from "resend";

// Initialize Resend only if API key is provided (allows CLI to work without it)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = "onboarding@resend.dev"; // Change to your verified domain

// Helper function to send emails
async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend) {
    console.warn(
      "Resend API key not configured. Email not sent:",
      params.subject
    );
    return;
  }
  return resend.emails.send({
    from: FROM_EMAIL,
    ...params,
  });
}

export const auth = betterAuth({
  appName: "Micro SaaS Boilerplate",

  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  // Email and Password Authentication (Minimal Start)
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true, // Auto sign-in after signup
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        html: `
          <h2>Password Reset Request</h2>
          <p>Click the link below to reset your password:</p>
          <a href="${url}">Reset Password</a>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
        `,
      });
    },
  },

  // Email Verification
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        html: `
          <h2>Welcome to Micro SaaS Boilerplate!</h2>
          <p>Please verify your email address by clicking the link below:</p>
          <a href="${url}">Verify Email</a>
          <p>If you didn't create an account, you can safely ignore this email.</p>
        `,
      });
    },
  },

  // Session Configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (update session every day)
  },

  // Advanced Options Configuration
  advanced: {
    cookiePrefix: "micro-saas",
  },

  // Future: OAuth Providers (commented out for minimal start)
  // socialProviders: {
  //   google: {
  //     clientId: process.env.GOOGLE_CLIENT_ID!,
  //     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  //   },
  //   github: {
  //     clientId: process.env.GITHUB_CLIENT_ID!,
  //     clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  //   },
  // },

  // Future: Plugins (add as needed)
  // plugins: [
  //   magicLink({
  //     sendMagicLink: async ({ email, url }) => { ... }
  //   }),
  //   passkey(),
  // ],
});

// Export types for type-safe usage
export type Session = typeof auth.$Infer.Session;
export type User = Session["user"];
