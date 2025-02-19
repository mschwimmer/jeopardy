// tests/integration_tests.rs

// TODO create new tests for categories
mod common;
use async_graphql::{Request, Response, Schema};
use backend::graphql::schema::create_schema;
use backend::models::game_board::{GameBoard, NewGameBoard};
use backend::models::game_board_question_mapping::GameBoardQuestionMapping;
use backend::models::question::Question;
use backend::models::user::User;
use common::factories::{
    create_test_game_board, create_test_game_board_question_mapping, create_test_question,
    create_test_user,
};
use common::fixtures::board_with_questions_fixture;
use common::setup::{
    create_test_database, drop_test_database, establish_super_connection, get_test_database_url,
    run_migrations_sync, TestDB,
};

#[tokio::test]
async fn test_check_backtrace() {
    let backtrace = std::env::var("RUST_BACKTRACE").unwrap_or_else(|_| "not set".to_string());
    println!("RUST_BACKTRACE is set to: {}", backtrace);
    assert!(true); // This is just to ensure the test passes
}

#[tokio::test]
async fn test_compiles() {
    assert!(true);
}

#[tokio::test]
async fn test_setup() {
    let mut super_conn = establish_super_connection()
        .await
        .expect("Couldn't create super_conn");
    println!("Successfully created super_conn");
    let test_db = create_test_database(&mut super_conn)
        .await
        .expect("Couldn't create test_db");
    println!("Successfully created test_db: {}", test_db);
    let test_db_url = get_test_database_url(&test_db);
    println!("Current test_db_url: {}", test_db_url);
    run_migrations_sync(&test_db_url);
    let _test_db_pool =
        backend::db::pool::create_pool(&test_db_url).expect("failed to create pool");

    println!("Now attempting to delete test_db");
    // Await the spawned task to ensure it completes
    let drop_task = tokio::spawn(async move {
        drop_test_database(&mut super_conn, &test_db)
            .await
            .expect("didn't drop test database oopsie");
    });
    drop_task.await.expect("Failed to drop database task");
    println!("Should have deleted test_db by now");
    // assert!(false, "Forcing failure");
}

#[tokio::test]
async fn test_testdb_struct() {
    let mut test_db: TestDB = TestDB::new().await.expect("Failed to initialize test_db");
    println!("Created test_db for {}", test_db.test_db_name);
    let successfully_droppped: bool = test_db.close().await.expect("Failed to close test_db");
    assert!(successfully_droppped, "Close method returned false");
}

#[tokio::test]
async fn test_create_user_model() {
    // Set up test database and schema
    let mut test_db: TestDB = TestDB::new().await.expect("Failed to initialize test_db");

    // Insert a test user into the database
    {
        let mut conn = test_db.pool.get().await.unwrap();

        // Perform user creation inside the transaction
        let created_user: User =
            User::create(&mut conn, "testuser".to_string(), "testuid".to_string())
                .await
                .unwrap();
        println!(
            "Created user: {}, id: {}",
            created_user.username, created_user.id
        );

        // Assert that the created user matches expectations
        assert_eq!(created_user.username, "testuser");
    }

    // Tear down test_db
    let successfully_droppped: bool = test_db.close().await.expect("Failed to close test_db");
    assert!(successfully_droppped, "Close method returned false");
}

#[tokio::test]
async fn test_create_user_graphql() {
    // Set up test database and schema
    let mut test_db: TestDB = TestDB::new().await.expect("Failed to initialize test_db");

    // Build graphql schema with Query and Mutation types
    let schema = create_schema(test_db.pool.clone());

    // Define the GraphQL mutation string
    let mutation = r#"
        mutation {
            createUser(input: { username: "testuser", firebaseUid: "testuid" }) {
                id
                username
                createdAt
                updatedAt
            }
        }
    "#;

    // Execute the mutation and get a response
    let request: Request = Request::new(mutation);
    let response: Response = Schema::execute(&schema, request).await;

    // Print the errors to see what went wrong
    if !response.errors.is_empty() {
        println!("GraphQL errors: {:?}", response.errors);
    } else {
        println!("GraphQL data: {:?}", response.data);
    }

    // Check that the response does not contain errors
    assert!(response.errors.is_empty());

    // Extract the "createUser" data from the response
    let data = response.data.into_json().unwrap();
    let created_user = data["createUser"].clone();

    // Validate that the returned user matches what we expect
    assert_eq!(created_user["username"], "testuser");
    // Ensure an ID was returned
    assert!(created_user["id"].as_i64().is_some());

    // Tear down test_db
    let successfully_droppped: bool = test_db.close().await.expect("Failed to close test_db");
    assert!(successfully_droppped, "Close method returned false");
}

