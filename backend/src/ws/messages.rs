// src/ws/messages.rs

use chrono::Utc;
use serde::{Deserialize, Serialize};

/// Creating a type for ws json messages
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub enum ServerMessageType {
    Buzz,
    Reset,
    Status,
}

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ServerData {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub buzz_time: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<String>,
    // Add optional fields as needed
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ServerMessage {
    #[serde(rename = "type")]
    pub message_type: ServerMessageType,
    pub data: ServerData,
    pub timestamp: u64,
}

/// Helper function to create a status message, possibly worth extracting to a utility module
pub fn make_status_message(user_id: &str, text: &str) -> ServerMessage {
    ServerMessage {
        message_type: ServerMessageType::Status,
        data: ServerData {
            user_id: Some(user_id.to_string()),
            status: Some(text.to_string()),
            ..Default::default()
        },
        timestamp: Utc::now().timestamp_millis() as u64,
    }
}
