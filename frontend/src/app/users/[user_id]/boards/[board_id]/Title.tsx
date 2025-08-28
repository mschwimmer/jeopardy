import React, { useState } from "react";
import { Typography, TextField, styled, Theme } from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  useUpdateGameBoardTitleMutation,
  FindGameBoardDocument,
} from "@/__generated__/graphql";

interface TitleProps {
  title: string;
  gameBoardId: number;
}

const TitleContainer = styled(Grid)(({ theme }: { theme: Theme }) => ({
  height: "100%",
  color: theme.palette.getContrastText(theme.palette.background.paper),
}));

const DisplayTypography = styled(Typography)({
  cursor: "pointer",
});

const StyledTextField = styled(TextField)(({ theme }: { theme: Theme }) => ({
  "& .MuiInputBase-root": {
    margin: 0,
    padding: 0,
    lineHeight: theme.typography.h2.lineHeight,
  },
  "& .MuiInputBase-input": {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    lineHeight: theme.typography.h2.lineHeight,
    letterSpacing: theme.typography.h2.letterSpacing,
  },
}));

const Title: React.FC<TitleProps> = ({ title, gameBoardId }) => {
  const [newTitle, setNewTitle] = useState(title);
  const [isEditing, setIsEditing] = useState(false);
  const [updateTitle] = useUpdateGameBoardTitleMutation();

  const handleTextClick = () => {
    setIsEditing(true);
  };

  const handleBlurOrEnter = async () => {
    const finalTitle =
      newTitle.trim() === "" ? "Blank Gameboard Title :(" : newTitle;
    setNewTitle(finalTitle);
    try {
      await updateTitle({
        variables: { boardId: gameBoardId, title: finalTitle },
        refetchQueries: [
          {
            query: FindGameBoardDocument,
            variables: { gameBoardId },
          },
        ],
      });
    } catch (e) {
      console.error("Error updating title:", e);
    }
    setIsEditing(false);
  };

  const handleEscape = () => {
    setNewTitle(title);
    setIsEditing(false);
  };

  return (
    <TitleContainer size={{ xs: 12, md: 10 }}>
      {isEditing ? (
        <StyledTextField
          variant="standard"
          helperText="Press Enter to save, Esc to cancel"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onBlur={handleBlurOrEnter}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleBlurOrEnter();
            } else if (e.key === "Escape") {
              handleEscape();
            }
          }}
          autoFocus
          fullWidth
        />
      ) : (
        <DisplayTypography variant="h2" onClick={handleTextClick}>
          {newTitle}
        </DisplayTypography>
      )}
    </TitleContainer>
  );
};

export default Title;
