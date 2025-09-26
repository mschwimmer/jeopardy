// src/app/questions/page.tsx

import QuestionsPageComponent from "./QuestionsPageComponent";
import styles from "../styles/common.module.css";
import pageStyles from "./page.module.css";

export default async function QuestionsPage() {
  return (
    <div className={`${pageStyles.page} ${styles.page}`}>
      <main className={styles.main}>
        <QuestionsPageComponent />
      </main>
    </div>
  );
}
