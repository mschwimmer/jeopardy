import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
};

export type CreateGameBoardInput = {
  title: Scalars['String']['input'];
  userId: Scalars['Int']['input'];
};

export type CreateGameBoardMappingInput = {
  boardId: Scalars['Int']['input'];
  dailyDouble: Scalars['Boolean']['input'];
  gridCol: Scalars['Int']['input'];
  gridRow: Scalars['Int']['input'];
  points: Scalars['Int']['input'];
  questionId: Scalars['Int']['input'];
};

export type CreateGameInput = {
  gameBoardId: Scalars['Int']['input'];
  userId: Scalars['Int']['input'];
};

export type CreatePlayerInput = {
  gameId: Scalars['Int']['input'];
  playerName: Scalars['String']['input'];
};

export type CreateQuestionInput = {
  answer: Scalars['String']['input'];
  question: Scalars['String']['input'];
  userId: Scalars['Int']['input'];
};

export type CreateUserInput = {
  firebaseUid: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

/**
 * Represents a game in the application.
 *
 * This struct supports Diesel for database interactions
 * and integrates with async-graphql for GraphQL APIs. It is
 * associated with the `User` struct.
 */
export type Game = {
  __typename?: 'Game';
  createdAt: Scalars['DateTime']['output'];
  gameBoard: GameBoard;
  gameBoardId: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: User;
  userId: Scalars['Int']['output'];
};

/**
 * Represents a game board in the application.
 *
 * This struct supports Diesel for database interactions
 * and integrates with async-graphql for GraphQL APIs. It is
 * associated with the `User` struct and organizes the structure
 * of a game with its title and categories.
 */
export type GameBoard = {
  __typename?: 'GameBoard';
  /**
   * A vector of category names for the game board. Each category
   * is an optional string, allowing for empty or missing categories.
   */
  categories: Array<Maybe<Scalars['String']['output']>>;
  /** The timestamp when the game board record was created. */
  createdAt: Scalars['DateTime']['output'];
  /** The unique identifier for the game board. */
  id: Scalars['Int']['output'];
  /** The title of the game board. */
  title: Scalars['String']['output'];
  /** The timestamp when the game board record was last updated. */
  updatedAt: Scalars['DateTime']['output'];
  user: User;
  /** The unique identifier of the user who created the game board. */
  userId: Scalars['Int']['output'];
};

/**
 * `GBQ` is alias for `GameBoardQuestion`.
 *
 * Represents a question and its corresponding gameboard metadata
 *
 * GBQ := GBQMapping + Question.
 * # Example
 * ```rust, ignore
 * use crate::models::{GameBoardQuestion, GBQMapping, Question};
 * use chrono::Utc;
 *
 * let mapping = GBQMapping {
 * board_id: 1,
 * question_id: 42,
 * daily_double: false,
 * points: 200,
 * grid_row: 2,
 * grid_col: 3,
 * };
 *
 * let question = Question {
 * id: 42,
 * created_at: Utc::now(),
 * updated_at: Utc::now(),
 * user_id: 1,
 * question: String::from("What is Rust?"),
 * answer: String::from("A programming language."),
 * };
 *
 * let gbq = GameBoardQuestion::new(mapping, question);
 * println!("{:?}", gbq);
 * ```
 */
export type GameBoardQuestion = {
  __typename?: 'GameBoardQuestion';
  mapping: GameBoardQuestionMapping;
  question: Question;
};

/**
 * `GBQMapping` is alias for `GameBoardQuestionMapping`.
 * Represents the mapping between a game board and a question.
 *
 * This struct defines the association between a game board and a question
 * along with additional metadata such as the position of the question
 * on the grid, points, and whether it's a daily double.
 * # Example
 * ```rust, ignore
 * let mapping = GBQMapping {
 * board_id: 1,
 * question_id: 42,
 * daily_double: false,
 * points: 200,
 * grid_row: 2,
 * grid_col: 3,
 * }
 * ```
 */
export type GameBoardQuestionMapping = {
  __typename?: 'GameBoardQuestionMapping';
  boardId: Scalars['Int']['output'];
  dailyDouble: Scalars['Boolean']['output'];
  gridCol: Scalars['Int']['output'];
  gridRow: Scalars['Int']['output'];
  points: Scalars['Int']['output'];
  questionId: Scalars['Int']['output'];
};

/**
 * Represents a player in the application.
 *
 * This struct supports Diesel for database interactions
 * and integrates with async-graphql for GraphQL APIs. It is
 * associated with the `Game` struct.
 */
export type Player = {
  __typename?: 'Player';
  createdAt: Scalars['DateTime']['output'];
  gameId: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  playerName: Scalars['String']['output'];
  score: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

/**
 * Represents a question in the application.
 *
 * This struct supports Diesel for database interactions
 * and integrates with async-graphql for GraphQL APIs. It is
 * associated with the `User` struct.
 */
export type Question = {
  __typename?: 'Question';
  /** The answer to the question. */
  answer: Scalars['String']['output'];
  /** The timestamp when the question was created. */
  createdAt: Scalars['DateTime']['output'];
  /** The unique identifier for the question. */
  id: Scalars['Int']['output'];
  /** The text of the question. */
  question: Scalars['String']['output'];
  /** The timestamp when the question was last updated. */
  updatedAt: Scalars['DateTime']['output'];
  user: User;
  /** The unique identifier of the user who created the question. */
  userId: Scalars['Int']['output'];
};

export type RootMutation = {
  __typename?: 'RootMutation';
  createGame: Game;
  /** Create a new gameboard with example question */
  createGameBoard: GameBoard;
  /** Associate a question with a gameboard */
  createMapping: GameBoardQuestionMapping;
  /** Create a new player */
  createPlayer: Player;
  /** Create a new quesiton */
  createQuestion: Question;
  createUser: User;
  deletePlayer: Player;
  /** Delete a question by ID */
  deleteQuestion: Scalars['Boolean']['output'];
  /** Update gameboard title or categories */
  updateGameBoard: GameBoard;
  /** Update gameboard category at specific index */
  updateGameBoardCategory: GameBoard;
  updateMapping: GameBoardQuestionMapping;
  updatePlayerName: Player;
  updatePlayerScore: Player;
  /** Update a question */
  updateQuestion: Question;
};


export type RootMutationCreateGameArgs = {
  input: CreateGameInput;
};


export type RootMutationCreateGameBoardArgs = {
  input: CreateGameBoardInput;
};


export type RootMutationCreateMappingArgs = {
  input: CreateGameBoardMappingInput;
};


export type RootMutationCreatePlayerArgs = {
  input: CreatePlayerInput;
};


export type RootMutationCreateQuestionArgs = {
  input: CreateQuestionInput;
};


export type RootMutationCreateUserArgs = {
  input: CreateUserInput;
};


export type RootMutationDeletePlayerArgs = {
  playerId: Scalars['Int']['input'];
};


export type RootMutationDeleteQuestionArgs = {
  questionId: Scalars['Int']['input'];
};


export type RootMutationUpdateGameBoardArgs = {
  input: UpdateGameBoardInput;
};


export type RootMutationUpdateGameBoardCategoryArgs = {
  category: Scalars['String']['input'];
  gameBoardId: Scalars['Int']['input'];
  index: Scalars['Int']['input'];
};


export type RootMutationUpdateMappingArgs = {
  input: UpdateGameBoardMappingInput;
};


export type RootMutationUpdatePlayerNameArgs = {
  playerId: Scalars['Int']['input'];
  playerName: Scalars['String']['input'];
};


export type RootMutationUpdatePlayerScoreArgs = {
  playerId: Scalars['Int']['input'];
  score: Scalars['Int']['input'];
};


export type RootMutationUpdateQuestionArgs = {
  input: UpdateQuestionInput;
};

export type RootQuery = {
  __typename?: 'RootQuery';
  /** Fetch all gameboards in the database */
  fetchAllGameBoards: Array<GameBoard>;
  /** Fetch all questions in database */
  fetchAllQuestions: Array<Question>;
  /** Fetch all users in database */
  fetchAllUsers: Array<User>;
  /** Fetch all GameBoard-Question mappings for a specific GameBoard */
  fetchGameBoardMappings: Array<GameBoardQuestionMapping>;
  /** Fetch all GameBoardQuestions from board id */
  fetchGameBoardQuestions: Array<GameBoardQuestion>;
  /** Fetch all gameboards associated with a specific user */
  fetchGameBoardsFromUser: Array<GameBoard>;
  /** Fetch all games from user */
  fetchGamesFromUser: Array<Game>;
  /** Fetch all players by game id */
  fetchPlayersFromGame: Array<Player>;
  /** Fetch questions from list of ids */
  fetchQuestionsFromIds: Array<Question>;
  /** Fetch all questions from a user */
  fetchQuestionsFromUser: Array<Question>;
  /** Find a single game by id */
  findGame: Game;
  /** Find a single gameboard by id */
  findGameBoard: GameBoard;
  /** Find a GameBoard-Question mapping by board id and question id */
  findGameBoardMapping: GameBoardQuestionMapping;
  /** Find GameBoardQuestion from game_board_id and question_id */
  findGameBoardQuestion: GameBoardQuestion;
  /** Find a single player by id */
  findPlayer: Player;
  /** Find a single question by id */
  findQuestion: Question;
  /** Find user by id */
  findUser?: Maybe<User>;
  /** Find user by firebase UID */
  findUserByFirebaseUid?: Maybe<User>;
};


export type RootQueryFetchGameBoardMappingsArgs = {
  gameBoardId: Scalars['Int']['input'];
};


export type RootQueryFetchGameBoardQuestionsArgs = {
  gameBoardId: Scalars['Int']['input'];
};


export type RootQueryFetchGameBoardsFromUserArgs = {
  userId: Scalars['Int']['input'];
};


export type RootQueryFetchGamesFromUserArgs = {
  userId: Scalars['Int']['input'];
};


export type RootQueryFetchPlayersFromGameArgs = {
  gameId: Scalars['Int']['input'];
};


export type RootQueryFetchQuestionsFromIdsArgs = {
  questionIds: Array<Scalars['Int']['input']>;
};


export type RootQueryFetchQuestionsFromUserArgs = {
  userId: Scalars['Int']['input'];
};


export type RootQueryFindGameArgs = {
  gameId: Scalars['Int']['input'];
};


export type RootQueryFindGameBoardArgs = {
  gameBoardId: Scalars['Int']['input'];
};


export type RootQueryFindGameBoardMappingArgs = {
  gameBoardId: Scalars['Int']['input'];
  questionId: Scalars['Int']['input'];
};


export type RootQueryFindGameBoardQuestionArgs = {
  gameBoardId: Scalars['Int']['input'];
  questionId: Scalars['Int']['input'];
};


export type RootQueryFindPlayerArgs = {
  playerId: Scalars['Int']['input'];
};


export type RootQueryFindQuestionArgs = {
  questionId: Scalars['Int']['input'];
};


export type RootQueryFindUserArgs = {
  userId: Scalars['Int']['input'];
};


export type RootQueryFindUserByFirebaseUidArgs = {
  firebaseUid: Scalars['String']['input'];
};

export type UpdateGameBoardInput = {
  boardId: Scalars['Int']['input'];
  categories?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateGameBoardMappingInput = {
  boardId: Scalars['Int']['input'];
  dailyDouble?: InputMaybe<Scalars['Boolean']['input']>;
  gridCol?: InputMaybe<Scalars['Int']['input']>;
  gridRow?: InputMaybe<Scalars['Int']['input']>;
  points?: InputMaybe<Scalars['Int']['input']>;
  questionId: Scalars['Int']['input'];
};

export type UpdateQuestionInput = {
  answer?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  question?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Represents a user in the application.
 *
 * This struct supports Diesel for database interactions
 * and integrates with async-graphql for GraphQL APIs.
 * # Example
 *
 * ```rust, ignore
 * use crate::models::User;
 * use chrono::Utc;
 *
 * let user = User {
 * id: 1,
 * created_at: Utc::now(),
 * updated_at: Utc::now(),
 * username: String::from("johndoe"),
 * firebase_uid: String::from("123456"),
 * };
 *
 * println!("{:?}", user);
 * ```
 */
export type User = {
  __typename?: 'User';
  /** The timestamp when the user was created. */
  createdAt: Scalars['DateTime']['output'];
  /** The Firebase UID of the user. */
  firebaseUid: Scalars['String']['output'];
  /** The unique identifier for the user. */
  id: Scalars['Int']['output'];
  /** The timestamp when the user was last updated. */
  updatedAt: Scalars['DateTime']['output'];
  /** The username of the user. */
  username: Scalars['String']['output'];
};

export type CreateMappingMutationVariables = Exact<{
  input: CreateGameBoardMappingInput;
}>;


export type CreateMappingMutation = { __typename?: 'RootMutation', createMapping: { __typename?: 'GameBoardQuestionMapping', boardId: number, questionId: number, dailyDouble: boolean, points: number, gridRow: number, gridCol: number } };

export type UpdateMappingMutationVariables = Exact<{
  input: UpdateGameBoardMappingInput;
}>;


export type UpdateMappingMutation = { __typename?: 'RootMutation', updateMapping: { __typename?: 'GameBoardQuestionMapping', boardId: number, questionId: number, dailyDouble: boolean, points: number, gridRow: number, gridCol: number } };

export type CreateGameBoardMutationVariables = Exact<{
  input: CreateGameBoardInput;
}>;


export type CreateGameBoardMutation = { __typename?: 'RootMutation', createGameBoard: { __typename?: 'GameBoard', id: number, createdAt: any, updatedAt: any, userId: number, title: string, categories: Array<string | null> } };

export type UpdateGameBoardTitleMutationVariables = Exact<{
  boardId: Scalars['Int']['input'];
  title: Scalars['String']['input'];
}>;


export type UpdateGameBoardTitleMutation = { __typename?: 'RootMutation', updateGameBoard: { __typename?: 'GameBoard', id: number, title: string, categories: Array<string | null> } };

export type UpdateGameBoardCategoryMutationVariables = Exact<{
  gameBoardId: Scalars['Int']['input'];
  index: Scalars['Int']['input'];
  category: Scalars['String']['input'];
}>;


export type UpdateGameBoardCategoryMutation = { __typename?: 'RootMutation', updateGameBoardCategory: { __typename?: 'GameBoard', id: number, createdAt: any, updatedAt: any, userId: number, title: string, categories: Array<string | null> } };

export type CreateGameMutationVariables = Exact<{
  input: CreateGameInput;
}>;


export type CreateGameMutation = { __typename?: 'RootMutation', createGame: { __typename?: 'Game', id: number, createdAt: any, updatedAt: any, gameBoardId: number, userId: number } };

export type CreatePlayerMutationVariables = Exact<{
  input: CreatePlayerInput;
}>;


export type CreatePlayerMutation = { __typename?: 'RootMutation', createPlayer: { __typename?: 'Player', id: number, createdAt: any, updatedAt: any, gameId: number, playerName: string } };

export type UpdatePlayerScoreMutationVariables = Exact<{
  playerId: Scalars['Int']['input'];
  newScore: Scalars['Int']['input'];
}>;


export type UpdatePlayerScoreMutation = { __typename?: 'RootMutation', updatePlayerScore: { __typename?: 'Player', id: number, createdAt: any, updatedAt: any, gameId: number, playerName: string, score: number } };

export type UpdatePlayerNameMutationVariables = Exact<{
  playerId: Scalars['Int']['input'];
  newName: Scalars['String']['input'];
}>;


export type UpdatePlayerNameMutation = { __typename?: 'RootMutation', updatePlayerName: { __typename?: 'Player', id: number, createdAt: any, updatedAt: any, gameId: number, playerName: string, score: number } };

export type DeletePlayerMutationVariables = Exact<{
  playerId: Scalars['Int']['input'];
}>;


export type DeletePlayerMutation = { __typename?: 'RootMutation', deletePlayer: { __typename?: 'Player', id: number, createdAt: any, updatedAt: any, gameId: number, playerName: string, score: number } };

export type CreateQuestionMutationVariables = Exact<{
  input: CreateQuestionInput;
}>;


export type CreateQuestionMutation = { __typename?: 'RootMutation', createQuestion: { __typename?: 'Question', id: number, createdAt: any, updatedAt: any, userId: number, question: string, answer: string } };

export type UpdateQuestionMutationVariables = Exact<{
  input: UpdateQuestionInput;
}>;


export type UpdateQuestionMutation = { __typename?: 'RootMutation', updateQuestion: { __typename?: 'Question', id: number, question: string, answer: string, createdAt: any, updatedAt: any, userId: number } };

export type DeleteQuestionMutationVariables = Exact<{
  questionId: Scalars['Int']['input'];
}>;


export type DeleteQuestionMutation = { __typename?: 'RootMutation', deleteQuestion: boolean };

export type CreateUserMutationVariables = Exact<{
  input: CreateUserInput;
}>;


export type CreateUserMutation = { __typename?: 'RootMutation', createUser: { __typename?: 'User', id: number, firebaseUid: string, username: string, createdAt: any, updatedAt: any } };

export type FindGbqQueryVariables = Exact<{
  gameBoardId: Scalars['Int']['input'];
  questionId: Scalars['Int']['input'];
}>;


export type FindGbqQuery = { __typename?: 'RootQuery', findGameBoardQuestion: { __typename?: 'GameBoardQuestion', mapping: { __typename?: 'GameBoardQuestionMapping', dailyDouble: boolean, points: number, gridRow: number, gridCol: number }, question: { __typename?: 'Question', question: string, answer: string } } };

export type FetchGbQsQueryVariables = Exact<{
  gameBoardId: Scalars['Int']['input'];
}>;


export type FetchGbQsQuery = { __typename?: 'RootQuery', fetchGameBoardQuestions: Array<{ __typename?: 'GameBoardQuestion', mapping: { __typename?: 'GameBoardQuestionMapping', boardId: number, questionId: number, dailyDouble: boolean, points: number, gridRow: number, gridCol: number }, question: { __typename?: 'Question', id: number, createdAt: any, updatedAt: any, userId: number, question: string, answer: string, user: { __typename?: 'User', id: number, createdAt: any, updatedAt: any, firebaseUid: string, username: string } } }> };

export type FindGameBoardMappingQueryVariables = Exact<{
  gameBoardId: Scalars['Int']['input'];
  questionId: Scalars['Int']['input'];
}>;


export type FindGameBoardMappingQuery = { __typename?: 'RootQuery', findGameBoardMapping: { __typename?: 'GameBoardQuestionMapping', boardId: number, questionId: number, dailyDouble: boolean, points: number, gridRow: number, gridCol: number } };

export type FetchGameBoardMappingsQueryVariables = Exact<{
  gameBoardId: Scalars['Int']['input'];
}>;


export type FetchGameBoardMappingsQuery = { __typename?: 'RootQuery', fetchGameBoardMappings: Array<{ __typename?: 'GameBoardQuestionMapping', boardId: number, questionId: number, dailyDouble: boolean, points: number, gridRow: number, gridCol: number }> };

export type FetchAllGameBoardsQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchAllGameBoardsQuery = { __typename?: 'RootQuery', fetchAllGameBoards: Array<{ __typename?: 'GameBoard', id: number, createdAt: any, updatedAt: any, userId: number, title: string, categories: Array<string | null> }> };

export type FetchGameBoardsFromUserQueryVariables = Exact<{
  userId: Scalars['Int']['input'];
}>;


export type FetchGameBoardsFromUserQuery = { __typename?: 'RootQuery', fetchGameBoardsFromUser: Array<{ __typename?: 'GameBoard', id: number, createdAt: any, updatedAt: any, userId: number, title: string, categories: Array<string | null> }> };

export type FindGameBoardQueryVariables = Exact<{
  gameBoardId: Scalars['Int']['input'];
}>;


export type FindGameBoardQuery = { __typename?: 'RootQuery', findGameBoard: { __typename?: 'GameBoard', id: number, createdAt: any, updatedAt: any, userId: number, title: string, categories: Array<string | null> } };

export type FindGameQueryVariables = Exact<{
  gameId: Scalars['Int']['input'];
}>;


export type FindGameQuery = { __typename?: 'RootQuery', findGame: { __typename?: 'Game', id: number, createdAt: any, updatedAt: any, gameBoardId: number, userId: number } };

export type FetchGamesFromUserQueryVariables = Exact<{
  userId: Scalars['Int']['input'];
}>;


export type FetchGamesFromUserQuery = { __typename?: 'RootQuery', fetchGamesFromUser: Array<{ __typename?: 'Game', id: number, createdAt: any, updatedAt: any, userId: number, gameBoardId: number }> };

export type FindPlayerQueryVariables = Exact<{
  playerId: Scalars['Int']['input'];
}>;


export type FindPlayerQuery = { __typename?: 'RootQuery', findPlayer: { __typename?: 'Player', id: number, createdAt: any, updatedAt: any, playerName: string, gameId: number, score: number } };

export type FetchPlayersFromGameQueryVariables = Exact<{
  gameId: Scalars['Int']['input'];
}>;


export type FetchPlayersFromGameQuery = { __typename?: 'RootQuery', fetchPlayersFromGame: Array<{ __typename?: 'Player', id: number, createdAt: any, updatedAt: any, playerName: string, gameId: number, score: number }> };

export type FetchAllQuestionsQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchAllQuestionsQuery = { __typename?: 'RootQuery', fetchAllQuestions: Array<{ __typename?: 'Question', id: number, createdAt: any, updatedAt: any, userId: number, question: string, answer: string }> };

export type FetchQuestionsFromIdsQueryVariables = Exact<{
  questionIds: Array<Scalars['Int']['input']> | Scalars['Int']['input'];
}>;


export type FetchQuestionsFromIdsQuery = { __typename?: 'RootQuery', fetchQuestionsFromIds: Array<{ __typename?: 'Question', id: number, createdAt: any, updatedAt: any, userId: number, question: string, answer: string }> };

export type FindQuestionQueryVariables = Exact<{
  questionId: Scalars['Int']['input'];
}>;


export type FindQuestionQuery = { __typename?: 'RootQuery', findQuestion: { __typename?: 'Question', id: number, createdAt: any, updatedAt: any, userId: number, question: string, answer: string } };

export type FetchAllUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchAllUsersQuery = { __typename?: 'RootQuery', fetchAllUsers: Array<{ __typename?: 'User', id: number, firebaseUid: string, username: string, createdAt: any, updatedAt: any }> };

export type FindUserQueryVariables = Exact<{
  userId: Scalars['Int']['input'];
}>;


export type FindUserQuery = { __typename?: 'RootQuery', findUser?: { __typename?: 'User', id: number, firebaseUid: string, username: string, createdAt: any, updatedAt: any } | null };

export type FindUserByFirebaseUidQueryVariables = Exact<{
  firebaseUid: Scalars['String']['input'];
}>;


export type FindUserByFirebaseUidQuery = { __typename?: 'RootQuery', findUserByFirebaseUid?: { __typename?: 'User', id: number, firebaseUid: string, username: string, createdAt: any, updatedAt: any } | null };


export const CreateMappingDocument = gql`
    mutation CreateMapping($input: CreateGameBoardMappingInput!) {
  createMapping(input: $input) {
    boardId
    questionId
    dailyDouble
    points
    gridRow
    gridCol
  }
}
    `;
export type CreateMappingMutationFn = Apollo.MutationFunction<CreateMappingMutation, CreateMappingMutationVariables>;

/**
 * __useCreateMappingMutation__
 *
 * To run a mutation, you first call `useCreateMappingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateMappingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createMappingMutation, { data, loading, error }] = useCreateMappingMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateMappingMutation(baseOptions?: Apollo.MutationHookOptions<CreateMappingMutation, CreateMappingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateMappingMutation, CreateMappingMutationVariables>(CreateMappingDocument, options);
      }
export type CreateMappingMutationHookResult = ReturnType<typeof useCreateMappingMutation>;
export type CreateMappingMutationResult = Apollo.MutationResult<CreateMappingMutation>;
export type CreateMappingMutationOptions = Apollo.BaseMutationOptions<CreateMappingMutation, CreateMappingMutationVariables>;
export const UpdateMappingDocument = gql`
    mutation UpdateMapping($input: UpdateGameBoardMappingInput!) {
  updateMapping(input: $input) {
    boardId
    questionId
    dailyDouble
    points
    gridRow
    gridCol
  }
}
    `;
export type UpdateMappingMutationFn = Apollo.MutationFunction<UpdateMappingMutation, UpdateMappingMutationVariables>;

/**
 * __useUpdateMappingMutation__
 *
 * To run a mutation, you first call `useUpdateMappingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateMappingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateMappingMutation, { data, loading, error }] = useUpdateMappingMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateMappingMutation(baseOptions?: Apollo.MutationHookOptions<UpdateMappingMutation, UpdateMappingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateMappingMutation, UpdateMappingMutationVariables>(UpdateMappingDocument, options);
      }
export type UpdateMappingMutationHookResult = ReturnType<typeof useUpdateMappingMutation>;
export type UpdateMappingMutationResult = Apollo.MutationResult<UpdateMappingMutation>;
export type UpdateMappingMutationOptions = Apollo.BaseMutationOptions<UpdateMappingMutation, UpdateMappingMutationVariables>;
export const CreateGameBoardDocument = gql`
    mutation CreateGameBoard($input: CreateGameBoardInput!) {
  createGameBoard(input: $input) {
    id
    createdAt
    updatedAt
    userId
    title
    categories
  }
}
    `;
export type CreateGameBoardMutationFn = Apollo.MutationFunction<CreateGameBoardMutation, CreateGameBoardMutationVariables>;

/**
 * __useCreateGameBoardMutation__
 *
 * To run a mutation, you first call `useCreateGameBoardMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateGameBoardMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createGameBoardMutation, { data, loading, error }] = useCreateGameBoardMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateGameBoardMutation(baseOptions?: Apollo.MutationHookOptions<CreateGameBoardMutation, CreateGameBoardMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateGameBoardMutation, CreateGameBoardMutationVariables>(CreateGameBoardDocument, options);
      }
export type CreateGameBoardMutationHookResult = ReturnType<typeof useCreateGameBoardMutation>;
export type CreateGameBoardMutationResult = Apollo.MutationResult<CreateGameBoardMutation>;
export type CreateGameBoardMutationOptions = Apollo.BaseMutationOptions<CreateGameBoardMutation, CreateGameBoardMutationVariables>;
export const UpdateGameBoardTitleDocument = gql`
    mutation UpdateGameBoardTitle($boardId: Int!, $title: String!) {
  updateGameBoard(input: {boardId: $boardId, title: $title}) {
    id
    title
    categories
  }
}
    `;
export type UpdateGameBoardTitleMutationFn = Apollo.MutationFunction<UpdateGameBoardTitleMutation, UpdateGameBoardTitleMutationVariables>;

/**
 * __useUpdateGameBoardTitleMutation__
 *
 * To run a mutation, you first call `useUpdateGameBoardTitleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateGameBoardTitleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateGameBoardTitleMutation, { data, loading, error }] = useUpdateGameBoardTitleMutation({
 *   variables: {
 *      boardId: // value for 'boardId'
 *      title: // value for 'title'
 *   },
 * });
 */
export function useUpdateGameBoardTitleMutation(baseOptions?: Apollo.MutationHookOptions<UpdateGameBoardTitleMutation, UpdateGameBoardTitleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateGameBoardTitleMutation, UpdateGameBoardTitleMutationVariables>(UpdateGameBoardTitleDocument, options);
      }
export type UpdateGameBoardTitleMutationHookResult = ReturnType<typeof useUpdateGameBoardTitleMutation>;
export type UpdateGameBoardTitleMutationResult = Apollo.MutationResult<UpdateGameBoardTitleMutation>;
export type UpdateGameBoardTitleMutationOptions = Apollo.BaseMutationOptions<UpdateGameBoardTitleMutation, UpdateGameBoardTitleMutationVariables>;
export const UpdateGameBoardCategoryDocument = gql`
    mutation UpdateGameBoardCategory($gameBoardId: Int!, $index: Int!, $category: String!) {
  updateGameBoardCategory(
    gameBoardId: $gameBoardId
    index: $index
    category: $category
  ) {
    id
    createdAt
    updatedAt
    userId
    title
    categories
  }
}
    `;
export type UpdateGameBoardCategoryMutationFn = Apollo.MutationFunction<UpdateGameBoardCategoryMutation, UpdateGameBoardCategoryMutationVariables>;

/**
 * __useUpdateGameBoardCategoryMutation__
 *
 * To run a mutation, you first call `useUpdateGameBoardCategoryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateGameBoardCategoryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateGameBoardCategoryMutation, { data, loading, error }] = useUpdateGameBoardCategoryMutation({
 *   variables: {
 *      gameBoardId: // value for 'gameBoardId'
 *      index: // value for 'index'
 *      category: // value for 'category'
 *   },
 * });
 */
export function useUpdateGameBoardCategoryMutation(baseOptions?: Apollo.MutationHookOptions<UpdateGameBoardCategoryMutation, UpdateGameBoardCategoryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateGameBoardCategoryMutation, UpdateGameBoardCategoryMutationVariables>(UpdateGameBoardCategoryDocument, options);
      }
export type UpdateGameBoardCategoryMutationHookResult = ReturnType<typeof useUpdateGameBoardCategoryMutation>;
export type UpdateGameBoardCategoryMutationResult = Apollo.MutationResult<UpdateGameBoardCategoryMutation>;
export type UpdateGameBoardCategoryMutationOptions = Apollo.BaseMutationOptions<UpdateGameBoardCategoryMutation, UpdateGameBoardCategoryMutationVariables>;
export const CreateGameDocument = gql`
    mutation CreateGame($input: CreateGameInput!) {
  createGame(input: $input) {
    id
    createdAt
    updatedAt
    gameBoardId
    userId
  }
}
    `;
export type CreateGameMutationFn = Apollo.MutationFunction<CreateGameMutation, CreateGameMutationVariables>;

/**
 * __useCreateGameMutation__
 *
 * To run a mutation, you first call `useCreateGameMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateGameMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createGameMutation, { data, loading, error }] = useCreateGameMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateGameMutation(baseOptions?: Apollo.MutationHookOptions<CreateGameMutation, CreateGameMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateGameMutation, CreateGameMutationVariables>(CreateGameDocument, options);
      }
export type CreateGameMutationHookResult = ReturnType<typeof useCreateGameMutation>;
export type CreateGameMutationResult = Apollo.MutationResult<CreateGameMutation>;
export type CreateGameMutationOptions = Apollo.BaseMutationOptions<CreateGameMutation, CreateGameMutationVariables>;
export const CreatePlayerDocument = gql`
    mutation CreatePlayer($input: CreatePlayerInput!) {
  createPlayer(input: $input) {
    id
    createdAt
    updatedAt
    gameId
    playerName
  }
}
    `;
export type CreatePlayerMutationFn = Apollo.MutationFunction<CreatePlayerMutation, CreatePlayerMutationVariables>;

/**
 * __useCreatePlayerMutation__
 *
 * To run a mutation, you first call `useCreatePlayerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePlayerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPlayerMutation, { data, loading, error }] = useCreatePlayerMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreatePlayerMutation(baseOptions?: Apollo.MutationHookOptions<CreatePlayerMutation, CreatePlayerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreatePlayerMutation, CreatePlayerMutationVariables>(CreatePlayerDocument, options);
      }
export type CreatePlayerMutationHookResult = ReturnType<typeof useCreatePlayerMutation>;
export type CreatePlayerMutationResult = Apollo.MutationResult<CreatePlayerMutation>;
export type CreatePlayerMutationOptions = Apollo.BaseMutationOptions<CreatePlayerMutation, CreatePlayerMutationVariables>;
export const UpdatePlayerScoreDocument = gql`
    mutation UpdatePlayerScore($playerId: Int!, $newScore: Int!) {
  updatePlayerScore(playerId: $playerId, score: $newScore) {
    id
    createdAt
    updatedAt
    gameId
    playerName
    score
  }
}
    `;
export type UpdatePlayerScoreMutationFn = Apollo.MutationFunction<UpdatePlayerScoreMutation, UpdatePlayerScoreMutationVariables>;

/**
 * __useUpdatePlayerScoreMutation__
 *
 * To run a mutation, you first call `useUpdatePlayerScoreMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePlayerScoreMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePlayerScoreMutation, { data, loading, error }] = useUpdatePlayerScoreMutation({
 *   variables: {
 *      playerId: // value for 'playerId'
 *      newScore: // value for 'newScore'
 *   },
 * });
 */
export function useUpdatePlayerScoreMutation(baseOptions?: Apollo.MutationHookOptions<UpdatePlayerScoreMutation, UpdatePlayerScoreMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdatePlayerScoreMutation, UpdatePlayerScoreMutationVariables>(UpdatePlayerScoreDocument, options);
      }
export type UpdatePlayerScoreMutationHookResult = ReturnType<typeof useUpdatePlayerScoreMutation>;
export type UpdatePlayerScoreMutationResult = Apollo.MutationResult<UpdatePlayerScoreMutation>;
export type UpdatePlayerScoreMutationOptions = Apollo.BaseMutationOptions<UpdatePlayerScoreMutation, UpdatePlayerScoreMutationVariables>;
export const UpdatePlayerNameDocument = gql`
    mutation UpdatePlayerName($playerId: Int!, $newName: String!) {
  updatePlayerName(playerId: $playerId, playerName: $newName) {
    id
    createdAt
    updatedAt
    gameId
    playerName
    score
  }
}
    `;
export type UpdatePlayerNameMutationFn = Apollo.MutationFunction<UpdatePlayerNameMutation, UpdatePlayerNameMutationVariables>;

/**
 * __useUpdatePlayerNameMutation__
 *
 * To run a mutation, you first call `useUpdatePlayerNameMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePlayerNameMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePlayerNameMutation, { data, loading, error }] = useUpdatePlayerNameMutation({
 *   variables: {
 *      playerId: // value for 'playerId'
 *      newName: // value for 'newName'
 *   },
 * });
 */
export function useUpdatePlayerNameMutation(baseOptions?: Apollo.MutationHookOptions<UpdatePlayerNameMutation, UpdatePlayerNameMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdatePlayerNameMutation, UpdatePlayerNameMutationVariables>(UpdatePlayerNameDocument, options);
      }
export type UpdatePlayerNameMutationHookResult = ReturnType<typeof useUpdatePlayerNameMutation>;
export type UpdatePlayerNameMutationResult = Apollo.MutationResult<UpdatePlayerNameMutation>;
export type UpdatePlayerNameMutationOptions = Apollo.BaseMutationOptions<UpdatePlayerNameMutation, UpdatePlayerNameMutationVariables>;
export const DeletePlayerDocument = gql`
    mutation DeletePlayer($playerId: Int!) {
  deletePlayer(playerId: $playerId) {
    id
    createdAt
    updatedAt
    gameId
    playerName
    score
  }
}
    `;
export type DeletePlayerMutationFn = Apollo.MutationFunction<DeletePlayerMutation, DeletePlayerMutationVariables>;

/**
 * __useDeletePlayerMutation__
 *
 * To run a mutation, you first call `useDeletePlayerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeletePlayerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deletePlayerMutation, { data, loading, error }] = useDeletePlayerMutation({
 *   variables: {
 *      playerId: // value for 'playerId'
 *   },
 * });
 */
export function useDeletePlayerMutation(baseOptions?: Apollo.MutationHookOptions<DeletePlayerMutation, DeletePlayerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeletePlayerMutation, DeletePlayerMutationVariables>(DeletePlayerDocument, options);
      }
export type DeletePlayerMutationHookResult = ReturnType<typeof useDeletePlayerMutation>;
export type DeletePlayerMutationResult = Apollo.MutationResult<DeletePlayerMutation>;
export type DeletePlayerMutationOptions = Apollo.BaseMutationOptions<DeletePlayerMutation, DeletePlayerMutationVariables>;
export const CreateQuestionDocument = gql`
    mutation CreateQuestion($input: CreateQuestionInput!) {
  createQuestion(input: $input) {
    id
    createdAt
    updatedAt
    userId
    question
    answer
  }
}
    `;
export type CreateQuestionMutationFn = Apollo.MutationFunction<CreateQuestionMutation, CreateQuestionMutationVariables>;

/**
 * __useCreateQuestionMutation__
 *
 * To run a mutation, you first call `useCreateQuestionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateQuestionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createQuestionMutation, { data, loading, error }] = useCreateQuestionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateQuestionMutation(baseOptions?: Apollo.MutationHookOptions<CreateQuestionMutation, CreateQuestionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateQuestionMutation, CreateQuestionMutationVariables>(CreateQuestionDocument, options);
      }
export type CreateQuestionMutationHookResult = ReturnType<typeof useCreateQuestionMutation>;
export type CreateQuestionMutationResult = Apollo.MutationResult<CreateQuestionMutation>;
export type CreateQuestionMutationOptions = Apollo.BaseMutationOptions<CreateQuestionMutation, CreateQuestionMutationVariables>;
export const UpdateQuestionDocument = gql`
    mutation UpdateQuestion($input: UpdateQuestionInput!) {
  updateQuestion(input: $input) {
    id
    question
    answer
    createdAt
    updatedAt
    userId
  }
}
    `;
export type UpdateQuestionMutationFn = Apollo.MutationFunction<UpdateQuestionMutation, UpdateQuestionMutationVariables>;

/**
 * __useUpdateQuestionMutation__
 *
 * To run a mutation, you first call `useUpdateQuestionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateQuestionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateQuestionMutation, { data, loading, error }] = useUpdateQuestionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateQuestionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateQuestionMutation, UpdateQuestionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateQuestionMutation, UpdateQuestionMutationVariables>(UpdateQuestionDocument, options);
      }
export type UpdateQuestionMutationHookResult = ReturnType<typeof useUpdateQuestionMutation>;
export type UpdateQuestionMutationResult = Apollo.MutationResult<UpdateQuestionMutation>;
export type UpdateQuestionMutationOptions = Apollo.BaseMutationOptions<UpdateQuestionMutation, UpdateQuestionMutationVariables>;
export const DeleteQuestionDocument = gql`
    mutation DeleteQuestion($questionId: Int!) {
  deleteQuestion(questionId: $questionId)
}
    `;
export type DeleteQuestionMutationFn = Apollo.MutationFunction<DeleteQuestionMutation, DeleteQuestionMutationVariables>;

/**
 * __useDeleteQuestionMutation__
 *
 * To run a mutation, you first call `useDeleteQuestionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteQuestionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteQuestionMutation, { data, loading, error }] = useDeleteQuestionMutation({
 *   variables: {
 *      questionId: // value for 'questionId'
 *   },
 * });
 */
export function useDeleteQuestionMutation(baseOptions?: Apollo.MutationHookOptions<DeleteQuestionMutation, DeleteQuestionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteQuestionMutation, DeleteQuestionMutationVariables>(DeleteQuestionDocument, options);
      }
export type DeleteQuestionMutationHookResult = ReturnType<typeof useDeleteQuestionMutation>;
export type DeleteQuestionMutationResult = Apollo.MutationResult<DeleteQuestionMutation>;
export type DeleteQuestionMutationOptions = Apollo.BaseMutationOptions<DeleteQuestionMutation, DeleteQuestionMutationVariables>;
export const CreateUserDocument = gql`
    mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    firebaseUid
    username
    createdAt
    updatedAt
  }
}
    `;
export type CreateUserMutationFn = Apollo.MutationFunction<CreateUserMutation, CreateUserMutationVariables>;

/**
 * __useCreateUserMutation__
 *
 * To run a mutation, you first call `useCreateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createUserMutation, { data, loading, error }] = useCreateUserMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateUserMutation(baseOptions?: Apollo.MutationHookOptions<CreateUserMutation, CreateUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateUserMutation, CreateUserMutationVariables>(CreateUserDocument, options);
      }
export type CreateUserMutationHookResult = ReturnType<typeof useCreateUserMutation>;
export type CreateUserMutationResult = Apollo.MutationResult<CreateUserMutation>;
export type CreateUserMutationOptions = Apollo.BaseMutationOptions<CreateUserMutation, CreateUserMutationVariables>;
export const FindGbqDocument = gql`
    query FindGBQ($gameBoardId: Int!, $questionId: Int!) {
  findGameBoardQuestion(gameBoardId: $gameBoardId, questionId: $questionId) {
    mapping {
      dailyDouble
      points
      gridRow
      gridCol
    }
    question {
      question
      answer
    }
  }
}
    `;

/**
 * __useFindGbqQuery__
 *
 * To run a query within a React component, call `useFindGbqQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindGbqQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindGbqQuery({
 *   variables: {
 *      gameBoardId: // value for 'gameBoardId'
 *      questionId: // value for 'questionId'
 *   },
 * });
 */
export function useFindGbqQuery(baseOptions: Apollo.QueryHookOptions<FindGbqQuery, FindGbqQueryVariables> & ({ variables: FindGbqQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindGbqQuery, FindGbqQueryVariables>(FindGbqDocument, options);
      }
export function useFindGbqLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindGbqQuery, FindGbqQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindGbqQuery, FindGbqQueryVariables>(FindGbqDocument, options);
        }
export function useFindGbqSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindGbqQuery, FindGbqQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindGbqQuery, FindGbqQueryVariables>(FindGbqDocument, options);
        }
export type FindGbqQueryHookResult = ReturnType<typeof useFindGbqQuery>;
export type FindGbqLazyQueryHookResult = ReturnType<typeof useFindGbqLazyQuery>;
export type FindGbqSuspenseQueryHookResult = ReturnType<typeof useFindGbqSuspenseQuery>;
export type FindGbqQueryResult = Apollo.QueryResult<FindGbqQuery, FindGbqQueryVariables>;
export const FetchGbQsDocument = gql`
    query FetchGBQs($gameBoardId: Int!) {
  fetchGameBoardQuestions(gameBoardId: $gameBoardId) {
    mapping {
      boardId
      questionId
      dailyDouble
      points
      gridRow
      gridCol
    }
    question {
      id
      createdAt
      updatedAt
      userId
      user {
        id
        createdAt
        updatedAt
        firebaseUid
        username
      }
      question
      answer
    }
  }
}
    `;

/**
 * __useFetchGbQsQuery__
 *
 * To run a query within a React component, call `useFetchGbQsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFetchGbQsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFetchGbQsQuery({
 *   variables: {
 *      gameBoardId: // value for 'gameBoardId'
 *   },
 * });
 */
export function useFetchGbQsQuery(baseOptions: Apollo.QueryHookOptions<FetchGbQsQuery, FetchGbQsQueryVariables> & ({ variables: FetchGbQsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FetchGbQsQuery, FetchGbQsQueryVariables>(FetchGbQsDocument, options);
      }
export function useFetchGbQsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FetchGbQsQuery, FetchGbQsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FetchGbQsQuery, FetchGbQsQueryVariables>(FetchGbQsDocument, options);
        }
export function useFetchGbQsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FetchGbQsQuery, FetchGbQsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FetchGbQsQuery, FetchGbQsQueryVariables>(FetchGbQsDocument, options);
        }
export type FetchGbQsQueryHookResult = ReturnType<typeof useFetchGbQsQuery>;
export type FetchGbQsLazyQueryHookResult = ReturnType<typeof useFetchGbQsLazyQuery>;
export type FetchGbQsSuspenseQueryHookResult = ReturnType<typeof useFetchGbQsSuspenseQuery>;
export type FetchGbQsQueryResult = Apollo.QueryResult<FetchGbQsQuery, FetchGbQsQueryVariables>;
export const FindGameBoardMappingDocument = gql`
    query FindGameBoardMapping($gameBoardId: Int!, $questionId: Int!) {
  findGameBoardMapping(gameBoardId: $gameBoardId, questionId: $questionId) {
    boardId
    questionId
    dailyDouble
    points
    gridRow
    gridCol
  }
}
    `;

/**
 * __useFindGameBoardMappingQuery__
 *
 * To run a query within a React component, call `useFindGameBoardMappingQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindGameBoardMappingQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindGameBoardMappingQuery({
 *   variables: {
 *      gameBoardId: // value for 'gameBoardId'
 *      questionId: // value for 'questionId'
 *   },
 * });
 */
export function useFindGameBoardMappingQuery(baseOptions: Apollo.QueryHookOptions<FindGameBoardMappingQuery, FindGameBoardMappingQueryVariables> & ({ variables: FindGameBoardMappingQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindGameBoardMappingQuery, FindGameBoardMappingQueryVariables>(FindGameBoardMappingDocument, options);
      }
export function useFindGameBoardMappingLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindGameBoardMappingQuery, FindGameBoardMappingQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindGameBoardMappingQuery, FindGameBoardMappingQueryVariables>(FindGameBoardMappingDocument, options);
        }
export function useFindGameBoardMappingSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindGameBoardMappingQuery, FindGameBoardMappingQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindGameBoardMappingQuery, FindGameBoardMappingQueryVariables>(FindGameBoardMappingDocument, options);
        }
export type FindGameBoardMappingQueryHookResult = ReturnType<typeof useFindGameBoardMappingQuery>;
export type FindGameBoardMappingLazyQueryHookResult = ReturnType<typeof useFindGameBoardMappingLazyQuery>;
export type FindGameBoardMappingSuspenseQueryHookResult = ReturnType<typeof useFindGameBoardMappingSuspenseQuery>;
export type FindGameBoardMappingQueryResult = Apollo.QueryResult<FindGameBoardMappingQuery, FindGameBoardMappingQueryVariables>;
export const FetchGameBoardMappingsDocument = gql`
    query FetchGameBoardMappings($gameBoardId: Int!) {
  fetchGameBoardMappings(gameBoardId: $gameBoardId) {
    boardId
    questionId
    dailyDouble
    points
    gridRow
    gridCol
  }
}
    `;

/**
 * __useFetchGameBoardMappingsQuery__
 *
 * To run a query within a React component, call `useFetchGameBoardMappingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFetchGameBoardMappingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFetchGameBoardMappingsQuery({
 *   variables: {
 *      gameBoardId: // value for 'gameBoardId'
 *   },
 * });
 */
export function useFetchGameBoardMappingsQuery(baseOptions: Apollo.QueryHookOptions<FetchGameBoardMappingsQuery, FetchGameBoardMappingsQueryVariables> & ({ variables: FetchGameBoardMappingsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FetchGameBoardMappingsQuery, FetchGameBoardMappingsQueryVariables>(FetchGameBoardMappingsDocument, options);
      }
export function useFetchGameBoardMappingsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FetchGameBoardMappingsQuery, FetchGameBoardMappingsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FetchGameBoardMappingsQuery, FetchGameBoardMappingsQueryVariables>(FetchGameBoardMappingsDocument, options);
        }
export function useFetchGameBoardMappingsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FetchGameBoardMappingsQuery, FetchGameBoardMappingsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FetchGameBoardMappingsQuery, FetchGameBoardMappingsQueryVariables>(FetchGameBoardMappingsDocument, options);
        }
export type FetchGameBoardMappingsQueryHookResult = ReturnType<typeof useFetchGameBoardMappingsQuery>;
export type FetchGameBoardMappingsLazyQueryHookResult = ReturnType<typeof useFetchGameBoardMappingsLazyQuery>;
export type FetchGameBoardMappingsSuspenseQueryHookResult = ReturnType<typeof useFetchGameBoardMappingsSuspenseQuery>;
export type FetchGameBoardMappingsQueryResult = Apollo.QueryResult<FetchGameBoardMappingsQuery, FetchGameBoardMappingsQueryVariables>;
export const FetchAllGameBoardsDocument = gql`
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

/**
 * __useFetchAllGameBoardsQuery__
 *
 * To run a query within a React component, call `useFetchAllGameBoardsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFetchAllGameBoardsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFetchAllGameBoardsQuery({
 *   variables: {
 *   },
 * });
 */
export function useFetchAllGameBoardsQuery(baseOptions?: Apollo.QueryHookOptions<FetchAllGameBoardsQuery, FetchAllGameBoardsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FetchAllGameBoardsQuery, FetchAllGameBoardsQueryVariables>(FetchAllGameBoardsDocument, options);
      }
export function useFetchAllGameBoardsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FetchAllGameBoardsQuery, FetchAllGameBoardsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FetchAllGameBoardsQuery, FetchAllGameBoardsQueryVariables>(FetchAllGameBoardsDocument, options);
        }
export function useFetchAllGameBoardsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FetchAllGameBoardsQuery, FetchAllGameBoardsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FetchAllGameBoardsQuery, FetchAllGameBoardsQueryVariables>(FetchAllGameBoardsDocument, options);
        }
export type FetchAllGameBoardsQueryHookResult = ReturnType<typeof useFetchAllGameBoardsQuery>;
export type FetchAllGameBoardsLazyQueryHookResult = ReturnType<typeof useFetchAllGameBoardsLazyQuery>;
export type FetchAllGameBoardsSuspenseQueryHookResult = ReturnType<typeof useFetchAllGameBoardsSuspenseQuery>;
export type FetchAllGameBoardsQueryResult = Apollo.QueryResult<FetchAllGameBoardsQuery, FetchAllGameBoardsQueryVariables>;
export const FetchGameBoardsFromUserDocument = gql`
    query FetchGameBoardsFromUser($userId: Int!) {
  fetchGameBoardsFromUser(userId: $userId) {
    id
    createdAt
    updatedAt
    userId
    title
    categories
  }
}
    `;

/**
 * __useFetchGameBoardsFromUserQuery__
 *
 * To run a query within a React component, call `useFetchGameBoardsFromUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useFetchGameBoardsFromUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFetchGameBoardsFromUserQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useFetchGameBoardsFromUserQuery(baseOptions: Apollo.QueryHookOptions<FetchGameBoardsFromUserQuery, FetchGameBoardsFromUserQueryVariables> & ({ variables: FetchGameBoardsFromUserQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FetchGameBoardsFromUserQuery, FetchGameBoardsFromUserQueryVariables>(FetchGameBoardsFromUserDocument, options);
      }
export function useFetchGameBoardsFromUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FetchGameBoardsFromUserQuery, FetchGameBoardsFromUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FetchGameBoardsFromUserQuery, FetchGameBoardsFromUserQueryVariables>(FetchGameBoardsFromUserDocument, options);
        }
export function useFetchGameBoardsFromUserSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FetchGameBoardsFromUserQuery, FetchGameBoardsFromUserQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FetchGameBoardsFromUserQuery, FetchGameBoardsFromUserQueryVariables>(FetchGameBoardsFromUserDocument, options);
        }
export type FetchGameBoardsFromUserQueryHookResult = ReturnType<typeof useFetchGameBoardsFromUserQuery>;
export type FetchGameBoardsFromUserLazyQueryHookResult = ReturnType<typeof useFetchGameBoardsFromUserLazyQuery>;
export type FetchGameBoardsFromUserSuspenseQueryHookResult = ReturnType<typeof useFetchGameBoardsFromUserSuspenseQuery>;
export type FetchGameBoardsFromUserQueryResult = Apollo.QueryResult<FetchGameBoardsFromUserQuery, FetchGameBoardsFromUserQueryVariables>;
export const FindGameBoardDocument = gql`
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

/**
 * __useFindGameBoardQuery__
 *
 * To run a query within a React component, call `useFindGameBoardQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindGameBoardQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindGameBoardQuery({
 *   variables: {
 *      gameBoardId: // value for 'gameBoardId'
 *   },
 * });
 */
export function useFindGameBoardQuery(baseOptions: Apollo.QueryHookOptions<FindGameBoardQuery, FindGameBoardQueryVariables> & ({ variables: FindGameBoardQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindGameBoardQuery, FindGameBoardQueryVariables>(FindGameBoardDocument, options);
      }
export function useFindGameBoardLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindGameBoardQuery, FindGameBoardQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindGameBoardQuery, FindGameBoardQueryVariables>(FindGameBoardDocument, options);
        }
export function useFindGameBoardSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindGameBoardQuery, FindGameBoardQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindGameBoardQuery, FindGameBoardQueryVariables>(FindGameBoardDocument, options);
        }
export type FindGameBoardQueryHookResult = ReturnType<typeof useFindGameBoardQuery>;
export type FindGameBoardLazyQueryHookResult = ReturnType<typeof useFindGameBoardLazyQuery>;
export type FindGameBoardSuspenseQueryHookResult = ReturnType<typeof useFindGameBoardSuspenseQuery>;
export type FindGameBoardQueryResult = Apollo.QueryResult<FindGameBoardQuery, FindGameBoardQueryVariables>;
export const FindGameDocument = gql`
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

/**
 * __useFindGameQuery__
 *
 * To run a query within a React component, call `useFindGameQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindGameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindGameQuery({
 *   variables: {
 *      gameId: // value for 'gameId'
 *   },
 * });
 */
export function useFindGameQuery(baseOptions: Apollo.QueryHookOptions<FindGameQuery, FindGameQueryVariables> & ({ variables: FindGameQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindGameQuery, FindGameQueryVariables>(FindGameDocument, options);
      }
export function useFindGameLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindGameQuery, FindGameQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindGameQuery, FindGameQueryVariables>(FindGameDocument, options);
        }
export function useFindGameSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindGameQuery, FindGameQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindGameQuery, FindGameQueryVariables>(FindGameDocument, options);
        }
export type FindGameQueryHookResult = ReturnType<typeof useFindGameQuery>;
export type FindGameLazyQueryHookResult = ReturnType<typeof useFindGameLazyQuery>;
export type FindGameSuspenseQueryHookResult = ReturnType<typeof useFindGameSuspenseQuery>;
export type FindGameQueryResult = Apollo.QueryResult<FindGameQuery, FindGameQueryVariables>;
export const FetchGamesFromUserDocument = gql`
    query FetchGamesFromUser($userId: Int!) {
  fetchGamesFromUser(userId: $userId) {
    id
    createdAt
    updatedAt
    userId
    gameBoardId
  }
}
    `;

/**
 * __useFetchGamesFromUserQuery__
 *
 * To run a query within a React component, call `useFetchGamesFromUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useFetchGamesFromUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFetchGamesFromUserQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useFetchGamesFromUserQuery(baseOptions: Apollo.QueryHookOptions<FetchGamesFromUserQuery, FetchGamesFromUserQueryVariables> & ({ variables: FetchGamesFromUserQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FetchGamesFromUserQuery, FetchGamesFromUserQueryVariables>(FetchGamesFromUserDocument, options);
      }
export function useFetchGamesFromUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FetchGamesFromUserQuery, FetchGamesFromUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FetchGamesFromUserQuery, FetchGamesFromUserQueryVariables>(FetchGamesFromUserDocument, options);
        }
export function useFetchGamesFromUserSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FetchGamesFromUserQuery, FetchGamesFromUserQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FetchGamesFromUserQuery, FetchGamesFromUserQueryVariables>(FetchGamesFromUserDocument, options);
        }
export type FetchGamesFromUserQueryHookResult = ReturnType<typeof useFetchGamesFromUserQuery>;
export type FetchGamesFromUserLazyQueryHookResult = ReturnType<typeof useFetchGamesFromUserLazyQuery>;
export type FetchGamesFromUserSuspenseQueryHookResult = ReturnType<typeof useFetchGamesFromUserSuspenseQuery>;
export type FetchGamesFromUserQueryResult = Apollo.QueryResult<FetchGamesFromUserQuery, FetchGamesFromUserQueryVariables>;
export const FindPlayerDocument = gql`
    query FindPlayer($playerId: Int!) {
  findPlayer(playerId: $playerId) {
    id
    createdAt
    updatedAt
    playerName
    gameId
    score
  }
}
    `;

/**
 * __useFindPlayerQuery__
 *
 * To run a query within a React component, call `useFindPlayerQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindPlayerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindPlayerQuery({
 *   variables: {
 *      playerId: // value for 'playerId'
 *   },
 * });
 */
export function useFindPlayerQuery(baseOptions: Apollo.QueryHookOptions<FindPlayerQuery, FindPlayerQueryVariables> & ({ variables: FindPlayerQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindPlayerQuery, FindPlayerQueryVariables>(FindPlayerDocument, options);
      }
export function useFindPlayerLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindPlayerQuery, FindPlayerQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindPlayerQuery, FindPlayerQueryVariables>(FindPlayerDocument, options);
        }
export function useFindPlayerSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindPlayerQuery, FindPlayerQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindPlayerQuery, FindPlayerQueryVariables>(FindPlayerDocument, options);
        }
export type FindPlayerQueryHookResult = ReturnType<typeof useFindPlayerQuery>;
export type FindPlayerLazyQueryHookResult = ReturnType<typeof useFindPlayerLazyQuery>;
export type FindPlayerSuspenseQueryHookResult = ReturnType<typeof useFindPlayerSuspenseQuery>;
export type FindPlayerQueryResult = Apollo.QueryResult<FindPlayerQuery, FindPlayerQueryVariables>;
export const FetchPlayersFromGameDocument = gql`
    query FetchPlayersFromGame($gameId: Int!) {
  fetchPlayersFromGame(gameId: $gameId) {
    id
    createdAt
    updatedAt
    playerName
    gameId
    score
  }
}
    `;

/**
 * __useFetchPlayersFromGameQuery__
 *
 * To run a query within a React component, call `useFetchPlayersFromGameQuery` and pass it any options that fit your needs.
 * When your component renders, `useFetchPlayersFromGameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFetchPlayersFromGameQuery({
 *   variables: {
 *      gameId: // value for 'gameId'
 *   },
 * });
 */
export function useFetchPlayersFromGameQuery(baseOptions: Apollo.QueryHookOptions<FetchPlayersFromGameQuery, FetchPlayersFromGameQueryVariables> & ({ variables: FetchPlayersFromGameQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FetchPlayersFromGameQuery, FetchPlayersFromGameQueryVariables>(FetchPlayersFromGameDocument, options);
      }
export function useFetchPlayersFromGameLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FetchPlayersFromGameQuery, FetchPlayersFromGameQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FetchPlayersFromGameQuery, FetchPlayersFromGameQueryVariables>(FetchPlayersFromGameDocument, options);
        }
export function useFetchPlayersFromGameSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FetchPlayersFromGameQuery, FetchPlayersFromGameQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FetchPlayersFromGameQuery, FetchPlayersFromGameQueryVariables>(FetchPlayersFromGameDocument, options);
        }
export type FetchPlayersFromGameQueryHookResult = ReturnType<typeof useFetchPlayersFromGameQuery>;
export type FetchPlayersFromGameLazyQueryHookResult = ReturnType<typeof useFetchPlayersFromGameLazyQuery>;
export type FetchPlayersFromGameSuspenseQueryHookResult = ReturnType<typeof useFetchPlayersFromGameSuspenseQuery>;
export type FetchPlayersFromGameQueryResult = Apollo.QueryResult<FetchPlayersFromGameQuery, FetchPlayersFromGameQueryVariables>;
export const FetchAllQuestionsDocument = gql`
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

/**
 * __useFetchAllQuestionsQuery__
 *
 * To run a query within a React component, call `useFetchAllQuestionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFetchAllQuestionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFetchAllQuestionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useFetchAllQuestionsQuery(baseOptions?: Apollo.QueryHookOptions<FetchAllQuestionsQuery, FetchAllQuestionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FetchAllQuestionsQuery, FetchAllQuestionsQueryVariables>(FetchAllQuestionsDocument, options);
      }
export function useFetchAllQuestionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FetchAllQuestionsQuery, FetchAllQuestionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FetchAllQuestionsQuery, FetchAllQuestionsQueryVariables>(FetchAllQuestionsDocument, options);
        }
export function useFetchAllQuestionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FetchAllQuestionsQuery, FetchAllQuestionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FetchAllQuestionsQuery, FetchAllQuestionsQueryVariables>(FetchAllQuestionsDocument, options);
        }
