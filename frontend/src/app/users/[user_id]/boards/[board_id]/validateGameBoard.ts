import { GameBoardQuestion } from '@/__generated__/types';
import { GameBoardGridDisplay } from './UserGameBoardPageComponent';
type CellKey = `${number},${number}`;

export interface ValidationResult {
  isPlayable: boolean;
  blockedReason?: string;
}

export function validateGameBoard(
  gameBoard: GameBoardGridDisplay,
  gameBoardQuestions: Record<CellKey, GameBoardQuestion>,
  expectedRows = 5,
): ValidationResult {
  const expectedCols = gameBoard.categories.length;
  if (Object.keys(gameBoardQuestions).length !== expectedRows * expectedCols) {
    return {
      isPlayable: false,
      blockedReason: 'Board not fully populated',
    };
  }

  // Validate each category exists
  if (!gameBoard.categories || gameBoard.categories.length === 0) {
    return { isPlayable: false, blockedReason: 'No Categories' };
  }

  // No empty category values
  for (let i = 0; i < gameBoard.categories.length; i++) {
    const category = gameBoard.categories[i];
    // If category is null or an empty string, fail
    if (!category || category.trim() === '') {
      return {
        isPlayable: false,
        blockedReason: `Category in column ${i + 1} is empty`,
      };
    }
  }

  // Validate each cell has a GameBoardQuestion
  for (let col = 0; col < gameBoard.categories.length; col++) {
    for (let row = 0; row < expectedRows; row++) {
      const key: CellKey = `${row},${col}`;
      const gameBoardQuestion = gameBoardQuestions[key];

      if (!gameBoardQuestion) {
        return {
          isPlayable: false,
          blockedReason: `Missing question at row=${row}, col=${col}. Key="${key}"`,
        };
      }
      // If question text or answer is empty
      if (!gameBoardQuestion.question.question?.trim()) {
        return {
          isPlayable: false,
          blockedReason: `Empty question at row=${row}, col=${col}`,
        };
      }
      if (!gameBoardQuestion.question.answer?.trim()) {
        return {
          isPlayable: false,
          blockedReason: `Empty answer at row=${row}, col=${col}`,
        };
      }
      // Add any other checks: points > 0, etc.
      if (gameBoardQuestion.mapping.points < 0) {
        return {
          isPlayable: false,
          blockedReason: `Negative point value at row=${row}, col=${col}`,
        };
      }
    }
  }
  return { isPlayable: true };
}
