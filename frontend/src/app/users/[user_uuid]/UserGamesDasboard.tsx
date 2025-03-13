"use client";

import { DataGrid } from "@mui/x-data-grid";
import * as React from "react";
import { useFetchGamesFromUserQuery } from "@/__generated__/graphql";
import { Paper, Typography } from "@mui/material";
import Link from "next/link";

interface UserGamesDasboardProps {
  user_uuid: string;
}

export const UserGamesDasboard: React.FC<UserGamesDasboardProps> = ({
  user_uuid,
}) => {
  const userId = parseInt(user_uuid, 10);

  const { loading, error, data } = useFetchGamesFromUserQuery({
    variables: { userId },
  });

  if (loading) return <p>Loading data...</p>;
  if (error) return <p>Error fetching data: {error.message}</p>;
  if (!data) return <p>No gameboards found.</p>;

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        My Games
      </Typography>
      <Paper sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={data.fetchGamesFromUser}
          columns={[
            {
              field: "id",
              headerName: "ID",
              width: 70,
              renderCell: (params) => (
                <Link href={`/games/${params.row.id}`}>{params.row.id}</Link>
              ),
            },
            {
              field: "userId",
              headerName: "User Id",
              width: 70,
            },
            { field: "gameBoardId", headerName: "Game Board ID", width: 70 },
            { field: "createdAt", headerName: "Created At", width: 200 },
            { field: "updatedAt", headerName: "Updated At", width: 200 },
          ]}
          pageSizeOptions={[5, 10]}
          checkboxSelection
          sx={{ boarder: 0 }}
        />
      </Paper>
    </div>
  );
};
