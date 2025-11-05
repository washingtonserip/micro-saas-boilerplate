import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { subscription, eq } from "@repo/db";
import { TRPCError } from "@trpc/server";

export const stripeRouter = router({
  // Get user's active subscription
  getSubscription: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(subscription)
        .where(eq(subscription.referenceId, input.userId))
        .limit(1);

      return result.length > 0 ? result[0] : null;
    }),

  // Get all pricing plans
  getPlans: publicProcedure.query(async () => {
    // Return static plan data
    // In production, you might want to fetch this from Stripe or database
    return [
      {
        id: "free",
        name: "Free",
        price: 0,
        interval: "month",
        features: [
          "Up to 3 projects",
          "Basic analytics",
          "Community support",
          "5GB storage",
        ],
      },
      {
        id: "starter",
        name: "Starter",
        priceMonthly: 19,
        priceYearly: 190,
        interval: "month",
        features: [
          "Unlimited projects",
          "Advanced analytics",
          "Priority email support",
          "50GB storage",
          "Custom domain",
          "14-day free trial",
        ],
        priceIdMonthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || "",
        priceIdYearly: process.env.STRIPE_STARTER_YEARLY_PRICE_ID || "",
      },
      {
        id: "pro",
        name: "Pro",
        priceMonthly: 49,
        priceYearly: 490,
        interval: "month",
        features: [
          "Everything in Starter",
          "Premium analytics & insights",
          "24/7 priority support",
          "Unlimited storage",
          "Advanced integrations",
          "API access",
          "Team collaboration",
          "14-day free trial",
        ],
        priceIdMonthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "",
        priceIdYearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || "",
      },
    ];
  }),

  // Check if user has active subscription
  hasActiveSubscription: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(subscription)
        .where(eq(subscription.referenceId, input.userId))
        .limit(1);

      if (result.length === 0) {
        return {
          hasSubscription: false,
          plan: "free",
          status: null,
        };
      }

      const sub = result[0];
      if (!sub) {
        return {
          hasSubscription: false,
          plan: "free",
          status: null,
        };
      }

      const isActive =
        sub.status === "active" || sub.status === "trialing";

      return {
        hasSubscription: isActive,
        plan: sub.planName,
        status: sub.status,
        subscription: sub,
      };
    }),

  // Get subscription details
  getSubscriptionDetails: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(subscription)
        .where(eq(subscription.referenceId, input.userId))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No subscription found",
        });
      }

      return result[0];
    }),
});
