import React from "react";
import { useRouter } from "next/navigation";
import Grid from "@mui/material/Grid2";
import { useCreateGameMutation } from "@/__generated__/graphql";
import { GameBoard, GameBoardQuestion } from "@/__generated__/types";
import { Button } from "@mui/material";

interface NewGameButtonProps {
  userId: number;
  gameBoard: GameBoard;
  gameBoardQuestions: Record<string, GameBoardQuestion | undefined>;
}

function validateGameBoard(
  gameBoard: GameBoard,
  gameBoardQuestions: Record<string, GameBoardQuestion | undefined>,
  expectedRows = 5
): boolean {
  // Validate each category exists
  if (!gameBoard.categories || gameBoard.categories.length === 0) {
    console.error("No categories found.");
    return false;
  }

  for (let i = 0; i < gameBoard.categories.length; i++) {
    const category = gameBoard.categories[i];
    // If category is null or an empty string, fail
    if (!category || category.trim() === "") {
      console.error(`Category at index ${i} is null or empty.`);
      return false;
    }
  }

  // Validate each cell has a GameBoardQuestion
  for (let col = 0; col < gameBoard.categories.length; col++) {
    for (let row = 0; row < expectedRows; row++) {
      const key = `${row},${col}`;
      const gameBoardQuestion = gameBoardQuestions[key];

      if (!gameBoardQuestion) {
        console.error(
          `Missing question at row=${row}, col=${col}. Key="${key}"`
        );
        return false;
      }
      // If question text or answer is empty
      if (!gameBoardQuestion.question.question?.trim()) {
        console.error(`Empty 'question' field at row=${row}, col=${col}`);
        return false;
      }
      if (!gameBoardQuestion.question.answer?.trim()) {
        console.error(`Empty 'answer' field at row=${row}, col=${col}`);
        return false;
      }
      // Add any other checks: points > 0, etc.
      if (gameBoardQuestion.mapping.points < 0) {
        console.error(`Question with negative point value`);
        return false;
      }
    }
  }
  return true;
}

const NewGameButton: React.FC<NewGameButtonProps> = ({
  userId,
  gameBoard,
  gameBoardQuestions,
}) => {
  const router = useRouter();
  const [createNewGame] = useCreateGameMutation();

  const handleClickNewGame = async () => {
    const validGameBoard: boolean = validateGameBoard(
      gameBoard,
      gameBoardQuestions
    );

    if (validGameBoard) {
      try {
        const newGameResult = await createNewGame({
          variables: { input: { userId, gameBoardId: gameBoard.id } },
        });
        const gameId = newGameResult?.data?.createGame.id;
        router.push(`/games/${gameId}`);
      } catch (error) {
        console.error("Error creating new game:", error);
        alert("An error occured while creating the game");
        throw error;
      }
    } else {
      alert("Cannot create new game with invalid gameboard");
    }
  };

  return (
    <Grid size={{ xs: 12, md: 2 }} sx={{ height: "100%" }}>
      <Button
        size="large"
        variant="contained"
        color="secondary"
        sx={{ maxHeight: "80%" }}
        onClick={() => handleClickNewGame()}
      >
        New Game
      </Button>
    </Grid>
  );
};

export default NewGameButton;
