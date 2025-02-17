import React, { useState } from "react";
import { Typography, TextField } from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  useUpdateGameBoardTitleMutation,
  FindGameBoardDocument,
} from "@/__generated__/graphql";

interface TitleProps {
  title: string;
  gameBoardId: number;
}

const Title: React.FC<TitleProps> = ({ title, gameBoardId }) => {
  const [newTitle, setNewTitle] = useState(title);
  const [isEditing, setIsEditing] = useState(false);
  const [updateTitle] = useUpdateGameBoardTitleMutation({
    variables: { boardId: gameBoardId, title: newTitle },
    refetchQueries: [
      {
        query: FindGameBoardDocument,
        variables: { gameBoardId },
      },
    ],
  });

  const handleTextClick = () => {
    setIsEditing(true);
  };

  const handleBlurOrEnter = async () => {
    try {
      await updateTitle();
    } catch (e) {
      console.error("Error updating title:", e);
    }
    setIsEditing(false);
  };

  const handleEscape = () => {
    setNewTitle(title); // Reset the category to its original value
    setIsEditing(false); // Exit editing mode
  };

  return (
    <Grid size={{ xs: 12, md: 10 }} sx={{ height: "100%" }}>
      {isEditing ? (
        <TextField
          variant="standard"
          helperText="Press Enter to save, Esc to cancel"
          sx={(theme) => ({
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
          })}
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onBlur={handleBlurOrEnter}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleBlurOrEnter();
            } else if (e.key === "Escape") {
              handleEscape(); // Cancel the edit on Escape
            }
          }}
          autoFocus
          fullWidth
        />
      ) : (
        <Typography
          variant="h2"
          onClick={handleTextClick}
          style={{ cursor: "pointer" }}
        >
          {newTitle}
        </Typography>
      )}
    </Grid>
  );
};

export default Title;
