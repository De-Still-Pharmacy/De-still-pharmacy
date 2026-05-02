"use client";

import { useEffect, useState } from "react";
import { useCurrencyStore } from "@/stores/currency-store";

export function useCurrency() {
  const store = useCurrencyStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return {
    ...store,
    currency: isHydrated ? store.currency : "NGN",
    format: isHydrated
      ? store.format
      : (amount: number) =>
          new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits: 0,
          }).format(amount),
    isHydrated,
  };
}
