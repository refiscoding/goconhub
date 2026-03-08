"use client";
import { ChakraProvider } from "@chakra-ui/react";
import { adminTheme } from "@/lib/themes/adminTheme";

export function AdminChakraProvider({ children }: { children: React.ReactNode }) {
  return <ChakraProvider theme={adminTheme}>{children}</ChakraProvider>;
}
