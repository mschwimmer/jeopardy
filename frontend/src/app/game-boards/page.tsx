// src/app/game-boards/page.tsx

import GameBoardsPageComponent from "./GameBoardsPageComponent";
import styles from "../styles/common.module.css";
import pageStyles from "./page.module.css";

export default async function QuestionsPage() {
  return (
    <div className={`${pageStyles.page} ${styles.page}`}>
      <main className={styles.main}>
        <GameBoardsPageComponent />
      </main>
    </div>
  );
}
