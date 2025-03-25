// src/app/join/page.tsx

import styles from "../styles/common.module.css";
import pageStyles from "./page.module.css";
import JoinForm from "./JoinForm";

export default function JoinPage() {
  return (
    <div className={`${pageStyles.page} ${styles.page}`}>
      <main className={styles.main}>
        <JoinForm />
      </main>
    </div>
  );
}
