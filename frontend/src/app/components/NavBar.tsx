// src/app/components/NavBar.tsx

"use client";

import React from "react";
import { AppBar } from "@mui/material";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Link from "next/link";
import { useAuth } from "../lib/AuthProvider"; // adjust the path as needed

const StyledLink = styled(Link)({
  textDecoration: "none",
  color: "inherit",
});

const NavBar = () => {
  const { backendUser } = useAuth(); // Get the current user from your auth context

  // If user exists, send them to their page; otherwise, to the sign-in page.
  const myPageHref = backendUser ? `/users/${backendUser.id}` : "/sign-in";
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <StyledLink href="/">The Trivia Game</StyledLink>
          </Typography>
          <Button color="inherit">
            <StyledLink href="/game-boards">GameBoards</StyledLink>
          </Button>
          <Button color="inherit">
            <StyledLink href="/questions">Questions</StyledLink>
          </Button>
          <Button color="inherit">
            <StyledLink href={myPageHref}>My Page</StyledLink>
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default NavBar;
