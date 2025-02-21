// src/app/lib/theme.ts

import { createTheme, lighten, darken } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "var(--font-roboto)",
  },
  colorSchemes: {
    light: true,
    dark: true,
  },
});

export default theme;

const basePrimaryColor = "#2d545e";
const baseSecondaryColor = "#c89666";
const baseBackgroundColor = "#e1b382";
const baseInfoColor = "#12343b";

export const theme1 = createTheme({
  palette: {
    primary: {
      main: basePrimaryColor,
      light: lighten(basePrimaryColor, 0.2),
      dark: darken(basePrimaryColor, 0.2),
    },
    secondary: {
      main: baseSecondaryColor,
      light: lighten(baseSecondaryColor, 0.2),
      dark: darken(baseSecondaryColor, 0.2),
    },
    background: {
      default: baseBackgroundColor,
      paper: lighten(baseBackgroundColor, 0.2),
    },
    success: { main: "#698e9d" },
    error: { main: "#EE9CAD" },
    info: {
      main: baseInfoColor,
      light: lighten(baseInfoColor, 0.2),
      dark: darken(baseInfoColor, 0.2),
    },
    warning: { main: "#F6AB49" },
  },
});
