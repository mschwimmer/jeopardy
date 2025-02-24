// src/app/lib/serverQueries.tsx

import { gql } from "@apollo/client";
import client from "./apolloClient";
import {
  CreateUserDocument,
  FindUserByFirebaseUidDocument,
} from "@/__generated__/graphql";

export const FIND_GAMEBOARD_QUERY = gql`
  query FindGameBoard($gameBoardId: Int!) {
    findGameBoard(gameBoardId: $gameBoardId) {
      id
      createdAt
      updatedAt
      userId
      title
      categories
    }
  }
`;

export async function fetchGameBoard(gameBoardId: number) {
  const { data } = await client.query({
    query: FIND_GAMEBOARD_QUERY,
    variables: { gameBoardId },
    fetchPolicy: "network-only", // Ensure no cache is used
  });

  if (!data?.findGameBoard) {
    throw new Error(`GameBoard with ID ${gameBoardId} not found`);
  }

  return data.findGameBoard;
}

export const FIND_GAME_QUERY = gql`
  query FindGame($gameId: Int!) {
    findGame(gameId: $gameId) {
      id
      createdAt
      updatedAt
      gameBoardId
      userId
    }
  }
`;

export async function fetchGame(gameId: number) {
  const { data } = await client.query({
    query: FIND_GAME_QUERY,
    variables: { gameId },
    fetchPolicy: "network-only",
  });

  if (!data?.findGame) {
    throw new Error(`Game with ID ${gameId} not found`);
  }

  return data.findGame;
}

export async function createUser(username: string, firebaseUid: string) {
  const { data } = await client.mutate({
    mutation: CreateUserDocument,
    variables: {
      input: {
        username,
        firebaseUid,
      },
    },
  });

  return data.createUser;
}

export async function findUserByFirebaseUid(firebaseUid: string) {
  const { data } = await client.query({
    query: FindUserByFirebaseUidDocument,
    variables: {
      firebaseUid,
    },
  });
  return data.findUserByFirebaseUid;
}

export const ALL_QUESTIONS_QUERY = gql`
  query fetchAllQuestions {
    fetchAllQuestions {
      id
      createdAt
      updatedAt
      userId
      question
      answer
    }
  }
`;

export async function fetchAllQuestions() {
  const { data } = await client.query({
    query: ALL_QUESTIONS_QUERY,
    fetchPolicy: "network-only",
  });
  return data.fetchAllQuestions;
}

export const ALL_GAMEBOARDS_QUERY = gql`
  query fetchAllGameBoards {
    fetchAllGameBoards {
      id
      createdAt
      updatedAt
      userId
      title
      categories
    }
  }
`;

export async function fetchAllGameBoards() {
  const { data } = await client.query({
    query: ALL_GAMEBOARDS_QUERY,
    fetchPolicy: "network-only",
  });
  return data.fetchAllGameBoards;
}
