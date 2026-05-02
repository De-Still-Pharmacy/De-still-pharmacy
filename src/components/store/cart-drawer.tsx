"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useCurrency } from "@/hooks/use-currency";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal } =
    useCart();
  const { format } = useCurrency();
  const subtotal = getSubtotal();
  const itemCount = items.length;

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent
        className="flex flex-col w-full sm:max-w-md p-0 gap-0"
        showCloseButton={false}
      >
        {/* Header */}
        <SheetHeader className="border-b px-5 py-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-base">
              <ShoppingBag className="size-5" />
              Cart
              {itemCount > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                  {itemCount}
                </span>
              )}
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={closeCart}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
              <span className="sr-only">Close cart</span>
            </Button>
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="rounded-full bg-muted p-4 mb-4">
              <ShoppingBag className="size-8 text-muted-foreground" />
            </div>
            <p className="text-base font-medium">Your cart is empty</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add some products to get started
            </p>
            <Link
              href="/products"
              onClick={closeCart}
              className={cn(buttonVariants(), "mt-6")}
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            {/* Cart items */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="space-y-0 divide-y">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    {/* Product image */}
                    <div className="relative size-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="size-full flex items-center justify-center text-muted-foreground">
                          <ShoppingBag className="size-5" />
                        </div>
                      )}
                    </div>

                    {/* Product details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            href={`/products/${item.slug}`}
                            className="text-sm font-medium hover:underline line-clamp-2 leading-snug"
                            onClick={closeCart}
                          >
                            {item.name}
                          </Link>
                          <p className="text-sm font-semibold mt-1">
                            {format(item.price)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-destructive flex-shrink-0 -mr-1 -mt-1"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="size-4" />
                          <span className="sr-only">Remove {item.name}</span>
                        </Button>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-0 mt-2">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className="rounded-r-none"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="size-3" />
                        </Button>
                        <div className="flex items-center justify-center h-7 w-10 border-y text-sm font-medium">
                          {item.quantity}
                        </div>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className="rounded-l-none"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="size-3" />
                        </Button>
                        <span className="text-sm text-muted-foreground ml-3">
                          {format(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <SheetFooter className="border-t px-5 py-4 gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-base font-semibold">
                  {format(subtotal)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Delivery fees calculated at checkout
              </p>
              <Link
                href="/checkout"
                onClick={closeCart}
                className={cn(buttonVariants({ size: "lg" }), "w-full")}
              >
                Proceed to Checkout
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "w-full"
                )}
              >
                View Full Cart
              </Link>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
