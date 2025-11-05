"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { CheckCircleIcon, Loader2Icon } from "lucide-react";
import { SubscriptionBadge } from "@repo/ui/components/subscription-badge";
import { useRouter } from "next/navigation";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isVerifying, setIsVerifying] = useState(true);

  const { data: subscriptionData, refetch } =
    trpc.stripe.hasActiveSubscription.useQuery(
      { userId: session?.user?.id || "" },
      { enabled: !!session?.user?.id }
    );

  useEffect(() => {
    // Give webhooks time to process
    const timer = setTimeout(() => {
      refetch();
      setIsVerifying(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [refetch]);

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Please sign in to view your subscription.</p>
        <Button
          onClick={() => router.push("/sign-in")}
          className="mt-4"
        >
          Sign In
        </Button>
      </div>
    );
  }

  if (isVerifying) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardContent className="pt-6">
              <Loader2Icon className="h-16 w-16 mx-auto mb-4 animate-spin text-primary" />
              <h2 className="text-2xl font-bold mb-2">
                Processing your subscription...
              </h2>
              <p className="text-muted-foreground">
                Please wait while we confirm your payment.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <Card>
          <CardHeader>
            <div className="mx-auto mb-4">
              <CheckCircleIcon className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-3xl">
              Welcome to Premium!
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Your subscription has been activated successfully
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {subscriptionData && 'subscription' in subscriptionData && subscriptionData.subscription && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-muted-foreground">Current Plan:</span>
                <SubscriptionBadge
                  plan={subscriptionData.plan as any}
                  status={subscriptionData.subscription.status as any}
                />
              </div>
            )}

            <div className="bg-muted/50 rounded-lg p-6 space-y-3">
              <h3 className="font-semibold text-lg">What's next?</h3>
              <ul className="space-y-2 text-sm text-left">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Access all premium features immediately</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>
                    Manage your subscription anytime from your dashboard
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>
                    You'll receive a confirmation email with your receipt
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3 justify-center pt-4">
              <Button
                onClick={() => router.push("/dashboard")}
                size="lg"
              >
                Go to Dashboard
              </Button>
              <Button
                onClick={() => router.push("/dashboard/subscription")}
                variant="outline"
                size="lg"
              >
                View Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
