"use client";

import { Badge } from "./ui/badge";
import { CrownIcon, ZapIcon, SparklesIcon } from "lucide-react";

interface SubscriptionBadgeProps {
  plan: "free" | "starter" | "pro";
  status?: "active" | "trialing" | "canceled" | "past_due";
  showIcon?: boolean;
  className?: string;
}

const planConfig = {
  free: {
    label: "Free",
    variant: "secondary" as const,
    icon: null,
  },
  starter: {
    label: "Starter",
    variant: "default" as const,
    icon: ZapIcon,
  },
  pro: {
    label: "Pro",
    variant: "default" as const,
    icon: CrownIcon,
  },
};

const statusConfig = {
  active: {
    variant: "default" as const,
    className: "bg-green-500 hover:bg-green-600",
  },
  trialing: {
    variant: "default" as const,
    className: "bg-blue-500 hover:bg-blue-600",
  },
  canceled: {
    variant: "destructive" as const,
    className: "",
  },
  past_due: {
    variant: "destructive" as const,
    className: "bg-yellow-500 hover:bg-yellow-600",
  },
};

export function SubscriptionBadge({
  plan,
  status,
  showIcon = true,
  className,
}: SubscriptionBadgeProps) {
  const config = planConfig[plan];
  const Icon = config?.icon;

  // Use status styling if provided, otherwise use plan styling
  const badgeVariant = status
    ? statusConfig[status]?.variant
    : config?.variant || "secondary";
  const badgeClassName = status
    ? statusConfig[status]?.className
    : "";

  return (
    <Badge
      variant={badgeVariant}
      className={`${badgeClassName} ${className || ""} flex items-center gap-1.5`}
    >
      {showIcon && Icon && <Icon className="size-3.5" />}
      {config?.label || plan}
      {status === "trialing" && " (Trial)"}
    </Badge>
  );
}

export function SubscriptionStatusBadge({
  status,
}: {
  status: "active" | "trialing" | "canceled" | "past_due";
}) {
  const statusLabels = {
    active: "Active",
    trialing: "Trial",
    canceled: "Canceled",
    past_due: "Past Due",
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={config.className}>
      {statusLabels[status]}
    </Badge>
  );
}
