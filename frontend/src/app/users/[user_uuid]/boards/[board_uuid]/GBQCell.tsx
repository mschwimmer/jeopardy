// src/app/users/[user_uuid]/boards/[board_uuid]/GBQCell.tsx

import React from "react";
import { GameBoardQuestion } from "@/__generated__/types";
import Grid from "@mui/material/Grid2";
import { useState } from "react";
import EditQuestionModal from "./EditQuestionModal";
import { Typography, styled, Theme } from "@mui/material";
import { useDraggable, useDroppable } from "@dnd-kit/core";

interface GBQCellProps {
  gameBoardQuestion: GameBoardQuestion;
  id: string;
}

// Define a prop interface for our styled container to accept dynamic styling.
interface GBQCellContainerProps {
  isOver: boolean;
}

// Styled container for the GBQ cell. We filter out `isOver` from being passed to the DOM.
const GBQCellContainer = styled(Grid, {
  shouldForwardProp: (prop) => prop !== "isOver",
})<GBQCellContainerProps>(({ theme, isOver }) => ({
  height: "16.67%",
  overflow: "hidden",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  border: `1px solid ${theme.palette.divider}`,
  color: theme.palette.gameBoard.gameBoardQuestionCell.contrastText,
  backgroundColor: isOver
    ? theme.palette.gameBoard.gameBoardQuestionCell.dark
    : theme.palette.gameBoard.gameBoardQuestionCell.main,
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.palette.gameBoard.gameBoardQuestionCell.light,
  },
  transition: "background-color 0.3s ease",
  flexDirection: "column",
}));

// Styled component for the question text.
// This computes the height dynamically using theme typography settings.
const QuestionTypography = styled(Typography)(({ theme }: { theme: Theme }) => {
  const lineHeightNumber = theme.typography.h6.lineHeight as number;
  const fontSizeRem = parseFloat(theme.typography.h6.fontSize as string);
  const spacingPx = parseInt(theme.spacing(1), 10);
  const baseFontSizePx = 16; // Base HTML font size in pixels
  const fontSizePx = fontSizeRem * baseFontSizePx;
  const computedHeight = lineHeightNumber * fontSizePx * 2 + spacingPx;
  return {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    padding: theme.spacing(1),
    margin: "auto",
    textOverflow: "ellipsis",
    overflow: "hidden",
    height: computedHeight,
  };
});

// Styled component for the points text.
const PointsTypography = styled(Typography)({
  margin: "auto",
});

const GBQCell: React.FC<GBQCellProps> = ({ gameBoardQuestion, id }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [open, setOpen] = useState(false);

  const handleOpen = (e: React.MouseEvent) => {
    // Prevent opening modal when clicking the drag handle
    if ((e.target as HTMLElement).closest("button")) return;
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const {
    attributes: draggableAttributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
    isDragging,
  } = useDraggable({
    id,
  });

  const { isOver, setNodeRef: setDroppableRef } = useDroppable({ id });

  const setNodeRef = (node: HTMLElement | null) => {
    setDraggableRef(node);
    setDroppableRef(node);
  };

  const style = {
    transform: transform
      ? `translate3d(${transform?.x}px, ${transform?.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <GBQCellContainer
      ref={setNodeRef}
      size={{ xs: 12 / 5 }}
      style={style}
      isOver={isOver}
      {...draggableAttributes}
      {...listeners}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleOpen}
    >
      <QuestionTypography variant="h6">
        {isHovered
          ? gameBoardQuestion.question.answer
          : gameBoardQuestion.question.question}
      </QuestionTypography>
      <PointsTypography variant="body1">
        {gameBoardQuestion.mapping.points}
      </PointsTypography>
      <EditQuestionModal
        open={open}
        gameBoardQuestion={gameBoardQuestion}
        onClose={handleClose}
      />
    </GBQCellContainer>
  );
};

export default GBQCell;