export type FetchAllQuestionsQueryHookResult = ReturnType<typeof useFetchAllQuestionsQuery>;
export type FetchAllQuestionsLazyQueryHookResult = ReturnType<typeof useFetchAllQuestionsLazyQuery>;
export type FetchAllQuestionsSuspenseQueryHookResult = ReturnType<typeof useFetchAllQuestionsSuspenseQuery>;
export type FetchAllQuestionsQueryResult = Apollo.QueryResult<FetchAllQuestionsQuery, FetchAllQuestionsQueryVariables>;
export const FetchQuestionsFromIdsDocument = gql`
    query fetchQuestionsFromIds($questionIds: [Int!]!) {
  fetchQuestionsFromIds(questionIds: $questionIds) {
    id
    createdAt
    updatedAt
    userId
    question
    answer
  }
}
    `;

/**
 * __useFetchQuestionsFromIdsQuery__
 *
 * To run a query within a React component, call `useFetchQuestionsFromIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFetchQuestionsFromIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFetchQuestionsFromIdsQuery({
 *   variables: {
 *      questionIds: // value for 'questionIds'
 *   },
 * });
 */
export function useFetchQuestionsFromIdsQuery(baseOptions: Apollo.QueryHookOptions<FetchQuestionsFromIdsQuery, FetchQuestionsFromIdsQueryVariables> & ({ variables: FetchQuestionsFromIdsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FetchQuestionsFromIdsQuery, FetchQuestionsFromIdsQueryVariables>(FetchQuestionsFromIdsDocument, options);
      }
export function useFetchQuestionsFromIdsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FetchQuestionsFromIdsQuery, FetchQuestionsFromIdsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FetchQuestionsFromIdsQuery, FetchQuestionsFromIdsQueryVariables>(FetchQuestionsFromIdsDocument, options);
        }
export function useFetchQuestionsFromIdsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FetchQuestionsFromIdsQuery, FetchQuestionsFromIdsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FetchQuestionsFromIdsQuery, FetchQuestionsFromIdsQueryVariables>(FetchQuestionsFromIdsDocument, options);
        }
