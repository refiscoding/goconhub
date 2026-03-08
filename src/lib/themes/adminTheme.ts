import { extendTheme } from "@chakra-ui/react";

/** Admin Dashboard — Botswana Flag */
export const adminTheme = extendTheme({
  colors: {
    brand: {
      50:  "#F4F6FB",
      100: "#DCE4F2",
      200: "#4A7CC7",
      300: "#2F62B5",
      400: "#1B4EA0",
      500: "#1B3A6B",
      600: "#142D54",
      700: "#0D1B2A",
      800: "#08101A",
      900: "#04080D",
    },
    accent: {
      300: "#D4B96A",
      400: "#C9A84C",
      500: "#B8943A",
    },
    danger: { 500: "#C0392B" },
  },
  semanticTokens: {
    colors: {
      "portal.primary":  "brand.500",
      "portal.light":    "brand.200",
      "portal.accent":   "accent.400",
      "portal.surface":  "brand.50",
      "portal.text":     "brand.700",
      "portal.danger":   "danger.500",
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
