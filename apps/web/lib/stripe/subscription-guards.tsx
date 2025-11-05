"use client";

import { useSession } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc/react";
import { hasAccessToPlan, type PlanName } from "./helpers";
import { ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert";
import { Button } from "@repo/ui/components/ui/button";
import { LockIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface RequireSubscriptionProps {
  children: ReactNode;
  requiredPlan: PlanName;
  fallback?: ReactNode;
}

/**
 * Component that only renders children if user has required subscription
 */
export function RequireSubscription({
  children,
  requiredPlan,
  fallback,
}: RequireSubscriptionProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const { data: subscriptionData, isLoading } =
    trpc.stripe.hasActiveSubscription.useQuery(
      { userId: session?.user?.id || "" },
      { enabled: !!session?.user?.id }
    );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (
      <Alert>
        <LockIcon className="h-4 w-4" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          Please sign in to access this feature.
          <Button
            onClick={() => router.push("/sign-in")}
            variant="outline"
            size="sm"
            className="ml-2"
          >
            Sign In
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const sub = subscriptionData && 'subscription' in subscriptionData ? subscriptionData.subscription : null;
  const hasAccess = hasAccessToPlan(sub, requiredPlan);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Alert>
        <LockIcon className="h-4 w-4" />
        <AlertTitle>Upgrade Required</AlertTitle>
        <AlertDescription>
          This feature requires a {requiredPlan} plan or higher.
          <Button
            onClick={() => router.push("/pricing")}
            variant="outline"
            size="sm"
            className="ml-2"
          >
            View Plans
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}

/**
 * Hook to check if user has access to a specific plan
 */
export function useHasAccess(requiredPlan: PlanName) {
  const { data: session } = useSession();

  const { data: subscriptionData, isLoading } =
    trpc.stripe.hasActiveSubscription.useQuery(
      { userId: session?.user?.id || "" },
      { enabled: !!session?.user?.id }
    );

  const sub = subscriptionData && 'subscription' in subscriptionData ? subscriptionData.subscription : null;
  const hasAccess = hasAccessToPlan(sub, requiredPlan);

  return {
    hasAccess,
    isLoading,
    subscription: sub,
    plan: subscriptionData?.plan || "free",
  };
}

/**
 * Hook to get current subscription status
 */
export function useSubscriptionStatus() {
  const { data: session } = useSession();

  const { data: subscriptionData, isLoading } =
    trpc.stripe.hasActiveSubscription.useQuery(
      { userId: session?.user?.id || "" },
      { enabled: !!session?.user?.id }
    );

  const sub = subscriptionData && 'subscription' in subscriptionData ? subscriptionData.subscription : null;

  return {
    isLoading,
    hasSubscription: subscriptionData?.hasSubscription || false,
    plan: subscriptionData?.plan || "free",
    status: subscriptionData?.status,
    subscription: sub,
  };
}
