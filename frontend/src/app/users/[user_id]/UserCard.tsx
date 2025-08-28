// src/app/components/UserCard.tsx
"use client";

import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { useFindUserQuery } from "@/__generated__/graphql";
import QueryResult from "../../components/query-result";

interface UserCardProps {
  user_id: string;
}

const UserCard: React.FC<UserCardProps> = ({ user_id }) => {
  const userId = parseInt(user_id, 10);
  const { data, loading, error } = useFindUserQuery({
    variables: { userId },
  });
  return (
    <Card>
      <CardContent>
        <QueryResult loading={loading} error={error} data={data}>
          <Typography variant="h5" component="h2">
            Username: {data?.findUser?.username}
          </Typography>
        </QueryResult>
        {/* <Typography color="textSecondary">{user.email}</Typography> */}
      </CardContent>
    </Card>
  );
};

export default UserCard;
