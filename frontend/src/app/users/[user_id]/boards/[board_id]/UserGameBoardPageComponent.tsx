// src/app/users/[user_id]/boards/[board_id]/UserGameBoardPageComponent.tsx
'use client';

import GameBoardGrid from './GameBoardGrid';
import { FindGameBoardQuery, useFindGameBoardQuery } from '@/__generated__/graphql';
import QueryResult from '@/app/components/query-result';

export type GameBoardGridDisplay = NonNullable<FindGameBoardQuery['findGameBoard']>;

export default function UserGameBoardPageComponent({
  user_id,
  game_board_id,
}: {
  user_id: string;
  game_board_id: string;
}) {
  console.log(game_board_id);
  const validBoardId = parseInt(game_board_id, 10);
  console.log(validBoardId);
  console.log(typeof validBoardId);
  const { data, loading, error } = useFindGameBoardQuery({
    variables: { gameBoardId: validBoardId },
  });

  return (
    <QueryResult loading={loading} error={error} data={data}>
      {data?.findGameBoard ? (
        <GameBoardGrid gameBoard={data.findGameBoard} userId={parseInt(user_id, 10)} />
      ) : null}
    </QueryResult>
  );
}
