// src/app/join/[game_id]/[player_id]/page.tsx

import styles from "../../../styles/common.module.css";
import pageStyles from "./page.module.css";
import { PlayerContextProvider } from "./PlayerContext";

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ room_code: string; player_id: string }>;
}) {
  // get player_id
  // get room_code
  const { room_code, player_id } = await params;

  return (
    <div className={`${pageStyles.page} ${styles.page}`}>
      <main className={styles.main}>
        <PlayerContextProvider player_id={player_id} room_code={room_code}>
          <div className={pageStyles.playerContainer}>
            <p>Player page</p>
          </div>
        </PlayerContextProvider>
      </main>
    </div>
  );
}
