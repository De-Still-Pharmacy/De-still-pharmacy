"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, Search, X, LogOut, LayoutDashboard, Package, ChevronRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/hooks/use-cart";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CurrencyToggle } from "@/components/store/currency-toggle";

export function Navbar() {
  const { data: session } = useSession();
  const { getTotalItems, openCart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const totalItems = getTotalItems();

  useEffect(() => {
    if (mobileSearchOpen && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, [mobileSearchOpen]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        {/* Logo - hidden when mobile search is open */}
        <Link href="/" className={cn("flex items-center gap-2 flex-shrink-0", mobileSearchOpen && "hidden sm:flex")}>
          <Image
            src="/logo.png"
            alt="De-Still Pharmacy"
            width={36}
            height={36}
            className="rounded"
            style={{ width: "36px", height: "auto" }}
          />
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold text-primary">De-Still</span>
            <span className="text-[10px] text-muted-foreground -mt-1 hidden sm:block">Pharmacy</span>
          </div>
        </Link>

        {/* Desktop search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search medications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-input bg-transparent pl-9 pr-4 text-sm outline-none transition-all hover:border-ring/50 focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
            />
          </div>
        </form>

        {/* Mobile search bar - expands when open */}
        {mobileSearchOpen && (
          <form onSubmit={handleSearch} className="flex-1 flex sm:hidden">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                ref={mobileInputRef}
                type="text"
                placeholder="Search medications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-transparent pl-9 pr-4 text-sm outline-none transition-all hover:border-ring/50 focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="flex-shrink-0 ml-1"
              onClick={() => {
                setMobileSearchOpen(false);
                setSearchQuery("");
              }}
            >
              <X className="h-5 w-5" />
            </Button>
          </form>
        )}

        {/* Right side actions - hidden when mobile search is open */}
        <div className={cn("flex items-center gap-1 sm:gap-2", mobileSearchOpen && "hidden sm:flex")}>
          {/* Currency toggle */}
          <CurrencyToggle />

          {/* Mobile search toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setMobileSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={openCart}
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {totalItems}
              </span>
            )}
          </Button>

          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-full" />}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  {session.user.name?.charAt(0).toUpperCase() || "U"}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-0">
                {/* User info header */}
                <div className="flex items-center gap-3 px-4 py-4 bg-muted/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-base font-semibold flex-shrink-0">
                    {session.user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator className="my-0" />
                {/* Menu items */}
                <div className="p-1.5">
                  <DropdownMenuItem render={<Link href="/orders" />} className="px-3 py-2.5 rounded-md">
                    <Package className="mr-3 h-4 w-4 text-muted-foreground" />
                    My Orders
                    <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                  </DropdownMenuItem>
                  {["ADMIN", "SUPER_ADMIN", "PUBLISHER", "VIEWER"].includes(session.user.role) && (
                    <DropdownMenuItem render={<Link href="/admin" />} className="px-3 py-2.5 rounded-md">
                      <LayoutDashboard className="mr-3 h-4 w-4 text-muted-foreground" />
                      Admin Panel
                      <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                    </DropdownMenuItem>
                  )}
                </div>
                <DropdownMenuSeparator className="my-0" />
                <div className="p-1.5">
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="px-3 py-2.5 rounded-md text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Sign In
              </Link>
              <Link href="/register" className={cn(buttonVariants({ size: "sm" }), "hidden sm:inline-flex")}>
                Create an Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
