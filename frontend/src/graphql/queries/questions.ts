import { gql } from "@apollo/client";

// QUESTION_FIELDS becomes a DocumentNode
export const QUESTION_FIELDS = gql`
  fragment QuestionFields on Question {
    id
    createdAt
    updatedAt
    userId
    question
    answer
  }
`;

export const ALL_QUESTIONS_QUERY = gql`
  query fetchAllQuestions {
    fetchAllQuestions {
      ...QuestionFields
      user {
        username
      }
    }
  }
`;

export const FETCH_QUESTIONS_FROM_IDS = gql`
  query fetchQuestionsFromIds($questionIds: [Int!]!) {
    fetchQuestionsFromIds(questionIds: $questionIds) {
      ...QuestionFields
    }
  }
`;

export const FIND_QUESTION = gql`
  query findQuestion($questionId: Int!) {
    findQuestion(questionId: $questionId) {
      ...QuestionFields
    }
  }
`;
