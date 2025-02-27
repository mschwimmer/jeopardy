// models/user.rs

use crate::db::schema::users;
use async_graphql::SimpleObject;
use chrono::{DateTime, Utc};
use derive_builder::Builder;
use diesel::prelude::*;
use diesel_async::{AsyncPgConnection, RunQueryDsl};

/// Represents a user in the application.
///
/// This struct supports Diesel for database interactions
/// and integrates with async-graphql for GraphQL APIs.
/// # Example
///
/// ```rust, ignore
/// use crate::models::User;
/// use chrono::Utc;
///
/// let user = User {
///     id: 1,
///     created_at: Utc::now(),
///     updated_at: Utc::now(),
///     username: String::from("johndoe"),
///     firebase_uid: String::from("123456"),
/// };
///
/// println!("{:?}", user);
/// ```
#[derive(Queryable, SimpleObject, Selectable, Debug, Builder, Clone)]
#[diesel(table_name = users)]
pub struct User {
    /// The unique identifier for the user.
    pub id: i64,
    /// The timestamp when the user was created.
    pub created_at: DateTime<Utc>,
    /// The timestamp when the user was last updated.
    pub updated_at: DateTime<Utc>,
    /// The username of the user.
    pub username: String,
    /// The Firebase UID of the user.
    pub firebase_uid: String,
}

/// Represents a new user to be inserted into the database.
#[derive(Debug, Insertable, Builder)]
#[diesel(table_name = users)]
pub struct NewUser {
    pub username: String,
    pub firebase_uid: String,
}

impl User {
    /// Find a user by their unique ID.
    ///
    /// # Arguments
    /// * `conn` - A mutable reference to an async PostgreSQL connection.
    /// * `user_id` - The unique identifier of the user to fetch.
    ///
    /// # Returns
    /// A `Result` containing the user or a Diesel error.
    pub async fn find_by_id(
        conn: &mut AsyncPgConnection,
        user_id: i64,
    ) -> Result<Option<Self>, diesel::result::Error> {
        users::table.find(user_id).first(conn).await.optional()
    }

    /// Find a user by their Firebase UID.
    ///
    /// # Arguments
    /// * `conn` - A mutable reference to an async PostgreSQL connection.
    /// * `firebase_uid` - The Firebase UID of the user to fetch.
    ///
    /// # Returns
    /// A `Result` containing the user or a Diesel error.
    pub async fn find_by_firebase_uid(
        conn: &mut AsyncPgConnection,
        firebase_uid: String,
    ) -> Result<Option<Self>, diesel::result::Error> {
        users::table
            .filter(users::firebase_uid.eq(firebase_uid))
            .first::<User>(conn)
            .await
            .optional()
    }

    /// Fetch all users from the database.
    ///
    /// # Arguments
    /// * `conn` - A mutable reference to an async PostgreSQL connection.
    ///
    /// # Returns
    /// A `Result` containing a vector of users or a Diesel error.
    pub async fn all(conn: &mut AsyncPgConnection) -> Result<Vec<Self>, diesel::result::Error> {
        users::table.load::<Self>(conn).await
    }

    /// Fetch users by their username.
    ///
    /// # Arguments
    /// * `conn` - A mutable reference to an async PostgreSQL connection.
    /// * `username` - The username to filter by.
    ///
    /// # Returns
    /// A `Result` containing a vector of users matching the username or a Diesel error.
    pub async fn fetch_by_username(
        conn: &mut AsyncPgConnection,
        username: String,
    ) -> Result<Vec<Self>, diesel::result::Error> {
        users::table
            .filter(users::username.eq(username))
            .load::<Self>(conn)
            .await
    }

    /// Create a new user in the database.
    ///
    /// # Arguments
    /// * `conn` - A mutable reference to an async PostgreSQL connection.
    /// * `new_user` - A `NewUser` instance containing the user's data.
    ///
    /// # Returns
    /// A `Result` containing the newly created user or a Diesel error.
    pub async fn create(
        conn: &mut AsyncPgConnection,
        username: String,
        firebase_uid: String,
    ) -> Result<Self, Box<dyn std::error::Error>> {
        // Using the builder (from derive_builder) to construct a NewUser instance
        let new_user = NewUserBuilder::default()
            .username(username)
            .firebase_uid(firebase_uid)
            .build()
            .map_err(|err| {
                tracing::error!("Failed to build NewUser: {:?}", err);
                Box::new(err) as Box<dyn std::error::Error>
            })?;

        let user = diesel::insert_into(users::table)
            .values(&new_user)
            .get_result(conn)
            .await?;

        Ok(user)
    }
}
