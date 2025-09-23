import { useAppStore } from "@/store/appStore";
import { DisplayStates } from "@/types";

/**
 * Custom hook to handle login state.
 *
 * @returns An object containing the login screen state, authentication status, and Ethereum login state.
 */
function useLogin() {
  const loginScreen: DisplayStates = import.meta.env.DRAMA_LLM_SECURITY;
  const { authenticated } = useAppStore();
  const isAuthenticated = loginScreen === "disable" ? true : authenticated;

  return {
    loginScreen,
    isAuthenticated,
  };
}

export default useLogin;
