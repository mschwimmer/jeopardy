import { gql } from "@apollo/client";

export const GAMEBOARD_DETAILS = gql`
  fragment GameBoardDetails on GameBoard {
    id
    createdAt
    updatedAt
    userId
    title
    categories
  }
`;

export const ALL_GAMEBOARDS_QUERY = gql`
  query fetchAllGameBoards {
    fetchAllGameBoards {
      ...GameBoardDetails
    }
  }
`;

export const USER_GAMEBOARDS_QUERY = gql`
  query FetchGameBoardsFromUser($userId: Int!) {
    fetchGameBoardsFromUser(userId: $userId) {
      ...GameBoardDetails
    }
  }
`;

export const GAMEBOARD_QUERY = gql`
  query FindGameBoard($gameBoardId: Int!) {
    findGameBoard(gameBoardId: $gameBoardId) {
      ...GameBoardDetails
    }
  }
`;
