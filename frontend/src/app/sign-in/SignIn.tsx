"use client";

import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CssBaseline from "@mui/material/CssBaseline";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import ForgotPassword from "./components/ForgotPassword";
import AppTheme from "../shared-theme/AppTheme";
import { GoogleIcon, DogIcon } from "./components/CustomIcons";
import type {} from "@mui/material/themeCssVarsAugmentation";

import { ApolloError } from "@apollo/client";
import { useAuth } from "../lib/AuthProvider";
import { useRouter } from "next/navigation";
import { findUserByFirebaseUid } from "../lib/serverQueries";

const Card = styled(MuiCard)(({ theme }) => ({
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "450px",
  },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
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

export default function SignIn(props: { disableCustomTheme?: boolean }) {
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{
    severity: "error" | "info" | "warning" | "success";
    message: string;
  } | null>(null);
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (emailError || passwordError) {
      return;
    }
    const data = new FormData(event.currentTarget);
    const email = data.get("email") as string;
    const password = data.get("password") as string;
    try {
      // Call the signIn function from the AuthProvider
      const firebaseResult = await signIn(email, password);
      // console.log("User signed in:", result.user);
      const backendUser = await findUserByFirebaseUid(firebaseResult.user.uid);
      // Optionally, redirect or update UI based on successful sign in
      router.push(`/users/${backendUser.id}`);
    } catch (error) {
      console.error("Error signing in:", error);
      setFeedback({
        severity: "error",
        message: "Error signing in. Please try again.",
      });
    }
  };

  const handleSignInWithGoogle = async () => {
    // Sign in existing user with google
    try {
      const firebaseResult = await signInWithGoogle();
      if (!firebaseResult.user) {
        console.error(
          "[SignInWithGoogle] Firebase gUser not returned:",
          firebaseResult
        );
        setFeedback({
          severity: "error",
          message:
            "No user information returned from Google. Please try again.",
        });
        return;
      }

      console.log(
        `[SignInWithGoogle] Checking for existing gUser in db with UID: ${firebaseResult.user.uid}`
      );
      const backendUser = await findUserByFirebaseUid(firebaseResult.user.uid);
      if (backendUser) {
        console.log(
          `[SignInWithGoogle] gUser exists in db with UID ${firebaseResult.user.uid}`,
          backendUser
        );
        router.push(`/users/${backendUser.id}`);
      } else {
        console.log(
          `[SignInWithGoogle] No existing gUser found in db. Redirecting to Sign-Up.`
        );
        router.push("/sign-up");
      }
    } catch (error) {
      console.error("Error during sign-in with Google:", error);
      // If the error is an ApolloError, log more detailed info:
      if (error instanceof ApolloError) {
        console.error(
          "[SignInWithGoogle] GraphQL errors:",
          error.graphQLErrors
        );
        console.error("[SignInWithGoogle] Network error:", error.networkError);
      }
      setFeedback({
        severity: "error",
        message: "Error signing in with Google. Please try again.",
      });
    }
  };

  const validateInputs = () => {
    const email = document.getElementById("email") as HTMLInputElement;
    const password = document.getElementById("password") as HTMLInputElement;

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

    return isValid;
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <DogIcon />
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
          >
            Sign in
          </Typography>
          {feedback && (
            <Alert
              severity={feedback.severity}
              onClose={() => setFeedback(null)}
            >
              {feedback.message}
            </Alert>
          )}
          <Box
            component="form"
            onSubmit={handleSignIn}
            noValidate
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                error={emailError}
                helperText={emailErrorMessage}
                id="email"
                type="email"
                name="email"
                placeholder="your@email.com"
                autoComplete="email"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={emailError ? "error" : "primary"}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="current-password"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={passwordError ? "error" : "primary"}
              />
            </FormControl>
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <ForgotPassword open={open} handleClose={handleClose} />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              onClick={validateInputs}
            >
              Sign in
            </Button>
            <Link
              component="button"
              type="button"
              onClick={handleClickOpen}
              variant="body2"
              sx={{ alignSelf: "center" }}
            >
              Forgot your password?
            </Link>
          </Box>
          <Divider>or</Divider>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleSignInWithGoogle}
              startIcon={<GoogleIcon />}
            >
              Sign in with Google
            </Button>
            <Typography sx={{ textAlign: "center" }}>
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                variant="body2"
                sx={{ alignSelf: "center" }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignInContainer>
    </AppTheme>
  );
}
