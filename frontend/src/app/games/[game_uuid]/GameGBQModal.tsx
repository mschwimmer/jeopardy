import * as React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogActions,
  Button,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import { GameBoardQuestion } from "@/__generated__/types";

interface GameGBQModalProps {
  open: boolean;
  gameBoardQuestion: GameBoardQuestion;
  onClose: () => void;
}

const GameGBQModal: React.FC<GameGBQModalProps> = ({
  open,
  gameBoardQuestion,
  onClose,
}) => {
  const [revealAnswer, setRevealAnswer] = useState(false);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{
        minHeight: "50vh",
        maxHeight: "80vh",
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setRevealAnswer(true);
        }
      }}
    >
      <DialogContent sx={{ padding: 4 }}>
        <DialogContentText sx={{ fontSize: 75 }}>
          Question: {gameBoardQuestion.question.question}
        </DialogContentText>
        {revealAnswer ? (
          <DialogContentText sx={{ fontSize: 30 }}>
            Answer: {gameBoardQuestion.question.answer}
          </DialogContentText>
        ) : (
          <DialogContentText sx={{ fontSize: 30 }}>
            Press SPACE or ENTER to reveal answer{" "}
          </DialogContentText>
        )}
        <DialogContentText sx={{ fontSize: 30 }}>
          Points: {gameBoardQuestion.mapping.points}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
        >
          Press ESC to close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GameGBQModal;
