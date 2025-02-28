// src/app/users/[user_uuid]/page.tsx

import { List, ListItem } from "@mui/material";
import styles from "../../styles/common.module.css";
import pageStyles from "./page.module.css";
import UserGameBoardDashboard from "./UserGameBoardDashboard";
import { NewGameBoard } from "./NewGameBoard";
import { UserGamesDasboard } from "./UserGamesDasboard";
import UserCard from "./UserCard";

export default async function UserPage({
  params,
}: {
  params: Promise<{ user_uuid: string }>;
}) {
  const { user_uuid } = await params;
  // console.log("user_uuid in UserPage:", user_uuid);
  return (
    <div className={`${pageStyles.page} ${styles.page}`}>
      <main className={styles.main}>
        <h1>User Page</h1>
        <List>
          <ListItem>
            <UserCard user_uuid={user_uuid}></UserCard>
          </ListItem>
          <ListItem>
            <NewGameBoard user_uuid={user_uuid} />
          </ListItem>
          <ListItem>
            <UserGameBoardDashboard userId={user_uuid} />
          </ListItem>
          <ListItem>
            <UserGamesDasboard user_uuid={user_uuid} />
          </ListItem>
        </List>
      </main>
    </div>
  );
}
