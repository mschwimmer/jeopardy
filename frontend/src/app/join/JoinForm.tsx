"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  CircularProgress,
  FormControl,
  FormLabel,
  TextField,
  Typography,
} from "@mui/material";
import {
  useCreatePlayerMutation,
  useFindGameFromRoomCodeLazyQuery,
} from "@/__generated__/graphql";

export default function JoinForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [generalError, setGeneralError] = React.useState("");
  const [formData, setFormData] = React.useState({
    room_code: "",
    name: "",
  });
  const [addPlayer, { loading: addLoading, error: addError }] =
    useCreatePlayerMutation();
  const [findGame, { loading: findLoading, error: findError }] =
    useFindGameFromRoomCodeLazyQuery();
  const queryLoading = addLoading || findLoading;
  const queryError = addError || findError;

  const [formErrors, setFormErrors] = React.useState({
    room_code: { error: false, message: "" },
    name: { error: false, message: "" },
  });
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    validateField(name, value);
  };

  const validateField = (name: string, value: string) => {
    const newErrors = { ...formErrors };

    switch (name) {
      case "room_code":
        if (!value) {
          newErrors.room_code = { error: true, message: "Game ID is required" };
        } else if (!/^\d+$/.test(value)) {
          newErrors.room_code = {
            error: true,
            message: "Room Code must be a 6 character alphanumeric",
          };
        } else {
          newErrors.room_code = { error: false, message: "" };
        }
        break;
      case "name":
        if (!value) {
          newErrors.name = { error: true, message: "Name is required" };
        } else {
          newErrors.name = { error: false, message: "" };
        }
        break;
    }
    setFormErrors(newErrors);
  };

  const validateAllFields = () => {
    validateField("room_code", formData.room_code);
    validateField("name", formData.name);

    return !(formErrors.room_code.error || formErrors.name.error);
  };

  const handleJoinGame = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError("");
    if (!validateAllFields()) {
      return;
    }

    setIsLoading(true);

    try {
      // Have user join game here
      // First fetch game by room code
      const gameResult = await findGame({
        variables: { roomCode: formData.room_code },
      });
      const game = gameResult.data?.findGameByRoomCode;
      if (!game) {
        setGeneralError("Game not found.");
        return;
      }

      // Second create player in backend
      const playerResult = await addPlayer({
        variables: {
          input: {
            gameId: game.id,
            playerName: formData.name,
          },
        },
      });
      const player = playerResult.data?.createPlayer;
      if (!player) {
        setGeneralError("Failed to create player.");
        return;
      }
      // Then redirect to player page using new player's ID
      // and the room code
      router.push(`/join/${game.roomCode}/${player.id}`);
    } catch (error) {
      // Handle error here
      console.error("Error joining game:", error);
      setGeneralError("Failed to join game. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Typography
        component="h1"
        variant="h4"
        sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
      >
        Join Game!
      </Typography>
      <Box
        component="form"
        method="post"
        onSubmit={handleJoinGame}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        {generalError && (
          <Alert severity="error" sx={{ width: "100%" }}>
            {generalError}
          </Alert>
        )}
        <FormControl>
          <FormLabel htmlFor="room_code">Room Code</FormLabel>
          <TextField
            autoComplete="room_code"
            name="room_code"
            required
            fullWidth
            id="room_code"
            value={formData.room_code}
            onChange={handleInputChange}
            error={formErrors.room_code.error}
            helperText={formErrors.room_code.message}
            color={formErrors.room_code.error ? "error" : "primary"}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="name">Your Nickname</FormLabel>
          <TextField
            autoComplete="name"
            name="name"
            required
            fullWidth
            id="name"
            value={formData.name}
            onChange={handleInputChange}
            error={formErrors.name.error}
            helperText={formErrors.name.message}
            color={formErrors.name.error ? "error" : "primary"}
          />
        </FormControl>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          disabled={isLoading}
        >
          {" "}
          {isLoading || queryLoading ? (
            <>
              <CircularProgress
                size={40}
                sx={{ position: "absolute", color: "primary.light" }}
              />
              Joining game...
            </>
          ) : (
            "Join Game Room"
          )}
        </Button>
        {queryError && (
          <Alert severity="error" sx={{ width: "100%" }}>
            {queryError.message}
          </Alert>
        )}
      </Box>
    </div>
  );
}