export type FetchQuestionsFromIdsQueryHookResult = ReturnType<typeof useFetchQuestionsFromIdsQuery>;
export type FetchQuestionsFromIdsLazyQueryHookResult = ReturnType<typeof useFetchQuestionsFromIdsLazyQuery>;
export type FetchQuestionsFromIdsSuspenseQueryHookResult = ReturnType<typeof useFetchQuestionsFromIdsSuspenseQuery>;
export type FetchQuestionsFromIdsQueryResult = Apollo.QueryResult<FetchQuestionsFromIdsQuery, FetchQuestionsFromIdsQueryVariables>;
export const FindQuestionDocument = gql`
    query findQuestion($questionId: Int!) {
  findQuestion(questionId: $questionId) {
    id
    createdAt
    updatedAt
    userId
    question
    answer
  }
}
    `;

/**
 * __useFindQuestionQuery__
 *
 * To run a query within a React component, call `useFindQuestionQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindQuestionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindQuestionQuery({
 *   variables: {
 *      questionId: // value for 'questionId'
 *   },
 * });
 */
export function useFindQuestionQuery(baseOptions: Apollo.QueryHookOptions<FindQuestionQuery, FindQuestionQueryVariables> & ({ variables: FindQuestionQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindQuestionQuery, FindQuestionQueryVariables>(FindQuestionDocument, options);
      }
export function useFindQuestionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindQuestionQuery, FindQuestionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindQuestionQuery, FindQuestionQueryVariables>(FindQuestionDocument, options);
        }
export function useFindQuestionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindQuestionQuery, FindQuestionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindQuestionQuery, FindQuestionQueryVariables>(FindQuestionDocument, options);
        }
