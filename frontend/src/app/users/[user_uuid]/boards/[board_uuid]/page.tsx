// src/app/users/[user_uuid]/board/[board_uuid]/page.tsx

import styles from "../../../../styles/common.module.css";
import pageStyles from "./page.module.css";
import GameBoardGrid from "./GameBoardGrid";
import { fetchGameBoard } from "@/app/lib/serverQueries";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ user_uuid: string; board_uuid: string }>;
}) {
  const { user_uuid, board_uuid } = await params;
  const gameBoardId = parseInt(board_uuid, 10);
  const userId = parseInt(user_uuid, 10);

  try {
    const gameBoard = await fetchGameBoard(gameBoardId);

    return (
      <div className={`${pageStyles.page} ${styles.page}`}>
        <main className={styles.main}>
          <GameBoardGrid gameBoard={gameBoard} userId={userId} />
        </main>
      </div>
    );
  } catch (error) {
    console.error("Error fetching game board:", error);

    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <p>Failed to load the game board. Please try again later.</p>
        </main>
      </div>
    );
  }
}
