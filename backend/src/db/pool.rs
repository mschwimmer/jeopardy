// backend/src/db/pool.rs

use diesel_async::pooled_connection::deadpool::BuildError;
use diesel_async::pooled_connection::{deadpool::Pool, AsyncDieselConnectionManager};
use diesel_async::AsyncPgConnection;
use dotenvy::dotenv;
use std::env;

pub type DBPool = Pool<AsyncPgConnection>;

pub fn create_pool(database_url: &String) -> Result<DBPool, BuildError> {
    let manager = AsyncDieselConnectionManager::<AsyncPgConnection>::new(database_url);
    Pool::builder(manager).build()
}

pub fn create_app_pool() -> Result<DBPool, Box<dyn std::error::Error>> {
    dotenv().ok();

    let database_url: String = env::var("DATABASE_URL").map_err(|err| {
        tracing::error!("DATABASE_URL must be set: {}", err);
        err
    })?;

    // Build the pool, propagating any errors.
    let pool = create_pool(&database_url).map_err(|err| {
        tracing::error!("Failed to create DB pool: {}", err);
        Box::new(err) as Box<dyn std::error::Error>
    })?;
    Ok(pool)
}
