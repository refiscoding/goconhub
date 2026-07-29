import { extendTheme } from "@chakra-ui/react";

/** GoCon monochrome brand */
export const authTheme = extendTheme({
  colors: {
    brand: {
      50: "#fafafa", 100: "#f4f4f5", 200: "#e4e4e7", 300: "#d4d4d8",
      400: "#a1a1aa", 500: "#18181b", 600: "#09090b", 700: "#09090b",
      800: "#09090b", 900: "#000000",
    },
  },
  fonts: {
    heading: "'Sora', 'Segoe UI', sans-serif",
    body:    "'Nunito', 'Helvetica Neue', sans-serif",
  },
  config: { initialColorMode: "light", useSystemColorMode: false },
  components: {
    Input: {
      variants: {
        outline: {
          field: {
            borderColor: "gray.200",
            bg: "white",
            _hover: { borderColor: "brand.400" },
            _focus: { borderColor: "brand.600", boxShadow: "0 0 0 3px rgba(0,0,0,.14)" },
            _placeholder: { color: "gray.400" },
          },
        },
      },
      defaultProps: { variant: "outline" },
    },
    Button: {
      variants: {
        solid: {
          _hover: { transform: "translateY(-1px)", boxShadow: "0 4px 16px rgba(0,0,0,.2)" },
          _active: { transform: "translateY(0)" },
          transition: "all .2s",
        },
        ghost: {
          _hover: { bg: "gray.100", transform: "translateY(-1px)" },
          transition: "all .2s",
        },
      },
    },
  },
});
