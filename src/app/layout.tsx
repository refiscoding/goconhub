import type { Metadata } from "next";
import "@/styles/globals.css";
import { UserProvider } from "@/context/UserContext";

export const metadata: Metadata = {
  title: "HandyHub — Botswana's Trusted Handyman Platform",
  description: "Find and book trusted handymen across Gaborone and Botswana.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <div style={{ minHeight: "100vh", position: "relative" }}>
            {children}
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
