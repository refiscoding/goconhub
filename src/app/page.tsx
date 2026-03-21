import { AuthPage } from "@/components/auth/AuthPage";
import { AuthChakraProvider } from "@/components/providers/AuthChakraProvider";

/**
 * Public landing page — renders the customer/vendor login.
 * Rendered as a Server Component; AuthPage + AuthChakraProvider are Client Components.
 */
export default function HomePage() {
  return (
    <AuthChakraProvider>
      <AuthPage />
    </AuthChakraProvider>
  );
}
