import Link from "next/link";

export default function UploadSuccessPage() {
  return (
    <section className="px-6 md:px-20 py-10">
      <div className="card max-w-2xl mx-auto text-center">
        <p className="text-[#ffd95a] tracking-[.3em] text-sm font-black mb-3">
          PAYMENT COMPLETE
        </p>

        <h1 className="text-5xl font-black mb-5">
          Submission Unlocked
        </h1>

        <p className="text-white/70 mb-8">
          Your $5 Fast Lane submission is unlocked. Return to Artist Upload and submit your record.
        </p>

        <Link href="/upload?paid=success" className="btn inline-block">
          Continue Upload
        </Link>
      </div>
    </section>
  );
}
