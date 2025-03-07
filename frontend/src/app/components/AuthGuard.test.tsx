// AuthGuard.test.tsx
import { render, screen } from "@testing-library/react";
import AuthGuard from "./AuthGuard";
import { useAuth } from "../lib/AuthProvider";
import "@testing-library/jest-dom";
import React from "react";

// Mock the AuthProvider
jest.mock("../lib/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

// Mock Next.js router and pathname
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  usePathname: jest.fn(),
}));

import { useRouter, usePathname } from "next/navigation";

describe("AuthGuard", () => {
  // Add these before each test for cleaner setup
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test for loading state
  it("renders loading state when loading and user is null", () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: true });

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  // Test for authenticated state
  it("renders children when user is authenticated", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: "123", email: "test@example.com" },
      loading: false,
    });

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  // Test for unauthorized access to protected route
  it("redirects to sign-in when user is not authenticated and route is protected", () => {
    const mockRouter = { push: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (usePathname as jest.Mock).mockReturnValue("/dashboard");
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: false });

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(mockRouter.push).toHaveBeenCalledWith("/sign-in");
  });

  // Test for public route access without authentication
  it("allows access to public routes when user is not authenticated", () => {
    const mockRouter = { push: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (usePathname as jest.Mock).mockReturnValue("/sign-in");
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: false });

    render(
      <AuthGuard>
        <div>Public Content</div>
      </AuthGuard>
    );

    expect(mockRouter.push).not.toHaveBeenCalled();
    expect(screen.getByText("Public Content")).toBeInTheDocument();
  });

  // Test that useEffect dependencies are correct
  it("watches for auth state changes", () => {
    const mockRouter = { push: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (usePathname as jest.Mock).mockReturnValue("/dashboard");

    // Initially loading
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: true });

    const { rerender } = render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    // No redirect during loading
    expect(mockRouter.push).not.toHaveBeenCalled();

    // Now finished loading, still no user
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: false });

    rerender(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    // Should redirect now
    expect(mockRouter.push).toHaveBeenCalledWith("/sign-in");
  });
});
