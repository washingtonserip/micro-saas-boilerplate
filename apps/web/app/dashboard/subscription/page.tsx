"use client";

import { useSession, authClient } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc/react";
import { SubscriptionBadge } from "@repo/ui/components/subscription-badge";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Separator } from "@repo/ui/components/ui/separator";
import {
  formatPrice,
  getDaysRemaining,
  isSubscriptionActive,
  isSubscriptionInTrial,
  willCancelAtPeriodEnd,
} from "@/lib/stripe/helpers";
import { CalendarIcon, CreditCardIcon, AlertCircleIcon } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert";

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const { data: subscriptionData, isLoading } =
    trpc.stripe.hasActiveSubscription.useQuery(
      { userId: session?.user?.id || "" },
      { enabled: !!session?.user?.id }
    );

  const handleManageBilling = async () => {
    try {
      // Use Better Auth's stripe billingPortal method
      // @ts-expect-error - Better Auth stripe client types are complex
      await authClient.stripe.billingPortal({
        returnUrl: `${window.location.origin}/dashboard/subscription`,
      });
    } catch (error) {
      console.error("Error opening billing portal:", error);
      toast.error("Failed to open billing portal. Please try again.");
    }
  };

  const handleUpgrade = () => {
    window.location.href = "/pricing";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <p>Loading subscription details...</p>
        </div>
      </div>
    );
  }

  const sub = subscriptionData && 'subscription' in subscriptionData ? subscriptionData.subscription : null;
  const isActive = isSubscriptionActive(sub);
  const inTrial = isSubscriptionInTrial(sub);
  const willCancel = willCancelAtPeriodEnd(sub);
  const daysRemaining = sub ? getDaysRemaining(sub) : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
          <p className="text-muted-foreground mt-2">
            Manage your subscription and billing
          </p>
        </div>

        {/* Current Plan Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Current Plan</CardTitle>
                <CardDescription className="mt-2">
                  {subscriptionData?.plan === "free"
                    ? "You're on the free plan"
                    : isActive
                      ? "Your subscription is active"
                      : "No active subscription"}
                </CardDescription>
              </div>
              <SubscriptionBadge
                plan={subscriptionData?.plan as any}
                status={sub?.status as any}
              />
            </div>
          </CardHeader>

          {sub && isActive && (
            <>
              <CardContent className="space-y-4">
                <Separator />

                {/* Trial Alert */}
                {inTrial && (
                  <Alert>
                    <AlertCircleIcon className="h-4 w-4" />
                    <AlertTitle>Free Trial Active</AlertTitle>
                    <AlertDescription>
                      Your trial ends in {daysRemaining} days. You won't be
                      charged until the trial period ends.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Cancellation Alert */}
                {willCancel && (
                  <Alert variant="destructive">
                    <AlertCircleIcon className="h-4 w-4" />
                    <AlertTitle>Subscription Ending</AlertTitle>
                    <AlertDescription>
                      Your subscription will end on{" "}
                      {new Date(sub.currentPeriodEnd).toLocaleDateString()}.
                      You'll be downgraded to the free plan.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Subscription Details */}
                <div className="grid gap-4">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Billing Period</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(sub.currentPeriodStart).toLocaleDateString()}{" "}
                        - {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <CreditCardIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Next Payment</p>
                      <p className="text-sm text-muted-foreground">
                        {willCancel
                          ? "No upcoming payment"
                          : `${new Date(sub.currentPeriodEnd).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex gap-3">
                <Button onClick={handleManageBilling} variant="outline">
                  Manage Billing
                </Button>
                {subscriptionData?.plan === "starter" && (
                  <Button onClick={handleUpgrade}>Upgrade to Pro</Button>
                )}
              </CardFooter>
            </>
          )}

          {subscriptionData?.plan === "free" && (
            <CardFooter>
              <Button onClick={handleUpgrade} className="w-full" size="lg">
                Upgrade to Premium
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* Features Card */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Features</CardTitle>
            <CardDescription>
              What's included in your current plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {subscriptionData?.plan === "free" && (
                <>
                  <li className="flex items-center gap-2 text-sm">
                    ✓ Up to 3 projects
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    ✓ Basic analytics
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    ✓ Community support
                  </li>
                </>
              )}
              {subscriptionData?.plan === "starter" && (
                <>
                  <li className="flex items-center gap-2 text-sm">
                    ✓ Unlimited projects
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    ✓ Advanced analytics
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    ✓ Priority email support
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    ✓ Custom domain
                  </li>
                </>
              )}
              {subscriptionData?.plan === "pro" && (
                <>
                  <li className="flex items-center gap-2 text-sm">
                    ✓ Everything in Starter
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    ✓ Premium analytics & insights
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    ✓ 24/7 priority support
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    ✓ Unlimited storage
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    ✓ API access
                  </li>
                </>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
