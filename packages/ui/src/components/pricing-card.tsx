"use client";

import { CheckIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";

interface PricingCardProps {
  name: string;
  description?: string;
  price: number;
  interval?: "month" | "year";
  features: string[];
  popular?: boolean;
  currentPlan?: boolean;
  onSelect?: () => void;
  isLoading?: boolean;
  buttonText?: string;
  badge?: string;
}

export function PricingCard({
  name,
  description,
  price,
  interval = "month",
  features,
  popular = false,
  currentPlan = false,
  onSelect,
  isLoading = false,
  buttonText,
  badge,
}: PricingCardProps) {
  const defaultButtonText = currentPlan
    ? "Current Plan"
    : price === 0
      ? "Get Started"
      : "Upgrade Now";

  return (
    <Card
      className={`relative flex flex-col ${
        popular
          ? "border-primary shadow-lg scale-105"
          : "border-border"
      }`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-3 py-1">
            Most Popular
          </Badge>
        </div>
      )}

      {badge && !popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="outline" className="px-3 py-1">
            {badge}
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold">{name}</CardTitle>
        {description && (
          <CardDescription className="text-sm mt-2">
            {description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-grow">
        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-bold tracking-tight">
              ${price}
            </span>
            {price > 0 && (
              <span className="text-muted-foreground text-sm">
                /{interval}
              </span>
            )}
          </div>
          {price > 0 && interval === "year" && (
            <p className="text-sm text-muted-foreground mt-2">
              ${Math.round(price / 12)}/month billed annually
            </p>
          )}
        </div>

        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckIcon className="size-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-4">
        <Button
          onClick={onSelect}
          disabled={currentPlan || isLoading}
          className="w-full"
          variant={popular ? "default" : "outline"}
          size="lg"
        >
          {isLoading ? "Loading..." : buttonText || defaultButtonText}
        </Button>
      </CardFooter>
    </Card>
  );
}
