"use client";

import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
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
import { ApolloError } from "@apollo/client";
import type {} from "@mui/material/themeCssVarsAugmentation";
import ForgotPassword from "./components/ForgotPassword";
import AppTheme from "../shared-theme/AppTheme";
import { GoogleIcon, DogIcon } from "./components/CustomIcons";

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
    width: "450px",
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
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
  });

  const [formErrors, setFormErrors] = React.useState({
    email: { error: false, message: "" },
    password: { error: false, message: "" },
  });

  const [isLoading, setIsLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{
    severity: "error" | "info" | "warning" | "success";
    message: string;
  } | null>(null);

  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    validateField(name, value);
  };

  const validateField = (name: string, value: string) => {
    const newErrors = { ...formErrors };

    switch (name) {
      case "email":
        if (!value) {
          newErrors.email = { error: true, message: "Email is required." };
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          newErrors.email = {
            error: true,
            message: "Please enter a valid email address.",
          };
        } else {
          newErrors.email = { error: false, message: "" };
        }
        break;
      case "password":
        if (!value) {
          newErrors.password = {
            error: true,
            message: "Password is required.",
          };
        } else if (value.length < 6) {
          newErrors.password = {
            error: true,
            message: "Password must be at least 6 characters long.",
          };
        } else {
          newErrors.password = { error: false, message: "" };
        }
        break;
    }

    setFormErrors(newErrors);
  };

  const validateAllFields = () => {
    validateField("email", formData.email);
    validateField("password", formData.password);

    return !(formErrors.email.error || formErrors.password.error);
  };

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!validateAllFields()) {
      return;
    }

    setIsLoading(true);

    try {
      const firebaseResult = await signIn(formData.email, formData.password);
      const backendUser = await findUserByFirebaseUid(firebaseResult.user.uid);
      router.push(`/users/${backendUser.id}`);
    } catch (error) {
      console.error("Error signing in:", error);

      if (error instanceof ApolloError) {
        const errorMessage =
          error.graphQLErrors.length > 0
            ? error.graphQLErrors[0].message
            : "Server error occurred. Please try again.";

        setFeedback({
          severity: "error",
          message: errorMessage,
        });
      } else {
        setFeedback({
          severity: "error",
          message:
            error instanceof Error
              ? error.message
              : "Error signing in. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInWithGoogle = async () => {
    setFeedback(null);
    setIsGoogleLoading(true);

    try {
      const firebaseResult = await signInWithGoogle();

      if (!firebaseResult.user) {
        throw new Error("No user information returned from Google");
      }

      const backendUser = await findUserByFirebaseUid(firebaseResult.user.uid);

      if (backendUser) {
        router.push(`/users/${backendUser.id}`);
      } else {
        router.push("/sign-up");
      }
    } catch (error) {
      console.error("Error during sign-in with Google:", error);

      if (error instanceof ApolloError) {
        const errorMessage =
          error.graphQLErrors.length > 0
            ? error.graphQLErrors[0].message
            : "Server error occurred. Please try again.";

        setFeedback({
          severity: "error",
          message: errorMessage,
        });
      } else {
        setFeedback({
          severity: "error",
          message:
            error instanceof Error
              ? error.message
              : "Error signing in with Google. Please try again.",
        });
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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
                error={formErrors.email.error}
                helperText={formErrors.email.message}
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                autoComplete="email"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={formErrors.email.error ? "error" : "primary"}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                error={formErrors.password.error}
                helperText={formErrors.password.message}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="current-password"
                required
                fullWidth
                variant="outlined"
                color={formErrors.password.error ? "error" : "primary"}
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
              disabled={isLoading}
              sx={{ position: "relative" }}
            >
              {isLoading ? (
                <>
                  <CircularProgress
                    size={24}
                    sx={{
                      position: "absolute",
                      color: "primary.light",
                    }}
                  />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
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
              disabled={isGoogleLoading}
              startIcon={isGoogleLoading ? null : <GoogleIcon />}
              sx={{ position: "relative" }}
            >
              {isGoogleLoading ? (
                <>
                  <CircularProgress
                    size={24}
                    sx={{
                      position: "absolute",
                      color: "primary.light",
                    }}
                  />
                  Signing in with Google...
                </>
              ) : (
                "Sign in with Google"
              )}
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
