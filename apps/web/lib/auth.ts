import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@repo/db";
import { Resend } from "resend";
import { stripe as stripePlugin } from "@better-auth/stripe";
import Stripe from "stripe";

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

// Initialize Stripe only if API key is provided
const stripeClient = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-08-27.basil",
    })
  : null;

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

  // Plugins
  plugins: [
    ...(stripeClient && process.env.STRIPE_WEBHOOK_SECRET
      ? [
          stripePlugin({
            stripeClient,
            stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
            createCustomerOnSignUp: true,
            subscription: {
              enabled: true,
              plans: [
                {
                  name: "starter",
                  priceId: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || "",
                  freeTrial: {
                    days: 14,
                    onTrialStart: async (subscription) => {
                      console.log(
                        `Trial started for subscription: ${subscription.id}`
                      );
                    },
                    onTrialEnd: async ({ subscription }, request) => {
                      console.log(`Trial ended for subscription: ${subscription.id}`);
                      // Note: User email not available in this callback
                      // Would need to fetch user separately if email is needed
                    },
                  },
                },
                {
                  name: "pro",
                  priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "",
                  freeTrial: {
                    days: 14,
                  },
                },
              ],
              onSubscriptionComplete: async ({
                event,
                subscription,
                stripeSubscription,
                plan,
              }) => {
                console.log(
                  `Subscription completed: ${subscription.id} for plan: ${plan.name}`
                );
                // Optionally send welcome email
                const userId = subscription.referenceId;
                // You can fetch user details and send email here
              },
              onSubscriptionCancel: async ({
                event,
                subscription,
                stripeSubscription,
                cancellationDetails,
              }) => {
                console.log(`Subscription canceled: ${subscription.id}`);
                // Optionally send cancellation email
              },
            },
          }),
        ]
      : []),
  ],
});

// Export types for type-safe usage
export type Session = typeof auth.$Infer.Session;
export type User = Session["user"];
