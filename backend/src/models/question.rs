// models/question.rs

use crate::db::schema::questions;
use crate::models::user::User;
use async_graphql::{ComplexObject, SimpleObject};
use chrono::{DateTime, Utc};
use derive_builder::Builder;
use diesel::prelude::*;
use diesel_async::{AsyncPgConnection, RunQueryDsl};

/// Represents a question in the application.
///
/// This struct supports Diesel for database interactions
/// and integrates with async-graphql for GraphQL APIs. It is
/// associated with the `User` struct.
#[derive(
    Identifiable, Associations, Queryable, SimpleObject, Selectable, Debug, Builder, Clone,
)]
#[diesel(table_name = questions)]
#[diesel(belongs_to(User))]
#[graphql(complex)]
pub struct Question {
    /// The unique identifier for the question.
    pub id: i64,
    /// The timestamp when the question was created.
    pub created_at: DateTime<Utc>,
    /// The timestamp when the question was last updated.
    pub updated_at: DateTime<Utc>,
    /// The unique identifier of the user who created the question.
    pub user_id: i64,
    /// The text of the question.
    pub question: String,
    /// The answer to the question.
    pub answer: String,
}

/// Represents a new question to be inserted into the database.
#[derive(Debug, Insertable, Builder)]
#[diesel(table_name = questions)]
pub struct NewQuestion {
    pub user_id: i64,
    pub question: String,
    pub answer: String,
}

/// Represents the fields to update in an existing question.
#[derive(Debug, AsChangeset)]
#[diesel(table_name = questions)]
pub struct UpdateQuestion {
    pub question: Option<String>,
    pub answer: Option<String>,
}

impl Question {
    /// Find a question by its unique ID.
    ///
    /// # Arguments
    /// * `conn` - A mutable reference to an async PostgreSQL connection.
    /// * `question_id` - The unique identifier of the question to fetch.
    ///
    /// # Returns
    /// A `Result` containing the question or a Diesel error.
    pub async fn find_by_id(
        conn: &mut AsyncPgConnection,
        question_id: i64,
    ) -> Result<Self, diesel::result::Error> {
        questions::table.find(question_id).first(conn).await
    }

    /// Fetch multiple questions by their IDs.
    ///
    /// # Arguments
    /// * `conn` - A mutable reference to an async PostgreSQL connection.
    /// * `ids` - A vector of unique question IDs.
    ///
    /// # Returns
    /// A `Result` containing a vector of questions or a Diesel error.
    pub async fn fetch_by_ids(
        conn: &mut AsyncPgConnection,
        ids: Vec<i64>,
    ) -> Result<Vec<Self>, diesel::result::Error> {
        questions::table
            .filter(questions::id.eq_any(ids))
            .load::<Self>(conn)
            .await
    }

    /// Fetch all questions from the database.
    ///
    /// # Arguments
    /// * `conn` - A mutable reference to an async PostgreSQL connection.
    ///
    /// # Returns
    /// A `Result` containing a vector of questions or a Diesel error.
    pub async fn all(conn: &mut AsyncPgConnection) -> Result<Vec<Self>, diesel::result::Error> {
        questions::table.load::<Self>(conn).await
    }

    /// Fetch all questions created by a specific user.
    ///
    /// # Arguments
    /// * `conn` - A mutable reference to an async PostgreSQL connection.
    /// * `user_id` - The unique identifier of the user.
    ///
    /// # Returns
    /// A `Result` containing a vector of questions or a Diesel error.
    pub async fn fetch_by_user(
        conn: &mut AsyncPgConnection,
        user_id: i64,
    ) -> Result<Vec<Self>, diesel::result::Error> {
        questions::table
            .filter(questions::user_id.eq(user_id))
            .load::<Self>(conn)
            .await
    }

    /// Create a new question in the database.
    ///
    /// # Arguments
    /// * `conn` - A mutable reference to an async PostgreSQL connection.
    /// * `new_question` - A `NewQuestion` instance containing the question's data.
    ///
    /// # Returns
    /// A `Result` containing the newly created question or a Diesel error.
    pub async fn create(
        conn: &mut AsyncPgConnection,
        new_question: NewQuestion,
    ) -> Result<Self, diesel::result::Error> {
        diesel::insert_into(questions::table)
            .values(&new_question)
            .get_result(conn)
            .await
    }

    /// Update an existing question.
    ///
    /// # Arguments
    /// * `conn` - A mutable reference to an async PostgreSQL connection.
    /// * `question_id` - The unique identifier of the question to update.
    /// * `updated_fields` - An `UpdateQuestion` instance containing the updated fields.
    ///
    /// # Returns
    /// A `Result` containing the updated question or a Diesel error.
    pub async fn update_question(
        conn: &mut AsyncPgConnection,
        question_id: i64,
        updated_fields: UpdateQuestion,
    ) -> Result<Self, diesel::result::Error> {
        diesel::update(questions::table.find(question_id))
            .set(&updated_fields)
            .get_result(conn)
            .await
    }

    /// Delete a question by its unique ID.
    ///
    /// # Arguments
    /// * `conn` - A mutable reference to an async PostgreSQL connection.
    /// * `question_id` - The unique identifier of the question to delete.
    ///
    /// # Returns
    /// A `Result` containing the number of rows affected or a Diesel error.
    pub async fn delete_by_id(
        conn: &mut AsyncPgConnection,
        question_id: i64,
    ) -> Result<usize, diesel::result::Error> {
        diesel::delete(questions::table.filter(questions::id.eq(question_id)))
            .execute(conn)
            .await
    }
}

#[ComplexObject]
impl Question {
    pub async fn user(&self, ctx: &async_graphql::Context<'_>) -> Result<User, async_graphql::Error> {
        let pool = ctx.data::<crate::db::pool::DBPool>().map_err(|e| {
            async_graphql::Error::new(format!("Cannot get DBPool from context: {:?}", e))
        })?;
        let mut conn = pool
            .get()
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to get connection: {}", e)))?;
        let user = User::find_by_id(&mut conn, self.user_id)
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to load user: {}", e)))?;

        user.ok_or_else(|| {
            async_graphql::Error::new("Data integrity error: Question has invalid user_id")
        })
    }
}
