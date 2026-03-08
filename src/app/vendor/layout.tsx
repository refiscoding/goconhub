import { VendorNav } from "@/components/layout/VendorNav";
import { VendorChakraProvider } from "@/components/providers/VendorChakraProvider";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
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
