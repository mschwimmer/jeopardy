// src/app/users/[user_uuid]/boards/[board_uuid]/GameBoardGrid.tsx

"use client";
import { useState, ReactElement, useEffect } from "react";
import {
  useFetchGbQsQuery,
  useUpdateMappingMutation,
  FetchGbQsDocument,
} from "@/__generated__/graphql";
import {
  GameBoard,
  GameBoardQuestion,
  UpdateGameBoardMappingInput,
} from "@/__generated__/types";
import Title from "./Title";
import Grid from "@mui/material/Grid2";
import { Paper } from "@mui/material";
import QueryResult from "@/app/components/query-result";
import NewGameButton from "./NewGameButton";
import Category from "./Category";
import GBQCell from "./GBQCell";
import EmptyGBQCell from "./EmptyQBQCell";
import {
  DndContext,
  DragEndEvent,
  useSensors,
  useSensor,
  PointerSensor,
  closestCenter,
} from "@dnd-kit/core";

interface GameBoardGridProps {
  gameBoard: GameBoard;
  userId: number;
}

const GameBoardGrid: React.FC<GameBoardGridProps> = ({ gameBoard, userId }) => {
  // Manage categories as local state
  const [categories, setCategories] = useState<string[]>(
    gameBoard.categories as string[]
  );

  // Eventually provide support for bigger gameboards
  const ROW_COUNT = 5;
  const COL_COUNT = 5;

  const { data, loading, error } = useFetchGbQsQuery({
    variables: { gameBoardId: gameBoard.id },
  });
  const [updateMapping] = useUpdateMappingMutation();

  // Initialize mapping as state
  const [gameBoardQuestionsMap, setGameBoardQuestionsMap] = useState<
    Record<string, GameBoardQuestion>
  >({});

  useEffect(() => {
    if (data?.fetchGameBoardQuestions) {
      const map: Record<string, GameBoardQuestion> = {};
      data.fetchGameBoardQuestions.forEach((gbq) => {
        const { gridRow, gridCol } = gbq.mapping;
        const key = `${gridRow},${gridCol}`;
        map[key] = gbq;
      });
      setGameBoardQuestionsMap(map);
    }
  }, [data]);

  // Create Array of GBQs or Placeholder Cells
  const cells: ReactElement[] = [];
  for (let row = 0; row < ROW_COUNT; row++) {
    for (let col = 0; col < COL_COUNT; col++) {
      const key = `${row},${col}`;
      const gameBoardQuestion = gameBoardQuestionsMap[key];
      cells.push(
        gameBoardQuestion ? (
          <GBQCell key={key} gameBoardQuestion={gameBoardQuestion} id={key} />
        ) : (
          <EmptyGBQCell
            key={key}
            row={row}
            col={col}
            gameBoardId={gameBoard.id}
            userId={userId}
          />
        )
      );
    }
  }

  // Update a specific category after mutation
  const handleUpdateCategory = (newCategory: string, index: number) => {
    const updatedCategories = [...categories];
    updatedCategories[index] = newCategory;
    setCategories(updatedCategories); // Update local state
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Minimum distance to start dragging
      },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (process.env.NODE_ENV !== "production") {
      console.log("Entered handleDragEnd");
      console.log("Active ID:", active?.id);
      console.log("Over ID:", over?.id);
    }

    if (!active || !over) {
      // console.log("Drag ended outside the grid or no valid drop target.");
      return;
    }

    if (active.id !== over.id) {
      const activeKey = active.id; // e.g. "0,1"
      const overKey = over.id; // e.g. "1,1"
      // console.log(`Dragged from ${active.id} to ${over.id}`);

      // Deconstruct active ID
      const [activeRow, activeCol] = active.id
        .toString()
        .split(",")
        .map(Number);
      const [overRow, overCol] = over.id.toString().split(",").map(Number);

      // Retrieve GameBoardQuestion objects if any
      const activeGBQ = gameBoardQuestionsMap[activeKey];
      const overGBQ = gameBoardQuestionsMap[overKey];

      // Create new mapping
      const newMapping = { ...gameBoardQuestionsMap };

      if (activeGBQ && overGBQ) {
        // Swap the two questions
        // console.log("Swapping questions");
        newMapping[activeKey] = overGBQ;
        newMapping[overKey] = activeGBQ;
        // Update GBQ in backend
        const activeGBQInput: UpdateGameBoardMappingInput = {
          boardId: gameBoard.id,
          questionId: activeGBQ.question.id,
          gridRow: overRow,
          gridCol: overCol,
        };
        const overGBQInput: UpdateGameBoardMappingInput = {
          boardId: gameBoard.id,
          questionId: overGBQ.question.id,
          gridRow: activeRow,
          gridCol: activeCol,
        };

        await updateMapping({
          variables: { input: activeGBQInput },
        });
        await updateMapping({
          variables: { input: overGBQInput },
          refetchQueries: [
            {
              query: FetchGbQsDocument,
              variables: { gameBoardId: gameBoard.id },
            },
          ],
        });
      } else if (activeGBQ && !overGBQ) {
        // Move active question to the empty cell
        // console.log("Moving question to empty cell");
        newMapping[overKey] = activeGBQ;
        delete newMapping[activeKey];
        // Update GBQ in backend
        const activeGBQInput: UpdateGameBoardMappingInput = {
          boardId: gameBoard.id,
          questionId: activeGBQ.question.id,
          gridRow: overRow,
          gridCol: overCol,
        };
        await updateMapping({
          variables: { input: activeGBQInput },
          refetchQueries: [
            {
              query: FetchGbQsDocument,
              variables: { gameBoardId: gameBoard.id },
            },
          ],
        });
      } else if (!activeGBQ && overGBQ) {
        // console.log("Can't move empty cell to filled cell");
        // Optionally handle dragging empty cell to a filled cell
        return;
      }

      // Update the gameBoardQuestions mapping
      setGameBoardQuestionsMap(newMapping);
    } else {
      // console.log("Dragged to the same position, no changes made.");
    }
  };

  return (
    <Paper
      sx={{
        padding: 2,
        width: "100%",
        height: "100vh",
        margin: "auto",
      }}
    >
      <Grid
        container
        alignItems={"stretch"}
        sx={{
          minHeight: "10%",
        }}
      >
        <Title title={gameBoard.title} gameBoardId={gameBoard.id} />
        <NewGameButton
          userId={userId}
          gameBoard={gameBoard}
          gameBoardQuestions={gameBoardQuestionsMap}
        />
      </Grid>
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCenter}
      >
        <Grid
          container
          sx={{ height: "90%", textAlign: "center", alignItems: "stretch" }}
        >
          <QueryResult error={error} loading={loading} data={data}>
            {categories.map((category: string, index: number) => (
              <Category
                key={`$0-${index}`}
                category={category}
                categoryIndex={index}
                gameBoardId={gameBoard.id}
                onUpdateCategory={handleUpdateCategory}
              />
            ))}
            {cells}
          </QueryResult>
        </Grid>
      </DndContext>
    </Paper>
  );
};

export default GameBoardGrid;
