// src/app/lib/apolloClient.ts

import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { fireBaseAuth } from "@/utils/firebase";

const httpLink = createHttpLink({
  uri:
    process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:8080/graphql",
});

const authLink = setContext(async (_, { headers }) => {
  try {
    const user = fireBaseAuth.currentUser;
    const token = user ? await user.getIdToken() : null;

    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    };
  } catch (error) {
    console.error("Error fetching auth token:", error);
    return { headers };
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
