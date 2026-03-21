"use client";
import { ChakraProvider } from "@chakra-ui/react";
import { authTheme } from "@/lib/themes/authTheme";

export function AuthChakraProvider({ children }: { children: React.ReactNode }) {
  return <ChakraProvider theme={authTheme}>{children}</ChakraProvider>;
}
