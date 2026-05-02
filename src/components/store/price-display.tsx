"use client";

import { useCurrency } from "@/hooks/use-currency";
import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  amount: number;
  compareAtPrice?: number | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-3xl sm:text-4xl",
};

export function PriceDisplay({ amount, compareAtPrice, className, size = "md" }: PriceDisplayProps) {
  const { format } = useCurrency();

  return (
    <div className={cn("flex items-baseline gap-2 flex-wrap", className)}>
      <span className={cn("font-bold", sizeClasses[size], size === "lg" && "text-primary")}>
        {format(amount)}
      </span>
      {compareAtPrice && compareAtPrice > amount && (
        <span className={cn(
          "text-muted-foreground line-through",
          size === "lg" ? "text-lg" : "text-sm"
        )}>
          {format(compareAtPrice)}
        </span>
      )}
    </div>
  );
}
