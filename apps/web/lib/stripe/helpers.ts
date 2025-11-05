import type { Subscription } from "@repo/db";

// Type that matches what comes from tRPC (dates as strings)
type SubscriptionData = Omit<Subscription, 'createdAt' | 'updatedAt' | 'currentPeriodStart' | 'currentPeriodEnd' | 'canceledAt' | 'trialStart' | 'trialEnd'> & {
  createdAt: string;
  updatedAt: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  canceledAt: string | null;
  trialStart: string | null;
  trialEnd: string | null;
};

type SubscriptionInput = Subscription | SubscriptionData | null | undefined;

/**
 * Plan tier hierarchy (higher number = higher tier)
 */
const PLAN_HIERARCHY = {
  free: 0,
  starter: 1,
  pro: 2,
} as const;

export type PlanName = keyof typeof PLAN_HIERARCHY;

/**
 * Check if a subscription is active
 */
export function isSubscriptionActive(
  subscription: SubscriptionInput
): boolean {
  if (!subscription) return false;

  const activeStatuses = ["active", "trialing"];
  return activeStatuses.includes(subscription.status);
}

/**
 * Check if a subscription is in trial period
 */
export function isSubscriptionInTrial(
  subscription: SubscriptionInput
): boolean {
  if (!subscription) return false;

  return subscription.status === "trialing";
}

/**
 * Check if a subscription will cancel at period end
 */
export function willCancelAtPeriodEnd(
  subscription: SubscriptionInput
): boolean {
  if (!subscription) return false;

  return subscription.cancelAtPeriodEnd;
}

/**
 * Get the user's current plan name
 */
export function getUserPlan(
  subscription: SubscriptionInput
): PlanName {
  if (!subscription || !isSubscriptionActive(subscription)) {
    return "free";
  }

  return subscription.planName as PlanName;
}

/**
 * Check if user has access to a specific plan tier
 */
export function hasAccessToPlan(
  subscription: SubscriptionInput,
  requiredPlan: PlanName
): boolean {
  const userPlan = getUserPlan(subscription);
  const userTier = PLAN_HIERARCHY[userPlan];
  const requiredTier = PLAN_HIERARCHY[requiredPlan];

  return userTier >= requiredTier;
}

/**
 * Check if user can upgrade to a plan
 */
export function canUpgradeTo(
  subscription: SubscriptionInput,
  targetPlan: PlanName
): boolean {
  const userPlan = getUserPlan(subscription);
  const userTier = PLAN_HIERARCHY[userPlan];
  const targetTier = PLAN_HIERARCHY[targetPlan];

  return targetTier > userTier;
}

/**
 * Check if user can downgrade to a plan
 */
export function canDowngradeTo(
  subscription: SubscriptionInput,
  targetPlan: PlanName
): boolean {
  const userPlan = getUserPlan(subscription);
  const userTier = PLAN_HIERARCHY[userPlan];
  const targetTier = PLAN_HIERARCHY[targetPlan];

  return targetTier < userTier && isSubscriptionActive(subscription);
}

/**
 * Format price for display
 */
export function formatPrice(
  price: number,
  currency: string = "USD",
  interval?: "month" | "year"
): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
  });

  const formatted = formatter.format(price);

  if (interval) {
    return `${formatted}/${interval}`;
  }

  return formatted;
}

/**
 * Calculate days remaining in subscription period
 */
export function getDaysRemaining(
  subscription: SubscriptionInput
): number {
  if (!subscription) return 0;

  const now = new Date();
  const periodEnd = new Date(subscription.currentPeriodEnd);
  const diff = periodEnd.getTime() - now.getTime();

  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Get subscription status badge color
 */
export function getSubscriptionStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    active: "green",
    trialing: "blue",
    past_due: "yellow",
    canceled: "red",
    incomplete: "gray",
    incomplete_expired: "gray",
    unpaid: "red",
  };

  return colorMap[status] || "gray";
}

/**
 * Format subscription status for display
 */
export function formatSubscriptionStatus(status: string): string {
  const statusMap: Record<string, string> = {
    active: "Active",
    trialing: "Trial",
    past_due: "Past Due",
    canceled: "Canceled",
    incomplete: "Incomplete",
    incomplete_expired: "Expired",
    unpaid: "Unpaid",
  };

  return statusMap[status] || status;
}
