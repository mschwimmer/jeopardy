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

const StyledLink = styled(Link)({
  textDecoration: "none",
  color: "inherit",
});

const NavBar = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <StyledLink href="/">The Trivia Game</StyledLink>
          </Typography>
          <Button color="inherit">
            <StyledLink href="/admin">Admin</StyledLink>
          </Button>
          <Button color="inherit">
            <StyledLink href="/games">GameBoards</StyledLink>
          </Button>
          <Button color="inherit">
            <StyledLink href="/questions">Questions</StyledLink>
          </Button>
          <Button color="inherit">
            <StyledLink href="/users/1">My Page</StyledLink>
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default NavBar;
