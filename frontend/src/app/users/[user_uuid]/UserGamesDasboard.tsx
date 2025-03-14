"use client";

import { DataGrid } from "@mui/x-data-grid";
import * as React from "react";
import { Paper, Typography } from "@mui/material";
import { Game } from "@/__generated__/types";
import Link from "next/link";

interface UserGamesDasboardProps {
  games: Game[];
}

export const UserGamesDasboard: React.FC<UserGamesDasboardProps> = ({
  games,
}) => {
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        My Games
      </Typography>
      <Paper sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={games}
          columns={[
            {
              field: "title",
              headerName: "Game Board",
              width: 200,
              renderCell: (params) => (
                <Link href={`/games/${params.row.id}`}>
                  {params.row.gameBoard.title}
                </Link>
              ),
            },
            {
              field: "categories",
              headerName: "Categories",
              width: 200,
              renderCell: (params) => (
                <div>{params.row.gameBoard.categories.join(" | ")}</div>
              ),
            },
            {
              field: "createdAt",
              headerName: "Created At",
              width: 100,
              valueFormatter: (value: Date) =>
                new Date(value).toLocaleDateString(),
            },
            {
              field: "updatedAt",
              headerName: "Last Played",
              width: 100,
              valueFormatter: (value: Date) =>
                new Date(value).toLocaleDateString(),
            },
          ]}
          pageSizeOptions={[5, 10]}
          checkboxSelection
          sx={{ boarder: 0 }}
        />
      </Paper>
    </div>
  );
};
