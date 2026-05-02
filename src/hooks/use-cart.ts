"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/cart-store";

export function useCart() {
  const store = useCartStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return {
    ...store,
    items: isHydrated ? store.items : [],
    getTotalItems: () => (isHydrated ? store.getTotalItems() : 0),
    getSubtotal: () => (isHydrated ? store.getSubtotal() : 0),
    isHydrated,
  };
}
