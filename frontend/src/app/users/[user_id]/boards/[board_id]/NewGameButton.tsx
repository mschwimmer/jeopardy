// src/app/users/[user_id]/boards/[board_id]/NewGameButton.tsx

import React from 'react';
import { useRouter } from 'next/navigation';
import Grid from '@mui/material/Grid2';
import { useCreateGameMutation } from '@/__generated__/graphql';
import { Button } from '@mui/material';

interface NewGameButtonProps {
  userId: number;
  gameBoardId: number;
  isPlayable: boolean;
  blockedReason?: string;
}

const NewGameButton: React.FC<NewGameButtonProps> = ({
  userId,
  gameBoardId,
  isPlayable,
  blockedReason,
}) => {
  const router = useRouter();
  const [createNewGame, { loading }] = useCreateGameMutation({
    onCompleted: (res) => {
      const gameId = res.createGame?.id;
      if (gameId) router.push(`/games/${gameId}`);
    },
  });

  const handleClickNewGame = async () => {
    if (!isPlayable) return;
    try {
      await createNewGame({ variables: { input: { userId, gameBoardId } } });
    } catch (error) {
      console.error('Error creating new game:', error);
    }
  };

  return (
    <Grid size={{ xs: 12, md: 2 }} sx={{ height: '100%' }}>
      <Button
        size="large"
        variant="contained"
        color="secondary"
        sx={{ maxHeight: '80%' }}
        disabled={!isPlayable || loading}
        title={!isPlayable ? blockedReason : undefined}
        onClick={() => handleClickNewGame()}
      >
        {loading ? 'Creating...' : 'New Game'}
      </Button>
    </Grid>
  );
};

export default NewGameButton;
