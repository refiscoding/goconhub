import { CustomerNav } from "@/components/layout/CustomerNav";

/**
 * Customer shell layout — wraps all /customer/* routes.
 * The nav is a Client Component; the layout itself is a Server Component.
 */
export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="customer" className="app-shell">
      <CustomerNav unreadCount={2} />
      <main className="app-content">
        {children}
      </main>
    </div>
  );
}
