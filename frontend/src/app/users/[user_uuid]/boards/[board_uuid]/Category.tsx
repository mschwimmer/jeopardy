import React, { useState, useEffect } from "react";
import { Typography, TextField, styled, Theme } from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  FindGameBoardDocument,
  useUpdateGameBoardCategoryMutation,
} from "@/__generated__/graphql";

// Styled Grid container for Category
const CategoryGrid = styled(Grid)(({ theme }) => ({
  display: "flex",
  height: "16.67%",
  alignItems: "center",
  textAlign: "center",
  border: `2px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.gameBoard.category.main,
  justifyContent: "center",
  cursor: "pointer",
}));

// Common style for text color
const categoryTextColor = (theme: Theme) =>
  theme.palette.gameBoard.category.contrastText;

// Styled Typography for displaying the category
const CategoryTypography = styled(Typography)(({ theme }) => ({
  color: categoryTextColor(theme),
}));

// Styled TextField for editing the category
const CategoryTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-input": {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: theme.typography.h4.fontWeight,
    lineHeight: theme.typography.h4.lineHeight,
    letterSpacing: theme.typography.h4.letterSpacing,
    textAlign: "center",
    color: categoryTextColor(theme),
  },
  "& .MuiInputLabel-root": {
    fontSize: "2.125rem",
    color: categoryTextColor(theme),
  },
}));

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

  useEffect(() => {
    setNewCategory(category);
  }, [category]);

  const handleTextClick = () => {
    setIsEditing(true);
  };

  const handleBlurOrEnter = async () => {
    const finalCategory = newCategory.trim() === "" ? "Blank :(" : newCategory;
    setNewCategory(finalCategory);
    try {
      await updateCategory({
        variables: {
          gameBoardId,
          index: categoryIndex,
          category: finalCategory,
        },
        refetchQueries: [
          {
            query: FindGameBoardDocument,
            variables: { gameBoardId },
          },
        ],
      });
      onUpdateCategory(finalCategory, categoryIndex);
    } catch (e) {
      console.error("Error updating category:", e);
    }
    setIsEditing(false);
  };

  const handleEscape = () => {
    setNewCategory(category);
    setIsEditing(false);
  };

  return (
    <CategoryGrid size={{ xs: 12 / 5 }} onClick={handleTextClick}>
      {isEditing ? (
        <CategoryTextField
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onBlur={handleBlurOrEnter}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleBlurOrEnter();
            } else if (e.key === "Escape") {
              handleEscape();
            }
          }}
          autoFocus
          size="medium"
        />
      ) : (
        <CategoryTypography variant="h4">{newCategory}</CategoryTypography>
      )}
    </CategoryGrid>
  );
};

export default Category;