#[tokio::test]
async fn test_get_user_graphql() {
    // Set up test database and schema
    let mut test_db: TestDB = TestDB::new().await.expect("Failed to initialize test_db");
    let mut conn = test_db.pool.get().await.unwrap();

    let created_user: User = User::create(&mut conn, "testUser".to_string(), "testuid".to_string())
        .await
        .unwrap();

    // Only testing UserQuery, so no need for mutation or subscription
    let schema = create_schema(test_db.pool.clone());

    // Define Graphql query
    let query = format!(
        r#"
        query {{
            findUser(userId: {}) {{
                id
                username
                createdAt
                updatedAt
            }}
        }}
    "#,
        created_user.id
    );

    // Execute the query and store response
    let request: Request = Request::new(query);
    let response: Response = Schema::execute(&schema, request).await;

    // Print the errors to see what went wrong
    if !response.errors.is_empty() {
        println!("GraphQL errors: {:?}", response.errors);
    } else {
        println!("GraphQL data: {:?}", response.data);
    }

    // Check that the response does not contain errors
    assert!(response.errors.is_empty());

    // Extract the "findtUser" data from the response
    let data = response.data.into_json().unwrap();
    let user = data["findUser"].clone();

    // Validate that the returned user matches what we expect
    assert_eq!(user["username"], "testUser");
    assert_eq!(user["id"], created_user.id); // Ensure an ID was returned

    // Tear down test_db
    let successfully_droppped: bool = test_db.close().await.expect("Failed to close test_db");
    assert!(successfully_droppped, "Close method returned false");
}

#[tokio::test]
async fn test_all_users_graphql() {
    // Set up test database and schema
    let mut test_db: TestDB = TestDB::new().await.expect("Failed to initialize test_db");

    // Grab connection from pool, start a transaction from connection
    let mut conn = test_db.pool.get().await.unwrap();

    let _ = User::create(&mut conn, "user1".to_string(), "1234".to_string()).await;
    let _ = User::create(&mut conn, "user2".to_string(), "1235".to_string()).await;

    // Build the GraphQL schema with Query and Mutation types
    let schema = create_schema(test_db.pool.clone());

    // Define the GraphQL query string for allUsers
    let query = r#"
        query {
            fetchAllUsers {
                id
                username
                createdAt
                updatedAt
            }
        }
    "#;

    // Execute the query and get the response
    let request = Request::new(query);
    let response = Schema::execute(&schema, request).await;

    // Print errors to see what went wrong if anything
    if !response.errors.is_empty() {
        println!("GraphQL errors: {:?}", response.errors);
    } else {
        println!("GraphQL data: {:?}", response.data);
    }

    // Check that response has no errors
    assert!(response.errors.is_empty());

    // Extract the "allUsers" data from response
    let data = response.data.into_json().unwrap();
    let users_data = data["fetchAllUsers"].as_array().unwrap();

    // Validate returned users matches what we expect
    // Migrations create 6, tests add 2
    assert_eq!(users_data.len(), 8);

    // Check the first user
    let user1_data = &users_data[6];
    assert_eq!(user1_data["username"], "user1");
    assert!(user1_data["id"].as_i64().is_some());
    assert!(user1_data["createdAt"].as_str().is_some());
    assert!(user1_data["updatedAt"].as_str().is_some());

    // Check the second user
    let user2_data = &users_data[7];
    assert_eq!(user2_data["username"], "user2");
    assert!(user2_data["id"].as_i64().is_some());
    assert!(user2_data["createdAt"].as_str().is_some());
    assert!(user2_data["updatedAt"].as_str().is_some());

    // Tear down test_db
    let successfully_droppped: bool = test_db.close().await.expect("Failed to close test_db");
    assert!(successfully_droppped, "Close method returned false");
}

