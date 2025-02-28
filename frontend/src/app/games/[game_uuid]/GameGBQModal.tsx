import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  Button,
  DialogContent,
  DialogContentText,
  Divider,
  styled,
} from "@mui/material";
import { GameBoardQuestion } from "@/__generated__/types";

// Styled DialogContent for modal content
const ModalContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(4),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  textAlign: "center",
  backgroundColor: theme.palette.gameBoard.category.main,
}));

// Styled DialogContentText for the question text
const QuestionText = styled(DialogContentText)(({ theme }) => ({
  color: theme.palette.gameBoard.category.contrastText,
  textAlign: "left", // Ensures the text is centered
  fontSize: "40px",
  fontWeight: 700, // Makes the text bold for better legibility
  lineHeight: 1.2, // Provides a bit more space between lines
  marginBottom: theme.spacing(2),
  [theme.breakpoints.up("md")]: {
    fontSize: "75px", // Scales up the text for larger screens
  },
}));

// Styled DialogContentText for the answer text or prompt
const AnswerText = styled(DialogContentText)(({ theme }) => ({
  color: theme.palette.gameBoard.category.contrastText,
  fontSize: "20px",
  marginBottom: theme.spacing(2),
  [theme.breakpoints.up("md")]: {
    fontSize: "30px",
  },
}));

// Styled DialogContentText for the points display
const PointsText = styled(DialogContentText)(({ theme }) => ({
  color: theme.palette.gameBoard.category.contrastText,
  fontSize: "20px",
  [theme.breakpoints.up("md")]: {
    fontSize: "30px",
  },
}));

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
      fullScreen
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setRevealAnswer(true);
        }
      }}
    >
      <ModalContent>
        <QuestionText>{gameBoardQuestion.question.question}</QuestionText>
        <Divider variant="middle" sx={{ width: "80%", my: 2 }} />
        {revealAnswer ? (
          <AnswerText>{gameBoardQuestion.question.answer}</AnswerText>
        ) : (
          <AnswerText>Press SPACE or ENTER to reveal answer</AnswerText>
        )}
        <PointsText>Points: {gameBoardQuestion.mapping.points}</PointsText>
      </ModalContent>
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
