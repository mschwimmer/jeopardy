//src/app/questions/QuestionsDashboard.tsx
"use client";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";
import React from "react";
import {
  FetchAllQuestionsQuery,
  useFetchAllQuestionsQuery,
} from "@/__generated__/graphql";

type QuestionDisplayRow = NonNullable<
  FetchAllQuestionsQuery["fetchAllQuestions"]
>[number];

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
  {
    field: "user",
    headerName: "Author",
    minWidth: 150,
    valueGetter: (_, row) => row?.user.username || "Unknown",
  },
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

export default function QuestionsDashboard() {
  const { data, loading, error } = useFetchAllQuestionsQuery();

  if (loading) return <p>Loading...</p>;
  if (error) {
    console.error("Error loading questions:", error);
    return <p>Error loading questions.</p>;
  }
  if (!data || !data.fetchAllQuestions) {
    return <p>No questions found.</p>;
  }

  const questions = data.fetchAllQuestions;

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Typography variant="h4" gutterBottom>
        All User Generated Questions
      </Typography>
      <Typography variant="body1" gutterBottom>
        If only there was a way to use these questions in my gameboard. Hmm. If
        only..
      </Typography>
      <DataGrid<QuestionDisplayRow>
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
}
