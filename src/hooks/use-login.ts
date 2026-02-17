import { useAppStore } from "@/store/appStore";
import { DisplayStates } from "@/types";
import { authService } from "@/api";
import { useEffect, useState } from "react";

/**
 * Custom hook to handle login state with backend verification.
 *
 * @returns An object containing the login screen state, authentication status, and loading state.
 */
function useLogin() {
  const loginScreen: DisplayStates = import.meta.env.DRAMA_LLM_SECURITY;
  const { authenticated, setAuthenticated } = useAppStore();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // If login is disabled, user is always authenticated
    if (loginScreen === "disable") {
      setAuthenticated(true);
      setIsVerifying(false);
      return;
    }

    // Verify token on mount
    const verifyAuth = async () => {
      const token = authService.getToken();

      if (!token) {
        setAuthenticated(false);
        setIsVerifying(false);
        return;
      }

      try {
        // Verify token is still valid
        const isValid = await authService.verifyToken();
        setAuthenticated(isValid);
      } catch (error) {
        console.error("Token verification failed:", error);
        setAuthenticated(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAuth();
  }, [loginScreen, setAuthenticated]);

  const isAuthenticated = loginScreen === "disable" ? true : authenticated;

  return {
    loginScreen,
    isAuthenticated,
    isVerifying,
  };
}

export default useLogin;
