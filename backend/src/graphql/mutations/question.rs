// graphql/mutatons/question.rs

use crate::auth::firebase_auth::require_auth;
use crate::db::pool::DBPool;
use crate::models::question::{NewQuestion, Question, UpdateQuestion};
use crate::models::user::User;
use async_graphql::{Context, InputObject, Object, Result};

#[derive(InputObject)]
pub struct CreateQuestionInput {
    pub user_id: i64,
    pub question: String,
    pub answer: String,
}

#[derive(InputObject)]
pub struct UpdateQuestionInput {
    pub id: i64,
    pub question: Option<String>,
    pub answer: Option<String>,
}

#[derive(Default)]
pub struct QuestionMutation;

#[Object]
impl QuestionMutation {
    /// Create a new quesiton
    async fn create_question(
        &self,
        ctx: &Context<'_>,
        input: CreateQuestionInput,
    ) -> Result<Question> {
        let pool = ctx.data::<DBPool>().map_err(|e| {
            async_graphql::Error::new(format!("Cannot get DBPool from context: {:?}", e))
        })?;
        let mut conn = pool
            .get()
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to get connection: {}", e)))?;

        let new_question: NewQuestion = NewQuestion {
            user_id: input.user_id,
            question: input.question,
            answer: input.answer,
        };
        let question: Question = Question::create(&mut conn, new_question).await?;
        Ok(question)
    }

    /// Update a question
    async fn update_question(
        &self,
        ctx: &Context<'_>,
        input: UpdateQuestionInput,
    ) -> Result<Question> {
        let pool = ctx.data::<DBPool>().map_err(|e| {
            async_graphql::Error::new(format!("Cannot get DBPool from context: {:?}", e))
        })?;
        let mut conn = pool
            .get()
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to get connection: {}", e)))?;

        // Require authentication
        let auth_user = require_auth(ctx)?;

        // Use user info
        println!("Request from firebase user: {}", auth_user.uid());

        // Fetch backend User info
        let requestor = User::find_by_firebase_uid(&mut conn, auth_user.uid().to_string())
            .await
            .map_err(|e| async_graphql::Error::new(format!("Database error: {:?}", e)))?
            .ok_or_else(|| async_graphql::Error::new("Backend user not found"))?;

        // Fetch the existing question
        let existing_question = Question::find_by_id(&mut conn, input.id)
            .await
            .map_err(|e| async_graphql::Error::new(format!("Database error: {:?}", e)))?;

        // requestor must be author of question
        if requestor.id != existing_question.user_id {
            return Err(async_graphql::Error::new(
                "Requestor did not match question author",
            ));
        }

        // Input Validation
        if let Some(ref q) = input.question {
            if q.trim().is_empty() {
                return Err(async_graphql::Error::new("Question cannot be empty"));
            }
        }

        if let Some(ref a) = input.answer {
            if a.trim().is_empty() {
                return Err(async_graphql::Error::new("Answer cannot be empty"));
            }
        }

        // Prepare the updated fields using UpdateQuestion struct
        let updated_fields = UpdateQuestion {
            question: input.question.clone(),
            answer: input.answer.clone(),
        };

        // Perform the update
        let updated = Question::update_question(&mut conn, input.id, updated_fields).await?;

        Ok(updated)
    }

    /// Delete a question by ID
    async fn delete_question(&self, ctx: &Context<'_>, question_id: i64) -> Result<bool> {
        let pool = ctx.data::<DBPool>().map_err(|e| {
            async_graphql::Error::new(format!("Cannot get DBPool from context: {:?}", e))
        })?;
        let mut conn = pool
            .get()
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to get connection: {}", e)))?;

        let rows_deleted = Question::delete_by_id(&mut conn, question_id).await?;
        Ok(rows_deleted > 0) // Return true if a row was deleted
    }
}
