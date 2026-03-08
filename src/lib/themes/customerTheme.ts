import { extendTheme } from "@chakra-ui/react";

/** Customer Portal — Okavango Delta */
export const customerTheme = extendTheme({
  colors: {
    brand: {
      50:  "#F0F9FF",
      100: "#E0F4FE",
      200: "#90E0EF",
      300: "#48CAE4",
      400: "#00B4D8",
      500: "#0077B6",
      600: "#005F92",
      700: "#023E58",
      800: "#012A3A",
      900: "#01181F",
    },
    accent: {
      400: "#00B4D8",
      500: "#0096C7",
    },
    success: { 500: "#2D9A4E" },
  },
  semanticTokens: {
    colors: {
      "portal.primary":  "brand.500",
      "portal.light":    "brand.200",
      "portal.accent":   "accent.400",
      "portal.surface":  "brand.50",
      "portal.text":     "brand.700",
      "portal.success":  "success.500",
    },
  },
  fonts: {
    heading: "'Sora', sans-serif",
    body:    "'Nunito', 'Helvetica Neue', sans-serif",
    mono:    "'DM Mono', monospace",
  },
  config: { initialColorMode: "light", useSystemColorMode: false },
  styles: {
    global: {
      body: { bg: "brand.50", color: "brand.700" },
    },
  },
});
