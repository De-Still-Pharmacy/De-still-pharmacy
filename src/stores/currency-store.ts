import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Currency = "NGN" | "USD";

// Approximate exchange rate (NGN to USD) - you can update this or fetch it dynamically
const EXCHANGE_RATE_NGN_TO_USD = 0.00063;

interface CurrencyState {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convert: (amountInNGN: number) => number;
  format: (amountInNGN: number) => string;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: "NGN",
      setCurrency: (currency) => set({ currency }),
      convert: (amountInNGN) => {
        const { currency } = get();
        if (currency === "USD") {
          return amountInNGN * EXCHANGE_RATE_NGN_TO_USD;
        }
        return amountInNGN;
      },
      format: (amountInNGN) => {
        const { currency, convert } = get();
        const amount = convert(amountInNGN);

        if (currency === "USD") {
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
          }).format(amount);
        }

        return new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: "NGN",
          minimumFractionDigits: 0,
        }).format(amount);
      },
    }),
    { name: "de-still-currency" }
  )
);
