import { AdminChakraProvider } from "@/components/providers/AdminChakraProvider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminChakraProvider>{children}</AdminChakraProvider>;
}
