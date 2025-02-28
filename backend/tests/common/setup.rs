// tests/common/setup.rs

use backend::db::pool::create_pool;
use backend::db::pool::DBPool;
use diesel::pg::PgConnection;
use diesel::prelude::*;
use diesel::sql_types::Integer;
use diesel::QueryableByName;
use diesel_async::{AsyncConnection, AsyncPgConnection, RunQueryDsl};
use diesel_migrations::{FileBasedMigrations, MigrationHarness};
use dotenvy::dotenv;
use regex::Regex;
use std::env;
#[cfg(test)]
use uuid::Uuid;

pub fn run_migrations_sync(database_url: &str) {
    println!("Running test setup migrations!");
    let mut conn: PgConnection =
        PgConnection::establish(database_url).expect("Could not connect to db");
    // Create FileBasedMigrations dynamically
    let migrations = FileBasedMigrations::from_path("../backend/db/migrations")
        .expect("Could not load migrations from path");

    // Run migrations and log the applied ones
    match conn.run_pending_migrations(migrations) {
        Ok(applied_migrations) => {
            println!("Successfully applied migrations:");
            for migration in applied_migrations {
                println!(" - {}", migration);
            }
        }
        Err(err) => {
            eprintln!("Failed to apply migrations: {:?}", err);
            panic!("Migration failed");
        }
    }
}

pub async fn establish_super_connection() -> Result<AsyncPgConnection, ConnectionError> {
    dotenv().ok();
    let database_url = env::var("TEST_DATABASE_URL").expect("DATABASE_URL must be set");
    AsyncPgConnection::establish(&database_url).await
}

pub async fn create_test_database(
    super_conn: &mut AsyncPgConnection,
) -> Result<String, diesel::result::Error> {
    let test_db = format!("test_db_{}", Uuid::new_v4());
    let query = format!("CREATE DATABASE \"{}\";", test_db);
    println!("{}", query);
    diesel::sql_query(query)
        .execute(super_conn)
        .await
        .expect("Failed to create test database");
    Ok(test_db)
}

pub fn get_test_database_url(test_db: &str) -> String {
    let url = env::var("TEST_DATABASE_URL").expect("DATABASE_URL must be set");
    // Replace the default database with the test database
    // Use regex as a way of learning regex with Rust
    let re = Regex::new(r"/[^/]+$").unwrap();
    re.replace(&url, format!("/{}", test_db)).to_string()
}

#[allow(dead_code)]
pub async fn drop_test_database(
    super_conn: &mut AsyncPgConnection,
    test_db: &str,
) -> Result<bool, diesel::result::Error> {
    // Terminate all connections to database
    diesel::sql_query(format!(
        "SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = '{}'
            AND pid <> pg_backend_pid();",
        test_db
    ))
    .execute(super_conn)
    .await
    .expect("Failed to terminate connections");

    diesel::sql_query(format!("DROP DATABASE IF EXISTS \"{}\"", test_db))
        .execute(super_conn)
        .await
        .expect("Failed to drop test database");

    #[derive(QueryableByName)]
    struct One {
        #[diesel(sql_type = Integer)]
        one: i32,
    }

    // Check if the database still exists by counting rows in pg_database
    let rows: Vec<One> = diesel::sql_query(format!(
        "SELECT 1 FROM pg_database WHERE datname = '{}';",
        test_db
    ))
    .load(super_conn) // Load rows as a tuple of integers
    .await
    .expect("Failed to validate the dropped testdb");
    // assert!(false, "Forcing failure");

    Ok(rows.is_empty())
}

/// A struct that represents a test database and ensures it is dropped when the struct goes out of scope.
pub struct TestDB {
    pub pool: DBPool,
    pub test_db_name: String,
    pub super_conn: AsyncPgConnection,
}

impl TestDB {
    pub async fn new() -> Result<Self, diesel::ConnectionError> {
        // Load environment variables
        dotenv().ok();
        let mut super_conn = establish_super_connection()
            .await
            .expect("Super Conn failed");
        let test_db = create_test_database(&mut super_conn)
            .await
            .expect("Test DB failed");
        let test_db_url = get_test_database_url(&test_db);
        run_migrations_sync(&test_db_url);
        let pool: DBPool = create_pool(&test_db_url).expect("Failed to create pool");

        Ok(TestDB {
            pool,
            test_db_name: test_db,
            super_conn,
        })
    }

    pub async fn close(&mut self) -> Result<bool, diesel::result::Error> {
        println!("Closing resources for {}", self.test_db_name);
        drop_test_database(&mut self.super_conn, &self.test_db_name).await
    }
}
