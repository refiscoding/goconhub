import { VendorNav } from "@/components/layout/VendorNav";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="vendor" className="app-shell">
      <VendorNav unreadCount={2} />
      <main className="app-content">
        {children}
      </main>
    </div>
  );
}
