"use client";
import { ChakraProvider } from "@chakra-ui/react";
import { vendorTheme } from "@/lib/themes/vendorTheme";

export function VendorChakraProvider({ children }: { children: React.ReactNode }) {
  return <ChakraProvider theme={vendorTheme}>{children}</ChakraProvider>;
}
