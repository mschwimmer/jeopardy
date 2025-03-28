mod error;
mod handler;
mod socket;
mod state;

pub use handler::ws_handler;
pub use socket::handle_socket;
pub use state::GameState;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

pub type Games = Arc<Mutex<HashMap<String, GameState>>>;