export type FindQuestionQueryHookResult = ReturnType<typeof useFindQuestionQuery>;
export type FindQuestionLazyQueryHookResult = ReturnType<typeof useFindQuestionLazyQuery>;
export type FindQuestionSuspenseQueryHookResult = ReturnType<typeof useFindQuestionSuspenseQuery>;
export type FindQuestionQueryResult = Apollo.QueryResult<FindQuestionQuery, FindQuestionQueryVariables>;
export const FetchAllUsersDocument = gql`
    query fetchAllUsers {
  fetchAllUsers {
    id
    firebaseUid
    username
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useFetchAllUsersQuery__
 *
 * To run a query within a React component, call `useFetchAllUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useFetchAllUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFetchAllUsersQuery({
 *   variables: {
 *   },
 * });
 */
export function useFetchAllUsersQuery(baseOptions?: Apollo.QueryHookOptions<FetchAllUsersQuery, FetchAllUsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FetchAllUsersQuery, FetchAllUsersQueryVariables>(FetchAllUsersDocument, options);
      }
export function useFetchAllUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FetchAllUsersQuery, FetchAllUsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FetchAllUsersQuery, FetchAllUsersQueryVariables>(FetchAllUsersDocument, options);
        }
export function useFetchAllUsersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FetchAllUsersQuery, FetchAllUsersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FetchAllUsersQuery, FetchAllUsersQueryVariables>(FetchAllUsersDocument, options);
        }
