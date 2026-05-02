"use client";

import { useCurrency } from "@/hooks/use-currency";
import { cn } from "@/lib/utils";
import type { Currency } from "@/stores/currency-store";

const currencies: { value: Currency; label: string; symbol: string }[] = [
  { value: "NGN", label: "NGN", symbol: "\u20A6" },
  { value: "USD", label: "USD", symbol: "$" },
];

export function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex items-center bg-muted rounded-full p-0.5 text-xs font-medium">
      {currencies.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => setCurrency(c.value)}
          className={cn(
            "px-2.5 py-1 rounded-full transition-all",
            currency === c.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {c.symbol} {c.label}
        </button>
      ))}
    </div>
  );
}
