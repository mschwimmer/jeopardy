import { useState } from "react";
import { useAuth } from "../lib/AuthProvider";
import { useRouter } from "next/navigation";
import { findUserByFirebaseUid } from "../lib/serverQueries";
import { ApolloError } from "@apollo/client";
import { FirebaseError } from "firebase/app";

export function useSignIn() {
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    severity: "error" | "info" | "warning" | "success";
    message: string;
  } | null>(null);

  const handleSignIn = async (email: string, password: string) => {
    setFeedback(null);
    setIsLoading(true);

    try {
      const firebaseResult = await signIn(email, password);
      const backendUser = await findUserByFirebaseUid(firebaseResult.user.uid);
      router.push(`/users/${backendUser.id}`);
    } catch (error) {
      console.error("Error signing in:", error);

      let errorMessage = "Error signing in. Please try again.";

      if (error instanceof ApolloError) {
        errorMessage =
          error.graphQLErrors.length > 0
            ? error.graphQLErrors[0].message
            : "Server error occurred. Please try again.";
      } else if (error instanceof FirebaseError) {
        switch (error.message) {
          case "Firebase: Error (auth/user-not-found).":
            errorMessage = "No account found with this email";
            break;
          case "Firebase: Error (auth/wrong-password).":
            errorMessage = "Incorrect password";
            break;
          case "Firebase: Error (auth/invalid-email).":
            errorMessage = "Invalid email format.";
            break;
          case "Firebase: Error (auth/user-disabled).":
            errorMessage = "This account has been disabled.";
            break;
          case "Firebase: Error (auth/too-many-requests).":
            errorMessage = "Too many failed login attempts. Try again later.";
            break;
          case "Firebase: Error (auth/invalid-credential).":
            errorMessage = "Invalid email/password. Please try again.";
            break;
        }
      }
      setFeedback({ severity: "error", message: errorMessage });
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
      let errorMessage = "Error signing in. Please try again.";

      if (error instanceof ApolloError) {
        errorMessage =
          error.graphQLErrors.length > 0
            ? error.graphQLErrors[0].message
            : "Server error occurred. Please try again.";
      } else if (error instanceof FirebaseError) {
        switch (error.message) {
          case "Firebase: Error (auth/popup-closed-by-user).":
            errorMessage = "Google Authorization popup was closed.";
            break;
          case "Firebase: Error (auth/cancelled-popup-request).":
            errorMessage = "Google Authorization request was cancelled.";
            break;
          case "Firebase: Error (auth/popup-blocked).":
            errorMessage = "Google Authorization popup was blocked.";
            break;
          case "Firebase: Error (auth/operation-not-supported-in-this-environment).":
            errorMessage =
              "Google sign-in is not supported in this environment.";
            break;
          case "Firebase: Error (auth/network-request-failed).":
            errorMessage = "Network error occurred. Please try again.";
            break;
        }
      }
      setFeedback({
        severity: "error",
        message: errorMessage,
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return {
    handleSignIn,
    handleSignInWithGoogle,
    isLoading,
    isGoogleLoading,
    feedback,
    setFeedback,
  };
}
