// tests/common/factories.rs

use backend::models::game_board::{GameBoard, NewGameBoard, NewGameBoardBuilder};
use backend::models::game_board_question_mapping::{
    GameBoardQuestionMapping, NewGameBoardQuestionMapping, NewGameBoardQuestionMappingBuilder,
};
use backend::models::question::{NewQuestion, NewQuestionBuilder, Question};
use backend::models::user::User;
use diesel_async::AsyncPgConnection;

/// Creates a new test user with default values.
///
/// # Parameters
/// - `conn`: A mutable reference to the database connection.
/// - `overrides`: Optional `NewUser` struct to override default fields.
///
/// # Returns
/// - `User`: The created `User` instance.
///
/// # Panics
/// - If user creation fails.
///
/// # Examples
///
/// ```rust
/// let user = create_test_user(conn, None).await;
/// let custom_user = create_test_user(conn, Some(NewUser { username: "custom".to_string(), ..Default::default() })).await;
/// ```
pub async fn create_test_user(
    conn: &mut AsyncPgConnection,
    username: Option<String>,
    firebase_uid: Option<String>,
) -> User {
    User::create(
        conn,
        username.unwrap_or("defaultuser".to_string()),
        firebase_uid.unwrap_or("defaultuid".to_string()),
    )
    .await
    .expect("Failed to create test user")
}

/// Creates a new test game board with default values
///
/// # Paremeters
/// - `conn`: A mutable reference to the database connection
/// - `user_id`: a valid 'user_id' to associate game board with a user
/// - `overrides`: Optional `NewGameBoard` struct to override default fields
///
/// # Returns
/// - `GameBoard`: The created `GameBoard` instance
///
/// # Panics
/// - If gameboard creation fails
///
/// # Examples
///
/// ```rust
/// let game_board = create_test_game_board(conn, 7, None).await;
/// let custom_game_board = create_test_game_board(conn, 7,
///                             Some(NewGameBoard {
///                                 board_name: "custom".to_string(),
///                                 ..Default::default()
///                             })).await;
/// ```
pub async fn create_test_game_board(
    conn: &mut AsyncPgConnection,
    user_id: i64,
    overrides: Option<NewGameBoard>,
) -> GameBoard {
    let mut builder: NewGameBoardBuilder = NewGameBoardBuilder::default();

    if let Some(overrides) = overrides {
        builder.title(overrides.title);
        builder.user_id(user_id);
    } else {
        builder.user_id(user_id);
        builder.title("defaultboard".to_string());
    }

    let new_game_board: NewGameBoard = builder.build().expect("Faild to build new game board");

    GameBoard::create(conn, new_game_board)
        .await
        .expect("Failed to create test game board")
}

/// Creates a new question with default values
///
/// # Parameters
/// - `conn`: A mutable reference to the database connection.
/// - `user_id`: a valid 'user_id' to associate question with a user
/// - `overrides`: Optional `NewQuestion` struct to override default fields.
///
/// # Returns
/// - `Question`: The created `Question` instance.
///
/// # Panics
/// - If question creation fails.
///
/// # Examples
///
/// ```rust
/// let question = create_test_question(conn, 7, None).await;
/// let custom_question = create_test_question(conn, 7,
///                     Some(NewQuestion { question_text: "custom".to_string(), answer: "custom".to_string(), ..Default::default() })
///                     ).await;
/// ```
pub async fn create_test_question(
    conn: &mut AsyncPgConnection,
    user_id: i64,
    overrides: Option<NewQuestion>,
) -> Question {
    let mut builder: NewQuestionBuilder = NewQuestionBuilder::default();

    if let Some(overrides) = overrides {
        builder.user_id(user_id);
        builder.question(overrides.question);
        builder.answer(overrides.answer);
    } else {
        builder.user_id(user_id);
        builder.question("defaultquestion".to_string());
        builder.answer("defaultanswer".to_string());
    }

    let new_question: NewQuestion = builder.build().expect("Failed to build new question");
    Question::create(conn, new_question)
        .await
        .expect("Failed to create test question")
}

/// Creates a new test board question with default values.
///
/// # Parameters
/// - `conn`: A mutable reference to the database connection.
/// - `board_id`: The ID of the associated game board.
/// - `question_id`: The ID of the associated question.
/// - `overrides`: Optional `NewBoardQuestion` struct to override default fields.
///
/// # Returns
/// - `BoardQuestion`: The created `BoardQuestion` instance.
///
/// # Panics
/// - If board question creation fails.
///
/// # Examples
///
/// ```rust
/// let board_question = create_test_board_question(conn, 1, 1, None).await;
/// let custom_board_question = create_test_board_question(conn, 1, 1, Some(NewBoardQuestion {
///     daily_double: true,
///     points: 200,
///     grid_row: 2,
///     grid_col: 3,
/// })).await;
/// ```
pub async fn create_test_game_board_question_mapping(
    conn: &mut AsyncPgConnection,
    board_id: i64,
    question_id: i64,
    overrides: Option<NewGameBoardQuestionMapping>,
) -> GameBoardQuestionMapping {
    let mut builder: NewGameBoardQuestionMappingBuilder =
        NewGameBoardQuestionMappingBuilder::default();

    // Set mandatory fields
    builder.board_id(board_id).question_id(question_id);

    // Apply overrides if provided
    if let Some(overrides) = overrides {
        builder.daily_double(overrides.daily_double);
        builder.points(overrides.points);
        builder.grid_row(overrides.grid_row);
        builder.grid_col(overrides.grid_col);

        // Add more fields here if `BoardQuestion` has additional fields
    } else {
        // Set default values
        builder
            .daily_double(false)
            .points(100)
            .grid_row(0)
            .grid_col(0);
    }

    let new_mapping: NewGameBoardQuestionMapping =
        builder.build().expect("Failed to build new board question");

    GameBoardQuestionMapping::create_mapping(conn, new_mapping)
        .await
        .expect("Failed to create test board question")
}
