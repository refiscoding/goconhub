import { AuthPage } from "@/components/auth/AuthPage";

/**
 * Public landing page — renders the customer/vendor login.
 * Rendered as a Server Component; AuthPage is a Client Component.
 */
export default function HomePage() {
  return <AuthPage />;
}
