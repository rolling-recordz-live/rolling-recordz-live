import { Suspense } from "react";
import ContactPageClient from "./ContactPageClient";

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="p-10">Loading booking page...</div>}>
      <ContactPageClient />
    </Suspense>
  );
}
