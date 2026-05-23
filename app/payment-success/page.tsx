import { Suspense } from "react";
import PaymentSuccessClient from "./PaymentSuccessClient";

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="p-10">Verifying payment...</div>}>
      <PaymentSuccessClient />
    </Suspense>
  );
}
