// src/app/game-boards/GameBoardsDashboard.tsx
"use client";

import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";
import { GameBoard } from "@/__generated__/types";
import React from "react";

interface GameBoardsDashboardProps {
  gameBoards: GameBoard[];
}

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 70 },
  {
    field: "title",
    headerName: "Title",
    flex: 1,
    minWidth: 300,
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

const GameBoardsDashboard: React.FC<GameBoardsDashboardProps> = ({
  gameBoards,
}) => {
  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Typography variant="h4" gutterBottom>
        All User Generated GameBoards
      </Typography>
      <Typography variant="body1" gutterBottom>
        It would sure be cool if you could click on a gameboard and see a little
        preview of it. If only we had the technology.
      </Typography>
      <DataGrid<GameBoard>
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
};

export default GameBoardsDashboard;
