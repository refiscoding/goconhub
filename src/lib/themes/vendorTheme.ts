import { extendTheme } from "@chakra-ui/react";

/** Handyman/Vendor Portal — Kalahari Desert */
export const vendorTheme = extendTheme({
  colors: {
    brand: {
      50:  "#FFF8F1",
      100: "#FEE9D6",
      200: "#F4A261",
      300: "#F28A4A",
      400: "#E76F51",
      500: "#C1440E",
      600: "#9E370B",
      700: "#3D1F0A",
      800: "#281407",
      900: "#140A03",
    },
    accent: {
      400: "#E76F51",
      500: "#C1440E",
    },
    success: { 500: "#606C38" },
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
