// src/app/lib/theme.ts

import { createTheme } from "@mui/material/styles";

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

export const theme1 = createTheme({
  palette: {
    primary: { main: "#3C7D9B" },
    secondary: { main: "#F0C0A4" },
    background: {
      default: "#C3AFA2",
      paper: "#C3AFA2",
    },
    success: { main: "#698e9d" },
    error: { main: "#EE9CAD" },
    info: { main: "#CBD69D" },
    warning: { main: "#F6AB49" },
  },
});
