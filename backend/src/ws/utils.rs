// ws/utils.rs

/// A helper function to acquire a lock on the games state,
/// gracefully handling poisoned mutexes.
pub fn get_games_lock<T>(mutex: &std::sync::Mutex<T>) -> std::sync::MutexGuard<T> {
    match mutex.lock() {
        Ok(guard) => guard,
        Err(poisoned) => {
            tracing::warn!("Mutex was poisoned, recovering");
            poisoned.into_inner()
        }
    }
}
