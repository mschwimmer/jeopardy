"use client";

import * as React from "react";
import {
  useFetchPlayersFromGameQuery,
  useCreatePlayerMutation,
  useDeletePlayerMutation,
} from "@/__generated__/graphql";
import QueryResult from "@/app/components/query-result";
import PlayerCard from "./PlayerCard";
import { Fab, Tooltip } from "@mui/material";
import Grid from "@mui/material/Grid2";
import AddIcon from "@mui/icons-material/Add";
import { Remove } from "@mui/icons-material";
import { useGameContext } from "./GameContext";

const Scoreboard: React.FC = () => {
  const { game_uuid } = useGameContext();
  const gameId = parseInt(game_uuid, 10);
  const {
    data,
    loading,
    error,
    refetch: refetchPlayerData,
  } = useFetchPlayersFromGameQuery({
    variables: { gameId },
  });
  const [addPlayer, { loading: addLoading, error: addError }] =
    useCreatePlayerMutation();
  const [deletePlayer, { loading: deleteLoading, error: deleteError }] =
    useDeletePlayerMutation();

  const handleAddPlayer = async () => {
    try {
      const currentCount = data?.fetchPlayersFromGame?.length || 0;
      const newName = `Player ${currentCount + 1}`;
      await addPlayer({
        variables: {
          input: {
            gameId,
            playerName: newName,
          },
        },
      });
      // After this, the refetchQueries kicks in, updating the player list automatically.
      await refetchPlayerData();
    } catch (e) {
      console.error("Error adding player:", e);
    }
  };

  const handleDeletePlayer = async () => {
    try {
      const lastPlayer = data?.fetchPlayersFromGame?.at(-1);
      if (lastPlayer) {
        await deletePlayer({
          variables: {
            playerId: lastPlayer.id,
          },
        });
        await refetchPlayerData();
      }
    } catch (e) {
      console.error("Error deleting player:", e);
    }
  };

  return (
    <QueryResult data={data} loading={loading} error={error}>
      <Grid container spacing={2} sx={{ padding: 2 }}>
        {data?.fetchPlayersFromGame.map((player) => (
          <PlayerCard key={player.id} player={player} />
        ))}
        <Tooltip title="Add Player" aria-label="add player">
          <Fab
            onClick={handleAddPlayer}
            disabled={addLoading} // you can disable if the mutation is in progress
            color="primary"
            aria-label="add"
          >
            <AddIcon />
          </Fab>
        </Tooltip>
        <Tooltip title="Remove Player" aria-label="remove player">
          <Fab
            onClick={handleDeletePlayer}
            disabled={deleteLoading}
            color="secondary"
            aria-label="remove"
          >
            <Remove />
          </Fab>
        </Tooltip>
        {addError && (
          <p style={{ color: "red" }}>
            Error adding player: {addError.message}
          </p>
        )}
        {deleteError && (
          <p style={{ color: "red" }}>
            Error deleting player: {deleteError.message}
          </p>
        )}
      </Grid>
    </QueryResult>
  );
};

export default Scoreboard;
