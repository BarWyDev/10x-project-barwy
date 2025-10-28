/**
 * useRegistration Hook
 *
 * Manages user registration flow including:
 * - Sign up with Supabase
 * - Automatic login after registration
 * - Email confirmation handling
 * - Error state management
 */

import { useState, useCallback } from "react";
import { supabaseClient } from "@/db/supabase.client";

interface RegistrationData {
  email: string;
  password: string;
}

type RegistrationStatus = "idle" | "loading" | "success" | "error";

interface RegistrationState {
  status: RegistrationStatus;
  error: string | null;
}

/**
 * Get user-friendly error message from Supabase error
 */
function getErrorMessage(error: unknown): string {
  const message = (error as Error)?.message || "";

  if (message.includes("already registered")) {
    return "Ten adres email jest już w użyciu. Możesz się zalogować lub użyć innego adresu.";
  }

  if (message.includes("Password")) {
    return "Hasło jest za słabe. Spróbuj dodać więcej znaków lub symboli.";
  }

  if (message.includes("Email not confirmed")) {
    return "Sprawdź swoją skrzynkę email i kliknij link aktywacyjny.";
  }

  return message || "Nie udało się utworzyć konta. Spróbuj ponownie.";
}

/**
 * Wait for session to be saved to cookies
 */
async function waitForSessionSync(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useRegistration() {
  const [state, setState] = useState<RegistrationState>({
    status: "idle",
    error: null,
  });

  /**
   * Register new user
   */
  const register = useCallback(async (data: RegistrationData) => {
    setState({ status: "loading", error: null });

    try {
      // Attempt sign up
      const { data: authData, error: authError } = await supabaseClient.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/app`,
          data: {
            email: data.email,
          },
        },
      });

      if (authError) {
        const errorMessage = getErrorMessage(authError);
        setState({ status: "error", error: errorMessage });
        return { success: false, error: errorMessage };
      }

      // Check if session was created (auto-login)
      if (authData.session) {
        await waitForSessionSync();
        setState({ status: "success", error: null });
        return {
          success: true,
          redirect: "/app",
          autoLogin: true,
        };
      }

      // No session - try to sign in
      if (authData.user) {
        const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (signInError) {
          // Check if email confirmation required
          if (signInError.message.includes("Email not confirmed")) {
            const errorMessage =
              "Konto utworzone! Sprawdź swoją skrzynkę email (http://127.0.0.1:54324) i kliknij link aktywacyjny, aby móc się zalogować.";
            setState({ status: "error", error: errorMessage });
            return { success: false, error: errorMessage, requiresConfirmation: true };
          }

          // Other sign-in error - redirect to login
          const errorMessage =
            "Konto utworzone, ale nie udało się automatycznie zalogować. Przejdź do strony logowania.";
          setState({ status: "error", error: errorMessage });

          // Redirect to login after delay
          setTimeout(() => {
            // This is intentional navigation, not a component state mutation
            // eslint-disable-next-line react-compiler/react-compiler
            window.location.href = "/login";
          }, 2000);

          return { success: false, error: errorMessage, redirectToLogin: true };
        }

        // Successful sign in
        if (signInData.session) {
          await waitForSessionSync();
          setState({ status: "success", error: null });
          return {
            success: true,
            redirect: "/app",
            autoLogin: true,
          };
        }

        // No session after sign in
        const errorMessage = "Konto utworzone, ale nie udało się automatycznie zalogować. Przejdź do strony logowania.";
        setState({ status: "error", error: errorMessage });
        return { success: false, error: errorMessage, redirectToLogin: true };
      }

      // No user created - shouldn't happen
      const errorMessage = "Wystąpił błąd podczas rejestracji. Spróbuj ponownie.";
      setState({ status: "error", error: errorMessage });
      return { success: false, error: errorMessage };
    } catch {
      const errorMessage = "Wystąpił błąd podczas rejestracji. Spróbuj ponownie.";
      setState({ status: "error", error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({ status: "idle", error: null });
  }, []);

  return {
    register,
    reset,
    isLoading: state.status === "loading",
    error: state.error,
    status: state.status,
  };
}
