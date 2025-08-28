// @generated automatically by Diesel CLI.

diesel::table! {
    game_board_question_mappings (board_id, question_id) {
        board_id -> Int8,
        question_id -> Int8,
        daily_double -> Bool,
        points -> Int4,
        grid_row -> Int4,
        grid_col -> Int4,
    }
}

diesel::table! {
    game_boards (id) {
        id -> Int8,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
        user_id -> Int8,
        title -> Text,
        categories -> Array<Nullable<Text>>,
    }
}

diesel::table! {
    games (id) {
        id -> Int8,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
        user_id -> Int8,
        game_board_id -> Int8,
        room_code -> Text,
    }
}

diesel::table! {
    players (id) {
        id -> Int8,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
        game_id -> Int8,
        player_name -> Text,
        score -> Int4,
    }
}

diesel::table! {
    questions (id) {
        id -> Int8,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
        user_id -> Int8,
        question -> Text,
        answer -> Text,
    }
}

diesel::table! {
    users (id) {
        id -> Int8,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
        username -> Text,
        firebase_uid -> Text,
    }
}

diesel::joinable!(game_board_question_mappings -> game_boards (board_id));
diesel::joinable!(game_board_question_mappings -> questions (question_id));
diesel::joinable!(game_boards -> users (user_id));
diesel::joinable!(games -> game_boards (game_board_id));
diesel::joinable!(games -> users (user_id));
diesel::joinable!(players -> games (game_id));
diesel::joinable!(questions -> users (user_id));

diesel::allow_tables_to_appear_in_same_query!(
    game_board_question_mappings,
    game_boards,
    games,
    players,
    questions,
    users,
);
