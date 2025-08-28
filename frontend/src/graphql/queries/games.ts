// src/graphql/queries/games.ts

import { gql } from "@apollo/client";

export const GAME_DETAILS = gql`
  fragment GameDetails on Game {
    id
    createdAt
    updatedAt
    gameBoardId
    userId
    roomCode
  }
`;

export const USER_GAMES_QUERY = gql`
  query FetchGamesFromUser($userId: Int!) {
    fetchGamesFromUser(userId: $userId) {
      ...GameDetails
      gameBoard {
        title
        categories
      }
    }
  }
`;

export const FULL_GAME_QUERY = gql`
  query FullGame($gameId: Int!) {
    findGame(gameId: $gameId) {
      ...GameDetails
      user {
        id
        username
        firebaseUid
        createdAt
        updatedAt
      }
      gameBoard {
        id
        title
        categories
        userId
        createdAt
        updatedAt
        user {
          id
          username
          firebaseUid
          createdAt
          updatedAt
        }
      }
    }
  }
`;

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
