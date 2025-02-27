// graphql/query/question.rs

use crate::db::pool::DBPool;
use crate::models::question::Question;
use async_graphql::{Context, Object, Result};

#[derive(Default)]
pub struct QuestionQuery;

#[Object]
impl QuestionQuery {
    /// Find a single question by id
    async fn find_question(&self, ctx: &Context<'_>, question_id: i64) -> Result<Question> {
        let pool = ctx.data::<DBPool>().map_err(|e| {
            async_graphql::Error::new(format!("Cannot get DBPool from context: {:?}", e))
        })?;
        let mut conn = pool
            .get()
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to get connection: {}", e)))?;

        // // Optional authentication
        // if let Some(user) = get_user_from_context(ctx) {
        //     println!("Authenticated user: {}", user.uid());
        //     // Do something with the user...
        // } else {
        //     println!("Anonymous access");
        //     // Handle anonymous access...
        // }

        let question: Question = Question::find_by_id(&mut conn, question_id).await?;
        Ok(question)
    }

    /// Fetch all questions from a user
    async fn fetch_questions_from_user(
        &self,
        ctx: &Context<'_>,
        user_id: i64,
    ) -> Result<Vec<Question>> {
        let pool = ctx.data::<DBPool>().map_err(|e| {
            async_graphql::Error::new(format!("Cannot get DBPool from context: {:?}", e))
        })?;
        let mut conn = pool
            .get()
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to get connection: {}", e)))?;
        let questions: Vec<Question> = Question::fetch_by_user(&mut conn, user_id).await?;
        Ok(questions)
    }

    /// Fetch all questions in database
    async fn fetch_all_questions(&self, ctx: &Context<'_>) -> Result<Vec<Question>> {
        let pool = ctx.data::<DBPool>().map_err(|e| {
            async_graphql::Error::new(format!("Cannot get DBPool from context: {:?}", e))
        })?;
        let mut conn = pool
            .get()
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to get connection: {}", e)))?;
        let questions: Vec<Question> = Question::all(&mut conn).await?;
        Ok(questions)
    }

    /// Fetch questions from list of ids
    async fn fetch_questions_from_ids(
        &self,
        ctx: &Context<'_>,
        question_ids: Vec<i64>,
    ) -> Result<Vec<Question>> {
        let pool = ctx.data::<DBPool>().map_err(|e| {
            async_graphql::Error::new(format!("Cannot get DBPool from context: {:?}", e))
        })?;
        let mut conn = pool
            .get()
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to get connection: {}", e)))?;
        let questions: Vec<Question> = Question::fetch_by_ids(&mut conn, question_ids).await?;
        Ok(questions)
    }
}
