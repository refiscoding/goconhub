import { redirect } from "next/navigation";
import { VendorNav } from "@/components/layout/VendorNav";
import { VendorChakraProvider } from "@/components/providers/VendorChakraProvider";
import { getSession } from "@/lib/session";

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "vendor") redirect("/");

  return (
    <VendorChakraProvider>
      <div data-theme="vendor" className="app-shell">
        <VendorNav unreadCount={2} />
        <main className="app-content">
          {children}
        </main>
      </div>
    </VendorChakraProvider>
  );
}
