import { extendTheme } from "@chakra-ui/react";
import { navy } from "./brandColors";

/** GoCon contractor portal */
export const vendorTheme = extendTheme({
  colors: {
    navy,
    blue: navy,
    brand: {
      50: "#FAFAFA", 100: "#F4F4F5", 200: "#E4E4E7", 300: "#D4D4D8",
      400: "#A1A1AA", 500: "#18181B", 600: "#09090B", 700: "#09090B",
      800: "#09090B", 900: "#000000",
    },
    accent: {
      400: "#52525B",
      500: "#27272A",
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
