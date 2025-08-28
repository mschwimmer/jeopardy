// src/app/users/[user_id]/UserPageComponent.tsx
"use client";

import { List, ListItem } from "@mui/material";
import { UserGameBoardDashboard } from "./UserGameBoardDashboard";
import { NewGameBoard } from "./NewGameBoard";
import { UserGamesDashboard } from "./UserGamesDashboard";
import UserCard from "./UserCard";

export default function UserPageComponent({ user_id }: { user_id: string }) {
  return (
    <List>
      <ListItem>
        <UserCard user_id={user_id} />
      </ListItem>
      <ListItem>
        <NewGameBoard user_id={user_id} />
      </ListItem>
      <ListItem>
        <UserGameBoardDashboard user_id={user_id} />
      </ListItem>
      <ListItem>
        <UserGamesDashboard user_id={user_id} />
      </ListItem>
    </List>
  );
}
