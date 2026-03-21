"use client";
import { ChakraProvider } from "@chakra-ui/react";
import { customerTheme } from "@/lib/themes/customerTheme";

export function CustomerChakraProvider({ children }: { children: React.ReactNode }) {
  return <ChakraProvider theme={customerTheme}>{children}</ChakraProvider>;
}
