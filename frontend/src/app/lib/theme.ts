// src/app/lib/theme.ts

import { createTheme, lighten, darken } from "@mui/material/styles";
import { PaletteColorOptions, PaletteColor } from "@mui/material";

declare module "@mui/material/styles" {
  interface Palette {
    gameBoard: {
      category: PaletteColor;
      emptyCell: PaletteColor;
      gameBoardQuestionCell: PaletteColor;
    };
  }
  interface PaletteOptions {
    gameBoard?: {
      category?: PaletteColorOptions;
      emptyCell?: PaletteColorOptions;
      gameBoardQuestionCell?: PaletteColorOptions;
    };
  }
  interface CssVarsPalette {
    gameBoard: {
      category: PaletteColor;
      emptyCell: PaletteColor;
      gameBoardQuestionCell: PaletteColor;
    };
  }
  interface CssVarsPaletteOptions {
    gameBoard?: {
      category?: PaletteColorOptions;
      emptyCell?: PaletteColorOptions;
      gameBoardQuestionCell?: PaletteColorOptions;
    };
  }
}

const basePrimaryColor = "#b65b58";
const baseSecondaryColor = "#58b3b6";
const baseBackgroundColor = "#f1d5d9";
const basePaperColor = "#f8eef0";
const baseInfoColor = "#12343b";
const baseSuccessColor = "#698e9d";
const baseErrorColor = "#EE9CAD";

const categoryColor = "#94504b"; // Example color for Category
const emptyCellColor = "#208585"; // Example color for Empty Cell
const questionCellColor = "#58b3b6"; // Example color for GameBoardQuestionCell

// Step 1: Create the theme with your custom gameBoard colors.
let theme = createTheme({
  palette: {
    gameBoard: {
      category: {
        main: categoryColor,
        light: lighten(categoryColor, 0.2),
        dark: darken(categoryColor, 0.2),
      },
      emptyCell: {
        main: emptyCellColor,
        light: lighten(emptyCellColor, 0.2),
        dark: darken(emptyCellColor, 0.2),
      },
      gameBoardQuestionCell: {
        main: questionCellColor,
        light: lighten(questionCellColor, 0.2),
        dark: darken(questionCellColor, 0.2),
      },
    },
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
      paper: basePaperColor,
    },
    success: { main: baseSuccessColor },
    error: { main: baseErrorColor },
    info: {
      main: baseInfoColor,
      light: lighten(baseInfoColor, 0.2),
      dark: darken(baseInfoColor, 0.2),
    },
    warning: { main: "#F6AB49" },
  },
});

// Step 2: Augment your custom colors so they include contrastText.
// This makes them work like the built-in palette colors—components that use these
// colors will automatically get the appropriate text color.
theme = createTheme(theme, {
  palette: {
    gameBoard: {
      category: theme.palette.augmentColor({
        color: theme.palette.gameBoard.category,
      }),
      emptyCell: theme.palette.augmentColor({
        color: theme.palette.gameBoard.emptyCell,
      }),
      gameBoardQuestionCell: theme.palette.augmentColor({
        color: theme.palette.gameBoard.gameBoardQuestionCell,
      }),
    },
  },
});

export default theme;
