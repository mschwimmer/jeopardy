import styles from "./page.module.css";
import UserGameBoardDashboard from "../UserGameBoardDashboard";

export default async function BoardsPage({
  params,
}: {
  params: Promise<{ user_uuid: string }>;
}) {
  const { user_uuid } = await params;
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <UserGameBoardDashboard userId={user_uuid} />
      </main>
    </div>
  );
}
