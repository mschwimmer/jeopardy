// src/app/components/PlayerCard.tsx

import React, { useState } from "react";
import {
  Card,
  CardContent,
  TextField,
  Typography,
  IconButton,
  Divider,
  Tooltip,
} from "@mui/material";
import { Player } from "@/__generated__/types";
import Grid from "@mui/material/Grid2";
import {
  useUpdatePlayerNameMutation,
  useUpdatePlayerScoreMutation,
} from "@/__generated__/graphql";
import { ArrowDropUp, ArrowDropDown } from "@mui/icons-material";
import { useGameContext } from "./GameContext";

interface PlayerCardProps {
  player: Player;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [playerName, setPlayerName] = useState(player.playerName);
  const [updateName] = useUpdatePlayerNameMutation();
  const [updateScore] = useUpdatePlayerScoreMutation();
  const [currentScore, setScore] = useState(player.score);
  const { currentGameBoardQuestion } = useGameContext();

  const handleTextClick = () => {
    setIsEditing(true);
  };

  const handleBlurOrEnter = async () => {
    // Call the mutation to update the player name
    try {
      await updateName({
        variables: {
          playerId: player.id,
          newName: playerName,
        },
      });
    } catch (e) {
      console.error("Error updating player name:", e);
    }
    setIsEditing(false);
  };

  const handleClickArrowUp = () => {
    const questionPoints = currentGameBoardQuestion?.mapping.points || 0;
    const updatedScore = currentScore + questionPoints;
    setScore(updatedScore);
    // console.log("Updated score", updatedScore);
    try {
      updateScore({
        variables: {
          playerId: player.id,
          newScore: updatedScore,
        },
      });
    } catch (e) {
      console.error("Error updating player score:", e);
    }
  };

  const handleClickArrowDown = () => {
    const questionPoints = currentGameBoardQuestion?.mapping.points || 0;
    const updatedScore = currentScore - questionPoints;
    setScore(updatedScore);
    // console.log("Updated score", updatedScore);
    try {
      updateScore({
        variables: {
          playerId: player.id,
          newScore: updatedScore,
        },
      });
    } catch (e) {
      console.error("Error updating player score:", e);
    }
  };

  return (
    <Card>
      <CardContent>
        <Grid container justifyContent="center" spacing={2}>
          {isEditing ? (
            <TextField
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onBlur={handleBlurOrEnter}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleBlurOrEnter();
                }
              }}
              autoFocus
              size="small"
            />
          ) : (
            <Tooltip title="Click to edit player name">
              <Typography
                variant="h5"
                component="h2"
                onClick={handleTextClick}
                style={{ cursor: "pointer" }}
              >
                {playerName}
              </Typography>
            </Tooltip>
          )}
        </Grid>
        <Divider />
        <Grid container justifyContent="center" spacing={2}>
          <Tooltip title="Add prev question points">
            <IconButton onClick={handleClickArrowUp}>
              <ArrowDropUp />
            </IconButton>
          </Tooltip>
          <Typography color="textSecondary">{currentScore}</Typography>
          <Tooltip title="Remove prev question points">
            <IconButton onClick={handleClickArrowDown}>
              <ArrowDropDown />
            </IconButton>
          </Tooltip>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PlayerCard;