export type FetchAllUsersQueryHookResult = ReturnType<typeof useFetchAllUsersQuery>;
export type FetchAllUsersLazyQueryHookResult = ReturnType<typeof useFetchAllUsersLazyQuery>;
export type FetchAllUsersSuspenseQueryHookResult = ReturnType<typeof useFetchAllUsersSuspenseQuery>;
export type FetchAllUsersQueryResult = Apollo.QueryResult<FetchAllUsersQuery, FetchAllUsersQueryVariables>;
export const FindUserDocument = gql`
    query findUser($userId: Int!) {
  findUser(userId: $userId) {
    id
    firebaseUid
    username
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useFindUserQuery__
 *
 * To run a query within a React component, call `useFindUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindUserQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useFindUserQuery(baseOptions: Apollo.QueryHookOptions<FindUserQuery, FindUserQueryVariables> & ({ variables: FindUserQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindUserQuery, FindUserQueryVariables>(FindUserDocument, options);
      }
export function useFindUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindUserQuery, FindUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindUserQuery, FindUserQueryVariables>(FindUserDocument, options);
        }
export function useFindUserSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindUserQuery, FindUserQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindUserQuery, FindUserQueryVariables>(FindUserDocument, options);
        }
export type FindUserQueryHookResult = ReturnType<typeof useFindUserQuery>;
export type FindUserLazyQueryHookResult = ReturnType<typeof useFindUserLazyQuery>;
export type FindUserSuspenseQueryHookResult = ReturnType<typeof useFindUserSuspenseQuery>;
export type FindUserQueryResult = Apollo.QueryResult<FindUserQuery, FindUserQueryVariables>;
export const FindUserByFirebaseUidDocument = gql`
    query findUserByFirebaseUid($firebaseUid: String!) {
  findUserByFirebaseUid(firebaseUid: $firebaseUid) {
    id
    firebaseUid
    username
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useFindUserByFirebaseUidQuery__
 *
 * To run a query within a React component, call `useFindUserByFirebaseUidQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindUserByFirebaseUidQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindUserByFirebaseUidQuery({
 *   variables: {
 *      firebaseUid: // value for 'firebaseUid'
 *   },
 * });
 */
