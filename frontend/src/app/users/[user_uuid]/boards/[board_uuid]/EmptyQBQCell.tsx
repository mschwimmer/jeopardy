// src/app/users/[user_uuid]/boards/[board_uuid]/EmptyGBQCell.tsx

import {
  Button,
  Box,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  MenuItem,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useState } from "react";
import {
  useCreateQuestionMutation,
  useCreateMappingMutation,
  FetchGbQsDocument,
  CreateQuestionInput,
  CreateGameBoardMappingInput,
} from "@/__generated__/graphql";
import { useDroppable } from "@dnd-kit/core";

interface EmptyQBQCellProps {
  row: number;
  col: number;
  gameBoardId: number;
  userId: number;
}

const EmptyGBQCell: React.FC<EmptyQBQCellProps> = ({
  row,
  col,
  gameBoardId,
  userId,
}) => {
  const [open, setOpen] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState<string>("");
  const [editedAnswer, setEditedAnswer] = useState<string>("");
  const [dailyDouble, setDailyDouble] = useState<boolean>(false);
  const [points, setPoints] = useState<number>((row + 1) * 100);
  const [createQuestion] = useCreateQuestionMutation();
  const [createGameBoardMapping] = useCreateMappingMutation();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDailyDoubleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDailyDouble(event.target.checked);
  };

  const handlePointsChange = (event: SelectChangeEvent<number>) => {
    setPoints(event.target.value as number);
  };

  const handleSave = async () => {
    // Validate input
    if (!editedQuestion.trim() || !editedAnswer.trim()) {
      alert("Question or Answer can't be empty dude");
      return;
    }

    const questionInput: CreateQuestionInput = {
      question: editedQuestion,
      answer: editedAnswer,
      userId,
    };

    const newQuestion = await createQuestion({
      variables: { input: questionInput },
    });

    if (!newQuestion.data?.createQuestion?.id) {
      throw new Error("Failed to create new question");
    }

    const newQuestionId = newQuestion.data.createQuestion.id;

    if (points == 100) {
      setPoints(points * (row + 1));
    }

    const gameBoardMappingInput: CreateGameBoardMappingInput = {
      boardId: gameBoardId,
      questionId: newQuestionId,
      dailyDouble,
      gridRow: row,
      gridCol: col,
      points,
    };

    await createGameBoardMapping({
      variables: { input: gameBoardMappingInput },
      refetchQueries: [
        { query: FetchGbQsDocument, variables: { gameBoardId } },
      ],
    });
    handleClose();
  };

  const id = `${row},${col}`;
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <Grid
      ref={setNodeRef}
      size={{ xs: 12 / 5 }}
      sx={(theme) => ({
        height: "16.67%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: isOver
          ? theme.palette.action.hover
          : theme.palette.secondary.main,
        padding: 2,
        cursor: "pointer",
        "&:hover": {
          backgroundColor: theme.palette.secondary.dark,
        },
        transition: "background-color 0.3s ease",
      })}
      onClick={handleOpen}
    >
      <Box
        component={Typography}
        variant="h6"
        sx={{ margin: "auto" }}
      >{`Click to create question`}</Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{"Create Question"}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            multiline
            minRows={4}
            label="Question"
            fullWidth
            value={editedQuestion}
            onChange={(e) => setEditedQuestion(e.target.value)}
            required
          />
          <TextField
            margin="dense"
            multiline
            minRows={4}
            label="Answer"
            fullWidth
            value={editedAnswer}
            onChange={(e) => setEditedAnswer(e.target.value)}
            required
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={dailyDouble}
                onChange={handleDailyDoubleChange}
                color="primary"
              />
            }
            label="Daily Double"
            sx={{ marginTop: 2 }}
          />
          <FormControl fullWidth margin="dense" required>
            <InputLabel id="points-select-label">Points</InputLabel>
            <Select
              margin="dense"
              label="Points"
              fullWidth
              value={points}
              onChange={handlePointsChange}
              required
            >
              <MenuItem value={100}>100</MenuItem>
              <MenuItem value={200}>200</MenuItem>
              <MenuItem value={300}>300</MenuItem>
              <MenuItem value={400}>400</MenuItem>
              <MenuItem value={500}>500</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {"Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default EmptyGBQCell;
