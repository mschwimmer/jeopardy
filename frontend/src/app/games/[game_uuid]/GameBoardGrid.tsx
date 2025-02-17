// src/app/games/[game_uuid]/GameBoardGrid.tsx

"use client";
import { GameBoard, GameBoardQuestion } from "@/__generated__/graphql";
import { useFetchGbQsQuery } from "@/__generated__/graphql";
import { ReactElement, useMemo, useState } from "react";
import QueryResult from "@/app/components/query-result";
import GameGBQ from "./GameGBQ";
import GameCategory from "./GameCategory";
import { useGameContext } from "./GameContext";
import Grid from "@mui/material/Grid2";
import { Paper } from "@mui/material";

interface GameBoardGridProps {
  gameBoard: GameBoard;
}

const GameBoardGrid: React.FC<GameBoardGridProps> = ({ gameBoard }) => {
  const { setCurrentGameBoardQuestion } = useGameContext();
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(
    new Set()
  );
  const { data, loading, error } = useFetchGbQsQuery({
    variables: { gameBoardId: gameBoard.id },
  });

  const gameBoardQuestions = useMemo(() => {
    if (!data?.fetchGameBoardQuestions) return {};
    const map: Record<string, GameBoardQuestion> = {};
    data.fetchGameBoardQuestions.forEach((gbq) => {
      const { gridRow, gridCol } = gbq.mapping;
      const key = `${gridRow},${gridCol}`;
      map[key] = gbq;
    });
    return map;
  }, [data]);

  const handleClickQuestionCell = (gameBoardQuestion: GameBoardQuestion) => {
    // console.log("Clicked question:", gameBoardQuestion);
    // Set the current question in the context
    setCurrentGameBoardQuestion(gameBoardQuestion);
    setAnsweredQuestions((prev) =>
      new Set(prev).add(gameBoardQuestion.question.id)
    );
  };

  const cells: ReactElement[] = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const key = `${row},${col}`;
      const gameBoardQuestion = gameBoardQuestions[key];
      cells.push(
        <GameGBQ
          key={key}
          gameBoardQuestion={gameBoardQuestion}
          isAnswered={answeredQuestions.has(gameBoardQuestion?.question.id)}
          onClick={() => handleClickQuestionCell(gameBoardQuestion)}
        />
      );
    }
  }

  return (
    <Paper
      sx={{
        padding: 2,
        width: "75%",
        height: "80vh",
        margin: "auto",
      }}
    >
      <Grid
        container
        spacing={0}
        sx={{
          height: "100%",
          textAlign: "center",
          alignItems: "stretch",
        }}
      >
        <QueryResult error={error} loading={loading} data={data}>
          {(gameBoard.categories as string[]).map(
            (category: string, index: number) => (
              <GameCategory key={`$0-${index}`} category={category} />
            )
          )}
          {cells}
        </QueryResult>
      </Grid>
    </Paper>
  );
};

export default GameBoardGrid;
