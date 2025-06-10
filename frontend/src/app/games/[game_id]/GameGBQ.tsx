import React, { useState } from "react";
import { GameBoardQuestion } from "@/__generated__/types";
import Grid from "@mui/material/Grid2";
import GameGBQModal from "./GameGBQModal";
import { Typography } from "@mui/material";

interface GameGBQProps {
  gameBoardQuestion: GameBoardQuestion;
  isAnswered: boolean;
  onClick: () => void;
}

const GameGBQ: React.FC<GameGBQProps> = ({
  gameBoardQuestion,
  isAnswered,
  onClick,
}) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    onClick();
    setOpen(true);
  };
  const handleClose = () => {
    // console.log(`triggered handleClose :)`);
    setOpen(false);
  };

  return (
    <Grid
      size={{ xs: 12 / 5 }}
      sx={(theme) => ({
        display: "flex", // Ensure flexbox is enabled
        alignItems: "center",
        justifyContent: "center", // Horizontally center (optional)
        height: "16.67%", // Fixed height of cell
        textAlign: "center",
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: isAnswered
          ? theme.palette.success.dark
          : theme.palette.success.main,
        color: isAnswered
          ? theme.palette.text.secondary
          : theme.palette.text.primary,
        cursor: "pointer",
        "&:hover": {
          backgroundColor: theme.palette.success.light,
        },
        transition: "background-color 0.3s ease",
      })}
      onClick={handleOpen}
    >
      <Typography
        variant="h6"
        sx={{ margin: 0 }}
      >{`$${gameBoardQuestion.mapping.points}`}</Typography>
      <GameGBQModal
        open={open}
        gameBoardQuestion={gameBoardQuestion}
        onClose={handleClose}
      />
    </Grid>
  );
};

export default GameGBQ;
