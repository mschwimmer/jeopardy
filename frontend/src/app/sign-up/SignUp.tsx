"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import AppTheme from "../shared-theme/AppTheme";
import { GoogleIcon, DogIcon } from "./components/CustomIcons";

import { ApolloError } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/AuthProvider";
import { createUser, findUserByFirebaseUid } from "../lib/serverQueries";

const Card = styled(MuiCard)(({ theme }) => ({
  // flexShrink: 0,
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  [theme.breakpoints.up("sm")]: {
    width: "450px",
  },
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage:
      "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
    backgroundRepeat: "no-repeat",
    ...theme.applyStyles("dark", {
      backgroundImage:
        "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  },
}));

export default function SignUp(props: { disableCustomTheme?: boolean }) {
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const [usernameError, setUsernameError] = React.useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = React.useState("");
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  const validateInputs = () => {
    const email = document.getElementById("email") as HTMLInputElement;
    const password = document.getElementById("password") as HTMLInputElement;
    const username = document.getElementById("username") as HTMLInputElement;

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must be at least 6 characters long.");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    if (!username.value || username.value.length < 1) {
      setUsernameError(true);
      setUsernameErrorMessage("Username is required.");
      isValid = false;
    } else {
      setUsernameError(false);
      setUsernameErrorMessage("");
    }

    return isValid;
  };

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (usernameError || emailError || passwordError) {
      return;
    }
    const data = new FormData(event.currentTarget);
    const email = data.get("email") as string;
    const password = data.get("password") as string;
    const username = data.get("username") as string;

    try {
      // console.log("Attempting to sign up with email:", email);
      const userCredential = await signUp(email, password);
      // console.log("Firebase sign up successful:", userCredential);
      const firebaseUser = userCredential.user;
      // const idToken = await firebaseUser.getIdToken();

      // Send the user data to the server
      const response = await createUser(username, firebaseUser.uid);
      // console.log("Backend createUser response:", response);
      router.push("/users/" + response.data?.createUser.id);
    } catch (error) {
      console.error("Error during Firebase sign up:", error);
    }
  };

  const handleSignUpWithGoogle = async () => {
    // Sign up new user with google
    try {
      const result = await signInWithGoogle();
      if (!result.user) {
        console.error("[SignUpWithGoogle] No Google user returned:", result);
        return;
      }
      console.log("User signed up with Google:", result.user);

      console.log(
        `[SignUpWithGoogle] Checking for existing user with UID: ${result.user.uid}`
      );

      // First check for existing user with firebase UID
      const existingUser = await findUserByFirebaseUid(result.user.uid);
      if (existingUser) {
        console.log(
          `User already exists with UID ${result.user.uid}`,
          existingUser
        );
        router.push("/users/" + existingUser.id);
      }

      console.log(
        `[SignUpWithGoogle] No existing user found. Creating new user for UID: ${result.user.uid}`
      );

      // If no existing user, create a new user
      const displayName = result.user.displayName ?? "Display Name";
      console.log("[SignUpWithGoogle] Using display name:", displayName);
      const userResult = await createUser(displayName, result.user.uid);
      if (userResult.data?.createUser.id) {
        console.log(
          "[SignUpWithGoogle] User successfully created with id:",
          userResult.data.createUser.id
        );
        router.push("/users/" + userResult.data.createUser.id);
      } else {
        console.error(
          "[SignUpWithGoogle] User creation did not return a valid id:",
          userResult
        );
      }
    } catch (error) {
      console.error(
        "[SignUpWithGoogle] Error during sign-up with Google:",
        error
      );
      // If the error is an ApolloError, log more detailed info:
      if (error instanceof ApolloError) {
        console.error(
          "[SignUpWithGoogle] GraphQL errors:",
          error.graphQLErrors
        );
        console.error("[SignUpWithGoogle] Network error:", error.networkError);
      }
    }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignUpContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <DogIcon />
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
          >
            Sign up
          </Typography>
          <Box
            component="form"
            method="post"
            onSubmit={handleSignUp}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <FormControl>
              <FormLabel htmlFor="username">Username</FormLabel>
              <TextField
                autoComplete="username"
                name="username"
                required
                fullWidth
                id="username"
                placeholder="Jon Snow"
                error={usernameError}
                helperText={usernameErrorMessage}
                color={usernameError ? "error" : "primary"}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                required
                fullWidth
                id="email"
                placeholder="your@email.com"
                name="email"
                autoComplete="email"
                variant="outlined"
                error={emailError}
                helperText={emailErrorMessage}
                color={passwordError ? "error" : "primary"}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                required
                fullWidth
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="new-password"
                variant="outlined"
                error={passwordError}
                helperText={passwordErrorMessage}
                color={passwordError ? "error" : "primary"}
              />
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              onClick={validateInputs}
            >
              Sign up
            </Button>
          </Box>
          <Divider>
            <Typography sx={{ color: "text.secondary" }}>or</Typography>
          </Divider>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleSignUpWithGoogle}
              startIcon={<GoogleIcon />}
            >
              Sign up with Google
            </Button>
            <Typography sx={{ textAlign: "center" }}>
              Already have an account?{" "}
              <Link
                href="/sign-in"
                variant="body2"
                sx={{ alignSelf: "center" }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignUpContainer>
    </AppTheme>
  );
}
