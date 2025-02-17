"use client";

import { useState } from "react";
import { Button, TextField } from "@mui/material";
// TODO reroute to the new gameboard
// import { useRouter } from "next/router";
import { useCreateGameBoardMutation } from "@/__generated__/graphql";

interface NewGameBoardProps {
  user_uuid: string;
}

export const NewGameBoard: React.FC<NewGameBoardProps> = ({ user_uuid }) => {
  const userId = parseInt(user_uuid, 10);
  const [gameBoardTitle, setGameBoardTitle] = useState("New Gameboard");
  const [createGameBoard] = useCreateGameBoardMutation();

  const handleCreateGameboard = async () => {
    try {
      const { data, errors } = await createGameBoard({
        variables: { input: { title: gameBoardTitle, userId } },
      });

      if (errors) {
        console.error("GraphQL errors:", errors);
        return;
      }

      if (data?.createGameBoard) {
        // reload the page to show the new gameboard
        window.location.reload();
      } else {
        console.error("No gameboard returned from mutation");
      }
    } catch (errors) {
      console.error("Error creating gameboard:", errors);
    }
  };

  return (
    <div>
      <TextField
        label="Gameboard Title"
        type="text"
        value={gameBoardTitle}
        onChange={(e) => setGameBoardTitle(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateGameboard}
      >
        Create Gameboard
      </Button>
    </div>
  );
};
