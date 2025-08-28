// src/app/users/[user_id]/page.tsx

import styles from "../../styles/common.module.css";
import pageStyles from "./page.module.css";
import UserPageComponent from "./UserPageComponent";

export default async function UserPage({
  params,
}: {
  params: Promise<{ user_id: string }>;
}) {
  const { user_id } = await params;

  return (
    <div className={`${pageStyles.page} ${styles.page}`}>
      <main className={styles.main}>
        <UserPageComponent user_id={user_id} />
      </main>
    </div>
  );
}
