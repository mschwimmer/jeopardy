import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField,
  Typography,
  styled,
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

const EmptyGBQCellContainer = styled(Grid, {
  shouldForwardProp: (prop) => prop !== "isOver",
})<{ isOver: boolean }>(({ theme, isOver }) => ({
  height: "16.67%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  border: `1px solid ${theme.palette.divider}`,
  color: theme.palette.gameBoard.emptyCell.contrastText,
  backgroundColor: isOver
    ? theme.palette.gameBoard.emptyCell.dark
    : theme.palette.gameBoard.emptyCell.main,
  padding: theme.spacing(2),
  cursor: "pointer",
  transition: "background-color 0.3s ease",
  "&:hover": {
    backgroundColor: theme.palette.gameBoard.emptyCell.light,
  },
}));

const CellText = styled(Typography)({
  margin: "auto",
});

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
  const [createQuestion] = useCreateQuestionMutation();
  const [createGameBoardMapping] = useCreateMappingMutation();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDailyDoubleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDailyDouble(event.target.checked);
  };

  const handleSave = async () => {
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

    const gameBoardMappingInput: CreateGameBoardMappingInput = {
      boardId: gameBoardId,
      questionId: newQuestionId,
      dailyDouble,
      gridRow: row,
      gridCol: col,
      points: 100 * (row + 1),
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
    <EmptyGBQCellContainer
      ref={setNodeRef}
      size={{ xs: 12 / 5 }}
      isOver={isOver}
      onClick={handleOpen}
    >
      <CellText variant="h6">Click to create question</CellText>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create Question</DialogTitle>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </EmptyGBQCellContainer>
  );
};

export default EmptyGBQCell;
