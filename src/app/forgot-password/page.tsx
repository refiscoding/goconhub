import { Suspense } from "react";
import { ForgotPassword } from "@/components/auth/ForgotPassword";

export const metadata = { title: "Reset Password — GoCon" };

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPassword />
    </Suspense>
  );
}
