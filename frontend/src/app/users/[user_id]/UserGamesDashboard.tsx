"use client";

import { DataGrid } from "@mui/x-data-grid";
import * as React from "react";
import { Paper, Typography } from "@mui/material";
import Link from "next/link";
import {
  useFetchGamesFromUserQuery,
  FetchGamesFromUserQuery,
} from "@/__generated__/graphql";

// We need to add non-nullable because generated types are all nullable
type UserGames = NonNullable<FetchGamesFromUserQuery["fetchGamesFromUser"]>;

export const UserGamesDashboard = ({ user_id }: { user_id: string }) => {
  const {
    data: gamesData,
    loading: gamesLoading,
    error: gamesError,
  } = useFetchGamesFromUserQuery({
    variables: { userId: parseInt(user_id, 10) },
  });

  if (gamesLoading) return <p>Loading...</p>;
  if (gamesError) {
    console.error("Error loading game boards:", gamesError);
    return <p>Failed to load game boards.</p>;
  }
  if (!gamesData?.fetchGamesFromUser) return <p>No game boards found.</p>;

  // TODO figure out how to use a fragment type for this?
  const games: UserGames = gamesData.fetchGamesFromUser;

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
                <div>
                  {(params.row.gameBoard.categories ?? [])
                    .filter(Boolean)
                    .join(" | ")}
                </div>
              ),
            },
            {
              field: "createdAt",
              headerName: "Created",
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
