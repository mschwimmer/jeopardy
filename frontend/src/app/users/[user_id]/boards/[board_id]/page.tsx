// src/app/users/[user_id]/boards/[board_id]/page.tsx

import styles from '../../../../styles/common.module.css';
import pageStyles from './page.module.css';
import UserGameBoardPageComponent from './UserGameBoardPageComponent';

export default async function BoardPage({
  params,
}: {
  params: Promise<{ user_id: string; board_id: string }>;
}) {
  const { user_id, board_id } = await params;

  return (
    <div className={`${pageStyles.page} ${styles.page}`}>
      <main className={styles.main}>
        <UserGameBoardPageComponent user_id={user_id} game_board_id={board_id} />
      </main>
    </div>
  );
}
