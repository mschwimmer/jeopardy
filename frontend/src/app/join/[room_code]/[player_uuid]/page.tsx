// src/app/join/[game_uuid]/[player_uuid]/page.tsx

import styles from "../../../styles/common.module.css";
import pageStyles from "./page.module.css";
import { PlayerContextProvider } from "./PlayerContext";

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ room_code: string; player_uuid: string }>;
}) {
  // get player_uuid
  const { room_code, player_uuid } = await params;
  // get room_code

  return (
    <div className={`${pageStyles.page} ${styles.page}`}>
      <main className={styles.main}>
        <PlayerContextProvider player_uuid={player_uuid} room_code={room_code}>
          <div className={pageStyles.playerContainer}>
            <p>Player page</p>
          </div>
        </PlayerContextProvider>
      </main>
    </div>
  );
}
