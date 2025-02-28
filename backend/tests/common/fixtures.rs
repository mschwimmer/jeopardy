// tests/common/fixtures.rs

use super::factories::{
    create_test_game_board, create_test_game_board_question_mapping, create_test_question,
    create_test_user,
};
use backend::models::game_board::{GameBoard, NewGameBoard};
use backend::models::game_board_question_mapping::{
    GameBoardQuestionMapping, NewGameBoardQuestionMapping,
};
use backend::models::question::{NewQuestion, Question};
use backend::models::user::User;
use diesel_async::AsyncPgConnection;

/// Creates a test fixture with a specified number of game boards and questions.
///
/// # Parameters
/// - `conn`: A mutable reference to the database connection.
/// - `username`: The username for the test user.
/// - `num_game_boards`: Number of game boards to create for the user.
/// - `questions_per_board`: Number of questions to create per game board.
///
/// # Returns
/// - `(User, Vec<GameBoard>, Vec<Question>)`: The created user, their game boards, and associated questions.
///
/// # Panics
/// - If fixture creation fails.
///
/// # Examples
///
/// ```rust
/// let (user, game_boards, questions) = comprehensive_fixture(conn, "TestUser", 2, 5).await;
/// ```
pub async fn comprehensive_fixture(
    conn: &mut AsyncPgConnection,
    username: &str,
    num_game_boards: usize,
    questions_per_board: usize,
) -> (User, Vec<GameBoard>, Vec<Question>) {
    // Create test user
    let user = create_test_user(conn, Some(username.to_string()), None).await;

    // Create game boards
    let mut game_boards = Vec::new();
    for i in 1..=num_game_boards {
        let board_title = format!("{}'s Board {}", username, i);
        let game_board = create_test_game_board(
            conn,
            user.id,
            Some(NewGameBoard {
                user_id: user.id,
                title: board_title,
            }),
        )
        .await;
        game_boards.push(game_board);
    }

    // Create questions
    let mut questions = Vec::new();
    for i in 1..=(num_game_boards * questions_per_board) {
        let question_text = format!("Question {}", i);
        let answer_text = format!("Answer {}", i);
        let question = create_test_question(
            conn,
            user.id,
            Some(NewQuestion {
                user_id: user.id,
                question: question_text,
                answer: answer_text,
            }),
        )
        .await;
        questions.push(question);
    }

    // Associate questions with game boards
    for (board_index, game_board) in game_boards.iter().enumerate() {
        for q in 0..questions_per_board {
            let question = &questions[board_index * questions_per_board + q];
            let points: i32 = ((q + 1) * 100) as i32;
            let grid_row = q as i32;
            let grid_col = board_index as i32;

            let mapping = create_test_game_board_question_mapping(
                conn,
                game_board.id,
                question.id,
                Some(NewGameBoardQuestionMapping {
                    board_id: game_board.id,
                    question_id: question.id,
                    daily_double: q % 5 == 0, // Every 5th question is a Daily Double
                    points,
                    grid_row,
                    grid_col,
                }),
            )
            .await;

            println!(
                "Created Mapping: Board ID {}, Question ID {}",
                mapping.board_id, mapping.question_id
            );
        }
    }

    (user, game_boards, questions)
}

/// Creates a test fixture with a game board and associated questions.
///
/// # Parameters
/// - `conn`: A mutable reference to the database connection.
/// - `username`: The username for the test user.
///
/// # Returns
/// - `(GameBoard, Vec<BoardQuestion>, Vec<Question>)`: The created game board, associated board questions, and questions.
///
/// # Panics
/// - If fixture creation fails.
///
/// # Examples
///
/// ```rust
/// let (game_board, board_questions, questions) = board_with_questions_fixture(conn, "TestUser").await;
/// ```
pub async fn board_with_questions_fixture(
    conn: &mut AsyncPgConnection,
    username: &str,
) -> (GameBoard, Vec<GameBoardQuestionMapping>, Vec<Question>) {
    let (_user, game_boards, questions) = comprehensive_fixture(conn, username, 1, 5).await;

    let game_board = &game_boards[0];
    let mappings = GameBoardQuestionMapping::fetch_mappings_by_board_id(conn, game_board.id)
        .await
        .expect("Failed to fetch board questions");

    let associated_questions: Vec<Question> = mappings
        .iter()
        .map(|bq| {
            questions
                .iter()
                .find(|q| q.id == bq.question_id)
                .expect("Question not found")
                .clone()
        })
        .collect();

    (game_board.clone(), mappings, associated_questions)
}