#[tokio::test]
async fn test_create_game_board_model() {
    // Set up test database and schema
    let mut test_db: TestDB = TestDB::new().await.expect("Failed to initialize test_db");

    let mut conn = test_db.pool.get().await.unwrap();
    println!("Created async connection object from pool");

    // Perform user creation inside the transaction
    let created_user: User = User::create(&mut conn, "testuser".to_string(), "123".to_string())
        .await
        .unwrap();
    println!(
        "Created user: {}, id: {}",
        created_user.username, created_user.id
    );

    // Assert that the created user matches expectations
    assert_eq!(created_user.username, "testuser");

    // Insert a test game board into the database
    let new_game_board: NewGameBoard = NewGameBoard {
        user_id: created_user.id,
        title: "testBoard".to_string(),
    };

    let created_game_board: GameBoard = GameBoard::create(&mut conn, new_game_board).await.unwrap();

    println!(
        "Created gameBoard: {}, id: {}, user_id: {}",
        created_game_board.title, created_game_board.id, created_game_board.user_id
    );

    // Assert that the created board game matches expectations
    assert_eq!(created_game_board.title, "testBoard");
    assert_eq!(created_game_board.user_id, created_user.id);

    let expected_categories = vec![
        Some("Category 1".to_string()),
        Some("Category 2".to_string()),
        Some("Category 3".to_string()),
        Some("Category 4".to_string()),
        Some("Category 5".to_string()),
    ];
    assert_eq!(created_game_board.categories, expected_categories);

    // Tear down test_db
    let successfully_droppped: bool = test_db.close().await.expect("Failed to close test_db");
    assert!(successfully_droppped, "Close method returned false");
}

#[tokio::test]
async fn test_get_game_board_graphql() {
    // Set up test database and schema
    let mut test_db: TestDB = TestDB::new().await.expect("Failed to initialize test_db");
    let mut conn = test_db.pool.get().await.unwrap();

    let new_user: User = User::create(&mut conn, "testUser".to_string(), "123".to_string())
        .await
        .unwrap();

    // Insert testGameBoard from testUser
    let game_board1 = NewGameBoard {
        user_id: new_user.id,
        title: "test_board".to_string(),
    };
    GameBoard::create(&mut conn, game_board1).await.unwrap();

    // Build graphql schema
    let schema = create_schema(test_db.pool.clone());

    // Define the GraphQL query
    let query = r#"
        query {
            findGameBoard(gameBoardId: 1) {
                id
                createdAt
                updatedAt
                userId
                title            
                categories
            }
        }
    "#;

    // Execute query and get response
    let request: Request = Request::new(query);
    let response: Response = Schema::execute(&schema, request).await;

    // Print the errors to see what went wrong
    if !response.errors.is_empty() {
        println!("GraphQL errors: {:?}", response.errors);
    } else {
        println!("GraphQL data: {:?}", response.data);
    }

    // Assess results
    // Check that the response does not contain errors
    assert!(response.errors.is_empty());

    let data = response.data.into_json().unwrap();
    let game_board = data["findGameBoard"].clone();

    // Validate game_board
    assert_eq!(game_board["id"], 1);
    assert_eq!(game_board["title"], "General Knowledge Board");
    assert_eq!(game_board["userId"], 1);

    // Tear down test_db
    let successfully_droppped: bool = test_db.close().await.expect("Failed to close test_db");
    assert!(successfully_droppped, "Close method returned false");
}

#[tokio::test]
async fn test_factory_functions() {
    // Set up test database and schema
    let mut test_db: TestDB = TestDB::new().await.expect("Failed to initialize test_db");
    let mut conn = test_db.pool.get().await.unwrap();

    // Create test user using factory
    let factory_user: User = create_test_user(&mut conn, None, None).await;
    assert_eq!(factory_user.username, "defaultuser");

    // Create test game board using factory
    let factory_game_board: GameBoard =
        create_test_game_board(&mut conn, factory_user.id, None).await;
    assert_eq!(factory_game_board.title, "defaultboard");

    // Create test question using factory
    let factory_question: Question = create_test_question(&mut conn, factory_user.id, None).await;
    assert_eq!(factory_question.question, "defaultquestion");
    assert_eq!(factory_question.answer, "defaultanswer");

    // Create test board question using factory
    let factory_mapping: GameBoardQuestionMapping = create_test_game_board_question_mapping(
        &mut conn,
        factory_game_board.id,
        factory_question.id,
        None,
    )
    .await;
    assert_eq!(factory_mapping.points, 100);
    assert!(!factory_mapping.daily_double);
    assert_eq!(factory_mapping.grid_row, 0);
    assert_eq!(factory_mapping.grid_col, 0);

    // Tear down test_db
    let successfully_droppped: bool = test_db.close().await.expect("Failed to close test_db");
    assert!(successfully_droppped, "Close method returned false");
}

