import { gql } from "@apollo/client";

export const GBQ_QUERY = gql`
  query FindGBQ($gameBoardId: Int!, $questionId: Int!) {
    findGameBoardQuestion(gameBoardId: $gameBoardId, questionId: $questionId) {
      mapping {
        dailyDouble
        points
        gridRow
        gridCol
      }
      question {
        question
        answer
      }
    }
  }
`;

export const ALL_GBQ_QUERY = gql`
  query FetchGBQs($gameBoardId: Int!) {
    fetchGameBoardQuestions(gameBoardId: $gameBoardId) {
      mapping {
        boardId
        questionId
        dailyDouble
        points
        gridRow
        gridCol
      }
      question {
        id
        createdAt
        updatedAt
        userId
        user {
          id
          createdAt
          updatedAt
          firebaseUid
          username
        }
        question
        answer
      }
    }
  }
`;
