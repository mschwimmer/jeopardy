// src/app/join/[game_uuid]/page.tsx

import styles from "../../styles/common.module.css";
import pageStyles from "./page.module.css";

export default function PlayerPage() {
  return (
    <div className={`${pageStyles.page} ${styles.page}`}>
      <main className={styles.main}></main>
    </div>
  );
}
