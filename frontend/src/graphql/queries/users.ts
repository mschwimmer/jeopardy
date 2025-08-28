import { gql } from "@apollo/client";

export const USER_DETAILS = gql`
  fragment UserDetails on User {
    id
    firebaseUid
    username
    createdAt
    updatedAt
  }
`;

export const ALL_USERS_QUERY = gql`
  query fetchAllUsers {
    fetchAllUsers {
      ...UserDetails
    }
  }
`;

export const FIND_USER_QUERY = gql`
  query findUser($userId: Int!) {
    findUser(userId: $userId) {
      ...UserDetails
    }
  }
`;

export const FIND_USER_BY_FIREBASE_UID_QUERY = gql`
  query findUserByFirebaseUid($firebaseUid: String!) {
    findUserByFirebaseUid(firebaseUid: $firebaseUid) {
      ...UserDetails
    }
  }
`;
