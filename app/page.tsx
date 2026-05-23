import Link from "next/link";

export default function Home() {
  return (
    <section className="min-h-[calc(100vh-96px)] flex items-center px-8 md:px-20">
      <div className="max-w-5xl">
        <p className="text-[#ffd95a] tracking-[.4em] font-black text-sm mb-4">
          LATE NIGHT FREQUENCIES
        </p>

        <h1 className="text-6xl md:text-9xl font-black leading-[.85] tracking-[-.06em]">
          ENTER THE <br />
          <span className="text-[#25c8ff] drop-shadow-[0_0_20px_rgba(37,200,255,.6)]">
            FREQUENCIES
          </span>
        </h1>

        <p className="mt-8 text-xl md:text-2xl font-bold max-w-3xl">
          Recording. Content. Radio. Branding. Community. Everything an artist
          needs in one creative universe.
        </p>

        <div className="flex gap-4 mt-8 flex-wrap">
          <Link className="btn" href="/upload">Artist Upload</Link>
          <Link className="ghost" href="/services">View Services</Link>
          <Link className="btn" href="/radio">Listen Live</Link>
        </div>
      </div>
    </section>
  );
}
