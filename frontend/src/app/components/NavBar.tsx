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
import { useRouter } from "next/navigation";

const StyledLink = styled(Link)({
  textDecoration: "none",
  color: "inherit",
});

const NavBar = () => {
  const { backendUser, logout } = useAuth(); // Get the current user from your auth context
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/"); // Redirect to the home page (or "/sign-in")
    // Do logout flourish?
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <StyledLink href="/">Trivia Friends</StyledLink>
          </Typography>
          <Button color="inherit">
            <StyledLink href="/game-boards">GameBoards</StyledLink>
          </Button>
          <Button color="inherit">
            <StyledLink href="/questions">Questions</StyledLink>
          </Button>
          {backendUser ? (
            <>
              <Button color="inherit">
                <StyledLink href={`/users/${backendUser.id}`}>
                  My Page
                </StyledLink>
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button color="inherit">
              <StyledLink href="/sign-in">Sign In</StyledLink>
            </Button>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default NavBar;
