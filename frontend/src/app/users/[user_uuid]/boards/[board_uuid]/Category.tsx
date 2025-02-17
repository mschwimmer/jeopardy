import React, { useState, useEffect } from "react";
import { Typography, TextField } from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  FindGameBoardDocument,
  useUpdateGameBoardCategoryMutation,
} from "@/__generated__/graphql";

interface CategoryProps {
  category: string;
  categoryIndex: number;
  gameBoardId: number;
  onUpdateCategory: (newCategory: string, index: number) => void;
}

const Category: React.FC<CategoryProps> = ({
  category,
  categoryIndex,
  gameBoardId,
  onUpdateCategory,
}) => {
  const [newCategory, setNewCategory] = useState(category);
  const [isEditing, setIsEditing] = useState(false);
  const [updateCategory] = useUpdateGameBoardCategoryMutation();

  // Update newCategory state when the category prop changes
  useEffect(() => {
    setNewCategory(category);
  }, [category]);

  const handleTextClick = () => {
    setIsEditing(true);
  };

  const handleBlurOrEnter = async () => {
    try {
      if (!newCategory.trim()) {
        alert("Category cannot be empty");
      } else {
        // console.log("Handle blur or enter, about to update category");
        // console.log(newCategory);
        await updateCategory({
          variables: {
            gameBoardId,
            index: categoryIndex,
            category: newCategory,
          },
          refetchQueries: [
            {
              query: FindGameBoardDocument,
              variables: { gameBoardId },
            },
          ],
        });
        onUpdateCategory(newCategory, categoryIndex);
      }
    } catch (e) {
      console.error("Error updating category:", e);
    }
    setIsEditing(false);
  };

  const handleEscape = () => {
    setNewCategory(category); // Reset the category to its original value
    setIsEditing(false); // Exit editing mode
  };

  return (
    <Grid
      size={{ xs: 12 / 5 }}
      sx={(theme) => ({
        display: "flex",
        height: "16.67%",
        alignItems: "center",
        textAlign: "center",
        border: `2px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.primary.main,
        justifyContent: "center",
      })}
      onClick={handleTextClick}
    >
      {isEditing ? (
        <TextField
          value={newCategory}
          // Apply custom styles to match "h4" typography
          sx={(theme) => ({
            "& .MuiInputBase-input": {
              fontSize: theme.typography.h4.fontSize,
              fontWeight: theme.typography.h4.fontWeight,
              lineHeight: theme.typography.h4.lineHeight,
              letterSpacing: theme.typography.h4.letterSpacing,
              textAlign: "center", // Center text horizontally
            },
            // Optional: Adjust the label if using one
            "& .MuiInputLabel-root": {
              fontSize: "2.125rem",
            },
          })}
          onChange={(e) => {
            const trimmedValue = e.target.value.trim();
            if (trimmedValue || e.target.value === "") {
              setNewCategory(e.target.value); // Only set if not purely whitespace
            }
          }}
          onBlur={handleBlurOrEnter}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleBlurOrEnter();
            } else if (e.key === "Escape") {
              handleEscape(); // Cancel the edit on Escape
            }
          }}
          autoFocus
          size="medium"
        />
      ) : (
        <Typography variant="h4" style={{ cursor: "pointer" }}>
          {newCategory}
        </Typography>
      )}
    </Grid>
  );
};

export default Category;
