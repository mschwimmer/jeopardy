// src/app/game-boards/page.tsx

import GameBoardDashboard from "./GameBoardsDashboard";
import { fetchAllGameBoards } from "../lib/serverQueries";
import styles from "./page.module.css";

export default async function QuestionsPage() {
  const gameBoards = await fetchAllGameBoards();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <GameBoardDashboard gameBoards={gameBoards} />
      </main>
    </div>
  );
}
