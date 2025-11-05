"use client";

import { useState } from "react";
import { PricingCard } from "@repo/ui/components/pricing-card";
import { Switch } from "@repo/ui/components/ui/switch";
import { Label } from "@repo/ui/components/ui/label";
import { trpc } from "@/lib/trpc/react";
import { useSession, authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const { data: session } = useSession();
  const { data: plans } = trpc.stripe.getPlans.useQuery();
  const { data: subscriptionData } = trpc.stripe.hasActiveSubscription.useQuery(
    { userId: session?.user?.id || "" },
    { enabled: !!session?.user?.id }
  );

  const handleSelectPlan = async (planName: string, annual: boolean) => {
    if (!session) {
      toast.error("Please sign in to upgrade your plan");
      // Redirect to sign in
      window.location.href = "/sign-in?redirect=/pricing";
      return;
    }

    if (planName === "free") {
      toast.info("You're already on the free plan");
      return;
    }

    try {
      // Use Better Auth's stripe upgrade method
      // @ts-expect-error - Better Auth stripe client types are complex
      await authClient.stripe.upgrade({
        plan: planName,
        annual,
        successUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/pricing`,
        // If user already has a subscription, pass the subscription ID
        ...(subscriptionData && 'subscription' in subscriptionData && subscriptionData.subscription?.stripeSubscriptionId && {
          subscriptionId: subscriptionData.subscription.stripeSubscriptionId,
        }),
      });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Failed to start checkout. Please try again.");
    }
  };

  const currentPlan = subscriptionData?.plan || "free";

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Choose the plan that's right for you
        </p>

        {/* Annual Toggle */}
        <div className="flex items-center justify-center gap-3">
          <Label htmlFor="annual-toggle" className="text-base">
            Monthly
          </Label>
          <Switch
            id="annual-toggle"
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
          />
          <Label htmlFor="annual-toggle" className="text-base">
            Annual
            <span className="ml-2 text-sm text-primary font-semibold">
              (Save 17%)
            </span>
          </Label>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans?.map((plan) => {
          const price = isAnnual
            ? ('priceYearly' in plan ? plan.priceYearly : plan.price) || 0
            : ('priceMonthly' in plan ? plan.priceMonthly : plan.price) || 0;

          const isCurrentPlan = currentPlan === plan.id;

          return (
            <PricingCard
              key={plan.id}
              name={plan.name}
              price={price}
              interval={isAnnual ? "year" : "month"}
              features={plan.features}
              popular={plan.id === "pro"}
              currentPlan={isCurrentPlan}
              onSelect={() => handleSelectPlan(plan.id, isAnnual)}
              badge={plan.id === "free" ? "Always Free" : undefined}
            />
          );
        })}
      </div>

      {/* FAQ or Additional Info */}
      <div className="mt-16 text-center">
        <p className="text-muted-foreground">
          All plans include a 14-day free trial. No credit card required.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Have questions?{" "}
          <a href="/contact" className="text-primary hover:underline">
            Contact us
          </a>
        </p>
      </div>
    </div>
  );
}
