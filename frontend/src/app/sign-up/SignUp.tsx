"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import CircularProgress from "@mui/material/CircularProgress";
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
import type {} from "@mui/material/themeCssVarsAugmentation";
import { ApolloError } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/AuthProvider";
import {
  useCreateUserMutation,
  useFindUserByFirebaseUidLazyQuery,
} from "@/__generated__/graphql";
import {
  validateAll,
  validateField,
  isValid,
  FormData as SignUpFormData,
  Errors,
} from "./validation";

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
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const [generalError, setGeneralError] = React.useState("");
  const [createUser] = useCreateUserMutation();
  const [findUserByUid] = useFindUserByFirebaseUidLazyQuery();

  const [formData, setFormData] = React.useState<SignUpFormData>({
    username: "",
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = React.useState<Errors>({
    username: { error: false, message: "" },
    email: { error: false, message: "" },
    password: { error: false, message: "" },
  });

  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Real-time validation
    setFormErrors((p) => ({
      ...p,
      [name]: validateField(name as keyof SignUpFormData, value, {
        ...formData,
        [name]: value,
      }),
    }));
  };

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGeneralError("");

    const errs = validateAll(formData);
    setFormErrors(errs);
    if (!isValid(errs)) return;

    setIsLoading(true);

    try {
      // Create user in Firebase Authentication
      const userCredential = await signUp(formData.email, formData.password);
      const firebaseUser = userCredential.user;

      // Create a new user in backend with firebase UID
      const { data: newUserData, errors: newUserError } = await createUser({
        variables: {
          input: { username: formData.username, firebaseUid: firebaseUser.uid },
        },
      });
      if (newUserError) {
        throw new Error("Failed to create user in backend: " + newUserError);
      }

      // On success, redirect to the user's page
      if (newUserData?.createUser) {
        // console.log("Backend createUser response:", response);
        router.push("/users/" + newUserData.createUser.id);
      }
    } catch (error) {
      console.error("Error during Firebase sign up:", error);
      // Special handling for ApolloError
      if (error instanceof ApolloError) {
        // Extract the first GraphQL error message if available
        const errorMessage =
          error.graphQLErrors.length > 0
            ? error.graphQLErrors[0].message
            : "Server error occurred. Please try again.";

        setGeneralError(errorMessage);
      } else {
        setGeneralError(
          error instanceof Error
            ? error.message
            : "Failed to create account. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpWithGoogle = async () => {
    setGeneralError("");
    setIsGoogleLoading(true);

    // Sign up new user with google
    try {
      const result = await signInWithGoogle();
      if (!result.user) {
        throw new Error("No user returned from Google sign-up.");
      }

      // First check for existing user with firebase UID
      const { data: existingUserData, error: existingUserError } =
        await findUserByUid({
          variables: {
            firebaseUid: result.user.uid,
          },
        });
      if (existingUserError) {
        throw new Error(
          "Error checking for existing user: " + existingUserError.message
        );
      }

      // If firebase uid returns existing user in our db, redirect to their page
      if (existingUserData?.findUserByFirebaseUid) {
        const existingUser = existingUserData.findUserByFirebaseUid;
        console.log(
          `gUser already exists in db with UID ${result.user.uid}`,
          existingUser
        );
        router.push(`/users/${existingUser.id}`);
        return;
      }

      // If no existing user in our db for this firebase uid, create one
      const displayName = result.user.displayName ?? "Display Name";

      const { data: newUserData, errors: newUserError } = await createUser({
        variables: {
          input: { username: displayName, firebaseUid: result.user.uid },
        },
      });

      if (newUserError) {
        throw new Error("Failed to create user in backend: " + newUserError);
      }

      // On success, redirect to the user's page
      if (newUserData?.createUser) {
        router.push(`/users/${newUserData.createUser.id}`);
      }
    } catch (error) {
      console.error("Error during sign-up with Google:", error);

      // Special handling for ApolloError
      if (error instanceof ApolloError) {
        // Extract the first GraphQL error message if available
        const errorMessage =
          error.graphQLErrors.length > 0
            ? error.graphQLErrors[0].message
            : "Server error occurred. Please try again.";

        setGeneralError(errorMessage);
      } else {
        setGeneralError(
          error instanceof Error
            ? error.message
            : "Google sign up failed. Please try again or use email."
        );
      }
    } finally {
      setIsGoogleLoading(false);
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

          {generalError && (
            <Alert severity="error" sx={{ width: "100%" }}>
              {generalError}
            </Alert>
          )}

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
                value={formData.username}
                onChange={handleInputChange}
                error={formErrors.username.error}
                helperText={formErrors.username.message}
                color={formErrors.username.error ? "error" : "primary"}
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
                value={formData.email}
                onChange={handleInputChange}
                error={formErrors.email.error}
                helperText={formErrors.email.message}
                color={formErrors.email.error ? "error" : "primary"}
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
                value={formData.password}
                onChange={handleInputChange}
                error={formErrors.password.error}
                helperText={formErrors.password.message}
                color={formErrors.password.error ? "error" : "primary"}
              />
            </FormControl>
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
                    size={40}
                    sx={{
                      position: "absolute",
                      color: "primary.light",
                    }}
                  />
                  Creating account...
                </>
              ) : (
                "Sign up"
              )}
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
              startIcon={isGoogleLoading ? null : <GoogleIcon />}
              disabled={isGoogleLoading}
              sx={{ position: "relative" }}
            >
              {isGoogleLoading ? (
                <>
                  <CircularProgress
                    size={40}
                    sx={{
                      position: "absolute",
                      color: "primary.light",
                    }}
                  />
                  Connecting to Google...
                </>
              ) : (
                "Sign up with Google"
              )}
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
