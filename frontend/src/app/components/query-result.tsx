import React, { PropsWithChildren } from "react";
import { CircularProgress } from "@mui/material";
import { ApolloError } from "@apollo/client";

interface QueryResultProps {
  loading: boolean;
  error?: ApolloError | undefined;
  data?: unknown;
}

const QueryResult: React.FC<PropsWithChildren<QueryResultProps>> = ({
  loading,
  error,
  data,
  children,
}) => {
  if (error) {
    return <p>Error fetching data: {error.message}</p>;
  }
  if (loading) {
    return <CircularProgress />;
  }
  if (!data) {
    return <p>No data found.</p>;
  }
  if (data) {
    return <>{children}</>;
  }

  return <p> Nothing to show</p>;
};

export default QueryResult;
