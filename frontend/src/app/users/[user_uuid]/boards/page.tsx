import styles from "../../../styles/common.module.css";
import pageStyles from "./page.module.css";
import UserGameBoardDashboard from "../UserGameBoardDashboard";

export default async function BoardsPage({
  params,
}: {
  params: Promise<{ user_uuid: string }>;
}) {
  const { user_uuid } = await params;
  return (
    <div className={`${pageStyles.page} ${styles.page}`}>
      <main className={styles.main}>
        <UserGameBoardDashboard userId={user_uuid} />
      </main>
    </div>
  );
}
