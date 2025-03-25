// src/graphql/queries/games.ts

import { gql } from "@apollo/client";

export const GAME_QUERY = gql`
  query FindGame($gameId: Int!) {
    findGame(gameId: $gameId) {
      id
      createdAt
      updatedAt
      gameBoardId
      userId
      roomCode
    }
  }
`;

export const PLAYER_GAMES_QUERY = gql`
  query FetchGamesFromUser($userId: Int!) {
    fetchGamesFromUser(userId: $userId) {
      id
      createdAt
      updatedAt
      userId
      gameBoardId
      roomCode
    }
  }
`;

export const GAME_ROOM_QUERY = gql`
  query FindGameFromRoomCode($roomCode: String!) {
    findGameByRoomCode(roomCode: $roomCode) {
      id
      createdAt
      updatedAt
      gameBoardId
      userId
      roomCode
    }
  }
`;
