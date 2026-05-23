import Link from "next/link";
import { PACKAGES } from "@/lib/services";

export default function PackagesPage() {
  return (
    <section className="px-6 md:px-20 py-10">
      <p className="text-[#ffd95a] tracking-[.3em] text-sm font-black mb-2">
        ARTIST GROWTH
      </p>

      <h1 className="text-6xl md:text-8xl font-black mb-10">
        Packages
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {PACKAGES.map((pkg) => (
          <div key={pkg.slug} className="card">
            <h2 className="text-3xl font-black mb-3">
              {pkg.title}
            </h2>

            <p className="text-[#ffd95a] text-4xl font-black mb-4">
              {pkg.price}
            </p>

            <p className="text-white/70 leading-7 mb-6">
              {pkg.desc}
            </p>

            <Link href={`/contact?offer=${pkg.slug}`} className="btn inline-block">
              Book This Package
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
