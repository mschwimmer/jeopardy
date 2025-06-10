"use client";

import { DataGrid } from "@mui/x-data-grid";
import { Paper, Typography } from "@mui/material";
import Link from "next/link";
import { GameBoard } from "@/__generated__/types";

// Define columns for DataGrid
interface UserGameBoardDashboardProps {
  boards: GameBoard[];
}

export const UserGameBoardDashboard: React.FC<UserGameBoardDashboardProps> = ({
  boards,
}) => {
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
              field: "user",
              headerName: "Author",
              width: 150,
              renderCell: (params) => <div>{params.row.user.username}</div>,
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
          ]}
          pageSizeOptions={[5, 10]}
          checkboxSelection
          sx={{ border: 0 }}
        />
      </Paper>
    </div>
  );
};
