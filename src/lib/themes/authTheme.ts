import { extendTheme } from "@chakra-ui/react";

/** Auth / Landing — HandyHub amber-on-dark brand */
export const authTheme = extendTheme({
  colors: {
    brand: {
      50:  "#fff8ee",
      100: "#fdefd5",
      200: "#fbda9e",
      300: "#f8be5c",
      400: "#f5a030",
      500: "#e07b39",
      600: "#c1440e",
      700: "#8c2d07",
      800: "#5c1d04",
      900: "#2a0c00",
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
            _focus: { borderColor: "brand.500", boxShadow: "0 0 0 3px rgba(224,123,57,.15)" },
            _placeholder: { color: "gray.400" },
          },
        },
      },
      defaultProps: { variant: "outline" },
    },
    Button: {
      variants: {
        solid: {
          _hover: { transform: "translateY(-1px)", boxShadow: "0 4px 16px rgba(193,68,14,.35)" },
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
