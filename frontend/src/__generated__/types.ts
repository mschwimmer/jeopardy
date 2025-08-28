export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
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
  roomCode: Scalars['String']['output'];
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
  /** Find a single game by room code */
  findGameByRoomCode: Game;
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


export type RootQueryFindGameByRoomCodeArgs = {
  roomCode: Scalars['String']['input'];
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
  /**
   * Optional list of category names. Each entry may be `None` to represent
   * a NULL category value.
   */
  categories?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
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
