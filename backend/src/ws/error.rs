// src/ws/error.rs
use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};
use serde_json::json;
use thiserror::Error;

// Custom error enum for WebSocket handler
#[derive(Debug, Error)]
pub enum ApiError {
    #[error("Failed to add player to game")]
    AddPlayerError,

    #[error("Database connection error")]
    DatabaseConnectionError,

    #[error("Failed to create game state")]
    GameStateCreationError,

    #[error("Invalid room code")]
    InvalidRoomCode,

    #[error("Invalid player ID")]
    InvalidPlayerId,

    #[error("Mutex lock error")]
    MutexLockError,

    #[error("Failed to find player")]
    PlayerNotFoundError,
}

// Implement IntoResponse for ApiError
impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            ApiError::AddPlayerError => {
                tracing::error!("Unable to add player to game");
                (StatusCode::INTERNAL_SERVER_ERROR, "Unable to add player")
            }
            ApiError::DatabaseConnectionError => {
                tracing::error!("Unable to connect to the database");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Unable to connect to the database",
                )
            }
            ApiError::GameStateCreationError => {
                tracing::error!("Failed to initialize game state");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Failed to initialize game state",
                )
            }
            ApiError::InvalidRoomCode => {
                tracing::error!("Invalid room code provided");
                (StatusCode::BAD_REQUEST, "Invalid room code provided")
            }
            ApiError::InvalidPlayerId => {
                tracing::error!("Invalid playerId provided");
                (StatusCode::BAD_REQUEST, "Invalid playerId provided")
            }
            ApiError::MutexLockError => {
                tracing::error!("Mutex lock error, internal sync error :(");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Internal synchronization error",
                )
            }
            ApiError::PlayerNotFoundError => {
                tracing::error!("Player not found");
                (StatusCode::INTERNAL_SERVER_ERROR, "Player not found")
            }
        };

        // Create a JSON error response
        (
            status,
            axum::Json(json!({
                "error": error_message
            })),
        )
            .into_response()
    }
}
