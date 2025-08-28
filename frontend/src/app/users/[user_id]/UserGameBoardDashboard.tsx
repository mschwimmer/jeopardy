"use client";

import { DataGrid } from "@mui/x-data-grid";
import { Paper, Typography } from "@mui/material";
import Link from "next/link";
import {
  GameBoardDetailsFragment,
  useFetchGameBoardsFromUserQuery,
} from "@/__generated__/graphql";

export const UserGameBoardDashboard = ({ user_id }: { user_id: string }) => {
  const {
    data: gameBoardData,
    loading: gameBoardLoading,
    error: gameBoardError,
  } = useFetchGameBoardsFromUserQuery({
    variables: { userId: parseInt(user_id, 10) },
  });

  if (gameBoardLoading) return <p>Loading...</p>;
  if (gameBoardError) {
    console.error("Error loading game boards:", gameBoardError);
    return <p>Failed to load game boards.</p>;
  }
  if (!gameBoardData?.fetchGameBoardsFromUser) return <p>No boards found.</p>;

  // TODO figure out how to use a fragment type for this?
  const boards: GameBoardDetailsFragment[] =
    gameBoardData.fetchGameBoardsFromUser;

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        My GameBoards
      </Typography>
      <Paper sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={boards}
          columns={[
            {
              field: "title",
              headerName: "Board Name",
              width: 250,
              renderCell: (params) => (
                <Link
                  href={`/users/${params.row.userId}/boards/${params.row.id}`}
                >
                  {params.row.title}
                </Link>
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
              headerName: "Edited",
              width: 100,
              valueFormatter: (value: Date) =>
                new Date(value).toLocaleDateString(),
            },
            {
              field: "categories",
              headerName: "Categories",
              width: 300,
              renderCell: (params) => (
                <div>
                  {(params.row.categories ?? []).filter(Boolean).join(" | ")}
                </div>
              ),
            },
          ]}
          pageSizeOptions={[5, 10]}
          checkboxSelection
          sx={{ border: 0 }}
        />
      </Paper>
    </div>
  );
};
