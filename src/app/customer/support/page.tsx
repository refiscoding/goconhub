import { SupportForm } from "@/components/support/SupportForm";

export const metadata = { title: "Help & Support – HandyHub" };

export default function CustomerSupportPage() {
  return <SupportForm defaultRole="customer" />;
}
