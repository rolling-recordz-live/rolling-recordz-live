import Link from "next/link";
import { SERVICES } from "@/lib/services";
import { supabase } from "@/lib/supabase";

export default async function ServicesPage() {
  const { data: assets } = await supabase
    .from("service_assets")
    .select("*");

  return (
    <section className="px-6 md:px-20 py-10">
      <p className="text-[#ffd95a] tracking-[.3em] text-sm font-black mb-2">
        WHAT WE OFFER
      </p>

      <h1 className="text-6xl md:text-8xl font-black mb-10">
        Services
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {SERVICES.map((service) => {
          const asset = assets?.find((a) => a.service_slug === service.slug);

          return (
            <div key={service.slug} className="card">
              <div className="aspect-video rounded-2xl bg-black/40 border border-white/10 mb-5 overflow-hidden">
                {asset?.image_url ? (
                  <img
                    src={asset.image_url}
                    className="w-full h-full object-cover"
                    alt={service.title}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/40">
                    Image Slot
                  </div>
                )}
              </div>

              <h2 className="text-3xl font-black mb-3">
                {service.title}
              </h2>

              <p className="text-[#ffd95a] text-3xl font-black mb-4">
                {service.price}
              </p>

              <p className="text-white/70 leading-7 mb-5">
                {service.desc}
              </p>

              <ul className="space-y-2 mb-6 text-white/60">
                {service.includes.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>

              <Link href={`/contact?offer=${service.slug}`} className="btn inline-block">
                Book This Service
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