export function useFindUserByFirebaseUidQuery(baseOptions: Apollo.QueryHookOptions<FindUserByFirebaseUidQuery, FindUserByFirebaseUidQueryVariables> & ({ variables: FindUserByFirebaseUidQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindUserByFirebaseUidQuery, FindUserByFirebaseUidQueryVariables>(FindUserByFirebaseUidDocument, options);
      }
export function useFindUserByFirebaseUidLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindUserByFirebaseUidQuery, FindUserByFirebaseUidQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindUserByFirebaseUidQuery, FindUserByFirebaseUidQueryVariables>(FindUserByFirebaseUidDocument, options);
        }
export function useFindUserByFirebaseUidSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<FindUserByFirebaseUidQuery, FindUserByFirebaseUidQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<FindUserByFirebaseUidQuery, FindUserByFirebaseUidQueryVariables>(FindUserByFirebaseUidDocument, options);
        }
export type FindUserByFirebaseUidQueryHookResult = ReturnType<typeof useFindUserByFirebaseUidQuery>;
export type FindUserByFirebaseUidLazyQueryHookResult = ReturnType<typeof useFindUserByFirebaseUidLazyQuery>;
export type FindUserByFirebaseUidSuspenseQueryHookResult = ReturnType<typeof useFindUserByFirebaseUidSuspenseQuery>;
export type FindUserByFirebaseUidQueryResult = Apollo.QueryResult<FindUserByFirebaseUidQuery, FindUserByFirebaseUidQueryVariables>;