import { SupportForm } from "@/components/support/SupportForm";

export const metadata = { title: "Help & Support – GoCon" };

export default function VendorSupportPage() {
  return <SupportForm defaultRole="vendor" />;
}
