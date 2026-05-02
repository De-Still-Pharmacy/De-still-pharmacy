import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary">
        <Image
          src="https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=1200&auto=format&fit=crop"
          alt="Pharmacist helping a customer"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="De-Still Pharmacy"
              width={40}
              height={40}
              className="rounded"
              style={{ width: "40px", height: "auto" }}
            />
            <span className="text-xl font-bold">De-Still Pharmacy</span>
          </Link>
          <div className="max-w-md">
            <blockquote className="text-2xl font-semibold leading-relaxed">
              &ldquo;Quality healthcare products delivered to your doorstep, with care and reliability you can trust.&rdquo;
            </blockquote>
            <p className="mt-4 text-white/70">
              Your trusted online pharmacy since 2024
            </p>
          </div>
          <p className="text-sm text-white/50">
            &copy; {new Date().getFullYear()} De-Still Pharmacy
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden p-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="De-Still Pharmacy"
              width={32}
              height={32}
              className="rounded"
              style={{ width: "32px", height: "auto" }}
            />
            <span className="text-lg font-bold text-primary">De-Still Pharmacy</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
