// src/app/lib/apolloClient.ts

import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { fireBaseAuth } from "@/utils/firebase";

export const createApolloClient = async () => {
  const httpLink = createHttpLink({
    uri:
      process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
      "http://localhost:8080/graphql",
  });

  const authLink = setContext(async (_, { headers }) => {
    // get the authentication token from local storage if it exists
    const firebaseUser = fireBaseAuth.currentUser;
    const token = firebaseUser ? await firebaseUser.getIdToken() : null;
    // if (token) {
    //   console.log("Firebase Token:", token);
    // }

    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    };
  });

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
};
