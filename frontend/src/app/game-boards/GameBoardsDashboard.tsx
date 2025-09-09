// src/app/game-boards/GameBoardsDashboard.tsx
"use client";

import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";
import {
  FetchAllGameBoardsQuery,
  useFetchAllGameBoardsQuery,
} from "@/__generated__/graphql";
import React from "react";

type GameBoardDisplay = NonNullable<
  FetchAllGameBoardsQuery["fetchAllGameBoards"]
>;

// TODO Use username instead of user ID
const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 70 },
  {
    field: "title",
    headerName: "Title",
    flex: 1,
    minWidth: 200,
  },
  {
    field: "categories",
    headerName: "Categories",
    flex: 1,
    minWidth: 300,
    valueFormatter: (value) => {
      const categories: (string | null)[] = value;
      if (!categories || !Array.isArray(categories)) return "";
      return categories.filter((cat) => cat != null).join(", ");
    },
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

export default function GameBoardsDashboard() {
  const { data, loading, error } = useFetchAllGameBoardsQuery();

  if (loading) return <p>Loading...</p>;
  if (error) {
    console.error("Error loading game boards:", error);
    return <p>Failed to load game boards.</p>;
  }
  if (!data?.fetchAllGameBoards) return <p>No boards found.</p>;

  const gameBoards: GameBoardDisplay = data.fetchAllGameBoards;

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Typography variant="h4" gutterBottom>
        All User Generated GameBoards
      </Typography>
      <Typography variant="body1" gutterBottom>
        It would sure be cool if you could click on a gameboard and see a little
        preview of it. If only we had the technology.
      </Typography>
      <DataGrid<GameBoardDisplay[number]>
        rows={gameBoards}
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
