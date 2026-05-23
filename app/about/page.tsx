export default function AboutPage() {
  return (
    <section className="px-6 md:px-20 py-10">
      <p className="text-[#ffd95a] tracking-[.3em] text-sm font-black mb-2">MORE THAN A STUDIO</p>
      <h1 className="text-6xl md:text-8xl font-black mb-8">About Rolling Recordz</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card"><h2 className="text-3xl font-black mb-3">Mission</h2><p className="text-white/70">Give independent artists a place to be heard, seen, paid, and connected.</p></div>
        <div className="card"><h2 className="text-3xl font-black mb-3">Vibe</h2><p className="text-white/70">Late-night underground radio, cinematic visuals, blue/gold energy, and real community.</p></div>
        <div className="card"><h2 className="text-3xl font-black mb-3">Future</h2><p className="text-white/70">Synced radio, artist profiles, payouts, subscriber rooms, Unity worlds, and live shows.</p></div>
      </div>
    </section>
  );
}
