import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShieldCheck, Truck, Clock } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[520px] overflow-hidden">
      {/* Full-width background image */}
      <Image
        src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=1600&auto=format&fit=crop"
        alt="Smiling pharmacist in a pharmacy"
        fill
        className="object-cover"
        priority
      />

      {/* Gradient overlay - fades from solid brand color to transparent */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 via-50% to-primary/20 md:to-transparent" />

      {/* Content */}
      <div className="relative z-10 py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              Your Trusted
              <span className="block">Online Pharmacy</span>
            </h1>
            <p className="mt-4 text-lg text-white/80 max-w-lg">
              Quality medications and healthcare products delivered right to your doorstep. Safe, reliable, and affordable.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className={cn(buttonVariants({ size: "lg" }), "bg-white text-primary hover:bg-white/90")}>
                Shop Now
              </Link>
              <Link href="/products" className={cn(buttonVariants({ size: "lg" }), "bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary")}>
                Browse Categories
              </Link>
            </div>
          </div>

          {/* Feature cards - full width */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <ShieldCheck className="h-8 w-8 text-white flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm text-white">Verified Products</p>
                <p className="text-xs text-white/70">NAFDAC approved medications</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <Truck className="h-8 w-8 text-white flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm text-white">Fast Delivery</p>
                <p className="text-xs text-white/70">Nationwide delivery available</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <Clock className="h-8 w-8 text-white flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm text-white">24/7 Support</p>
                <p className="text-xs text-white/70">Always here to help you</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
