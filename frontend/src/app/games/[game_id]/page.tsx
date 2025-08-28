import styles from "../../styles/common.module.css";
import * as React from "react";
import GamePageContent from "./GamePageContent";

export default async function GamePage({
  params,
}: {
  params: Promise<{ game_id: string }>;
}) {
  const { game_id } = await params;
  const gameId = parseInt(game_id, 10);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <GamePageContent gameId={gameId} />
      </main>
    </div>
  );
}
