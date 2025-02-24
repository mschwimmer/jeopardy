//src/app/questions/QuestionsDashboard.tsx
"use client";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";
import { Question } from "@/__generated__/types";
import React from "react";

interface QuestionsDashboardProps {
  questions: Question[];
}

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 70 },
  {
    field: "question",
    headerName: "Question",
    flex: 1,
    minWidth: 300,
  },
  {
    field: "answer",
    headerName: "Answer",
    flex: 1,
    minWidth: 200,
  },
  { field: "userId", headerName: "User ID", width: 100 },
  {
    field: "createdAt",
    headerName: "Created",
    width: 180,
    valueGetter: (_, row) =>
      new Date(row.createdAt).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
  },
];

const QuestionsDashboard: React.FC<QuestionsDashboardProps> = ({
  questions,
}) => {
  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Typography variant="h4" gutterBottom>
        All User Generated Questions
      </Typography>
      <DataGrid<Question>
        rows={questions}
        columns={columns}
        pageSizeOptions={[5]}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        disableRowSelectionOnClick
        getRowId={(row) => row.id}
      />
    </Box>
  );
};

export default QuestionsDashboard;