#[tokio::test]
async fn test_mudkip_fixture() {
    // Set up test database and schema
    let mut test_db: TestDB = TestDB::new().await.expect("Failed to initialize test_db");
    let mut conn = test_db.pool.get().await.unwrap();

    // Initialize mudkip fixture with user and associated board/questions
    let (board, board_questions, questions) =
        board_with_questions_fixture(&mut conn, "Mudkip").await;
    assert_eq!(board.title, "Mudkip's Board 1");
    assert_eq!(board_questions.len(), 5);
    assert_eq!(questions.len(), 5);

    // Create graphql schema with all queries and mutations
    let schema = create_schema(test_db.pool.clone());

    // Create query for mudkip's questions
    let mudkip_question_query = format!(
        r#"
        query {{
            fetchQuestionsFromUser (userId: {}) {{
                id
                createdAt
                updatedAt
                userId
                question
                answer
        }}
    }}
    "#,
        board.user_id
    );

    // Execute query and get response
    let request: Request = Request::new(mudkip_question_query);
    let response: Response = Schema::execute(&schema, request).await;

    // Print the errors to see what went wrong
    if !response.errors.is_empty() {
        println!("GraphQL errors: {:?}", response.errors);
    } else {
        println!("GraphQL data: {:?}", response.data);
    }

    // Retrieve mudkip's 10 questions
    let data = response.data.into_json().unwrap();
    let mudkip_questions = data["fetchQuestionsFromUser"].as_array().unwrap();

    assert_eq!(mudkip_questions.len(), 5);
    for i in 0..5 {
        assert_eq!(
            mudkip_questions[i]["question"],
            format!("Question {}", i + 1)
        );
        assert_eq!(mudkip_questions[i]["answer"], format!("Answer {}", i + 1));
    }

    // Tear down test_db
    let successfully_droppped: bool = test_db.close().await.expect("Failed to close test_db");
    assert!(successfully_droppped, "Close method returned false");
}

#[tokio::test]
async fn test_get_question_from_ids() {
    // Set up test database and schema
    let mut test_db: TestDB = TestDB::new().await.expect("Failed to initialize test_db");
    let mut conn = test_db.pool.get().await.unwrap();

    // Initialize mudkip fixture with user and associated board/questions
    let (_board, board_questions, questions) =
        board_with_questions_fixture(&mut conn, "Mudkip").await;
    assert_eq!(board_questions.len(), 5);
    assert_eq!(questions.len(), 5);

    // Create graphql schema with all queries and mutations
    let schema = create_schema(test_db.pool.clone());

    // Create query for mudkip's questions
    let ids: Vec<i32> = questions.iter().map(|q| q.id as i32).collect();
    let ids_string = format!("{:?}", ids); // Convert vector to string "[1, 2, ..., 10]"

    let ten_question_query = format!(
        r#"
        query {{
            fetchQuestionsFromIds (questionIds: {}) {{
                id
                createdAt
                updatedAt
                userId
                question
                answer
        }}
    }}
    "#,
        ids_string
    );

    // Execute query and get response
    let request: Request = Request::new(ten_question_query);
    let response: Response = Schema::execute(&schema, request).await;

    // Print the errors to see what went wrong
    if !response.errors.is_empty() {
        println!("GraphQL errors: {:?}", response.errors);
    } else {
        println!("GraphQL data: {:?}", response.data);
    }

    // Check that the response does not contain errors
    assert!(response.errors.is_empty());

    // Retrieve mudkip's 5 questions
    let data = response.data.into_json().unwrap();
    let ten_questions = data["fetchQuestionsFromIds"].as_array().unwrap();

    for i in 0..5 {
        assert_eq!(ten_questions[i]["question"], format!("Question {}", i + 1));
    }

    // Tear down test_db
    let successfully_droppped: bool = test_db.close().await.expect("Failed to close test_db");
    assert!(successfully_droppped, "Close method returned false");
}

