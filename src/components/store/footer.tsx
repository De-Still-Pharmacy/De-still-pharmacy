import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Image
                src="/logo.png"
                alt="De-Still Pharmacy"
                width={32}
                height={32}
                className="rounded"
                style={{ width: "32px", height: "auto" }}
              />
              <h3 className="text-lg font-bold">De-Still Pharmacy</h3>
            </div>
            <p className="mt-2 text-sm text-primary-foreground/70">
              Your trusted online pharmacy. Quality medications delivered to your doorstep.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link href="/products" className="hover:text-primary-foreground transition-colors">Products</Link></li>
              <li><Link href="/cart" className="hover:text-primary-foreground transition-colors">Cart</Link></li>
              <li><Link href="/orders" className="hover:text-primary-foreground transition-colors">My Orders</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Categories</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link href="/categories/pain-relief" className="hover:text-primary-foreground transition-colors">Pain Relief</Link></li>
              <li><Link href="/categories/vitamins-supplements" className="hover:text-primary-foreground transition-colors">Vitamins</Link></li>
              <li><Link href="/categories/first-aid" className="hover:text-primary-foreground transition-colors">First Aid</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>support@destill.com</li>
              <li>+234 800 000 0000</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-primary-foreground/20 pt-4 text-center text-sm text-primary-foreground/60">
          &copy; {new Date().getFullYear()} De-Still Pharmacy. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