#[tokio::test]
async fn test_create_game_board_graphql() {
    // Set up test database and schema
    let mut test_db: TestDB = TestDB::new().await.expect("Failed to initialize test_db");

    // Insert test user using factory
    let mut conn = test_db.pool.get().await.unwrap();
    let user = create_test_user(&mut conn, Some("graphql_user".to_string()), None).await;
    assert_eq!(user.username, "graphql_user");

    // Build graphql schema with Query and Mutation types
    let schema = create_schema(test_db.pool.clone());

    // Define the GraphQL mutation string for creating a game board
    let mutation = format!(
        r#"
        mutation {{
            createGameBoard(input: {{ userId: {}, title: "GraphQL Test Board" }}) {{
                id
                title
                userId
                createdAt
                updatedAt
            }}
        }}
        "#,
        user.id
    );

    // Execute the mutation and get a response
    let request: Request = Request::new(mutation);
    let response: Response = Schema::execute(&schema, request).await;

    // Print the errors to see what went wrong
    if !response.errors.is_empty() {
        println!("GraphQL errors: {:?}", response.errors);
    } else {
        println!("GraphQL data: {:?}", response.data);
    }

    // Check that the response does not contain errors
    assert!(response.errors.is_empty());

    // Extract the "createGameBoard" data from the response
    let data = response.data.into_json().unwrap();
    let created_game_board = data["createGameBoard"].clone();

    // Validate that the returned game board matches what we expect
    assert_eq!(created_game_board["title"], "GraphQL Test Board");
    assert_eq!(created_game_board["userId"], user.id as i64);
    assert!(created_game_board["id"].as_i64().is_some());

    // Tear down test_db
    let successfully_droppped: bool = test_db.close().await.expect("Failed to close test_db");
    assert!(successfully_droppped, "Close method returned false");
}

#[tokio::test]
async fn test_get_board_question_mappings_graphql() {
    // Set up test database and schema
    let mut test_db: TestDB = TestDB::new().await.expect("Failed to initialize test_db");

    // Insert test user, game board, and multiple questions using fixtures
    let mut conn = test_db.pool.get().await.unwrap();
    let (board, board_mappings, questions): (
        GameBoard,
        Vec<GameBoardQuestionMapping>,
        Vec<Question>,
    ) = board_with_questions_fixture(&mut conn, "test_board_user").await;
    assert_eq!(board_mappings.len(), 5);
    assert_eq!(questions.len(), 5);

    // Build graphql schema with Query and Mutation types
    let schema = create_schema(test_db.pool.clone());

    // Define the GraphQL query to fetch board questions with details
    let query = format!(
        r#"
        query {{
            fetchGameBoardMappings(gameBoardId: {}) {{
                boardId
                questionId
                dailyDouble
                points
                gridRow
                gridCol
            }}
        }}
        "#,
        board.id
    );

    // Execute the query and get response
    let request: Request = Request::new(query);
    let response: Response = Schema::execute(&schema, request).await;

    // Print the errors to see what went wrong
    if !response.errors.is_empty() {
        println!("GraphQL errors: {:?}", response.errors);
    } else {
        println!("GraphQL data: {:?}", response.data);
    }

    // Check that the response does not contain errors
    assert!(response.errors.is_empty());

    // Retrieve board questions
    let data = response.data.into_json().unwrap();
    let fetched_mappings = data["fetchGameBoardMappings"].as_array().unwrap();

    // Validate that the number of board questions matches
    assert_eq!(fetched_mappings.len(), board_mappings.len());

    for (expected, actual) in board_mappings.iter().zip(fetched_mappings.iter()) {
        let expected: &GameBoardQuestionMapping = expected;
        // Validate board and question Ids
        assert_eq!(actual["boardId"], board.id, "Board ID mismatch");
        assert_eq!(
            actual["questionId"], expected.question_id,
            "Question ID mismatch"
        );

        // Validate daily_double
        assert_eq!(
            actual["dailyDouble"], expected.daily_double,
            "Daily Double mismatch"
        );

        // Validate points
        assert_eq!(actual["points"], expected.points, "Points mismatch");

        // Validate grid_row
        assert_eq!(actual["gridRow"], expected.grid_row, "Grid Row mismatch");

        // Validate grid_col
        assert_eq!(actual["gridCol"], expected.grid_col, "Grid Column mismatch");
    }

    // Tear down test_db
    let successfully_droppped: bool = test_db.close().await.expect("Failed to close test_db");
    assert!(successfully_droppped, "Close method returned false");
}
