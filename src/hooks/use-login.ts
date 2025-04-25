import { useAppStore } from "@/store/appStore";
import { DisplayStates } from "@/types";

/**
 * Custom hook to handle login state.
 *
 * @returns {Object} An object containing the login screen state, authentication status, and Ethereum login state.
 */
function useLogin() {
  const loginScreen: DisplayStates = import.meta.env.DRAMA_LLM_SECURITY;
  const { authenticated } = useAppStore();
  const isAuthenticated = loginScreen === "disable" ? true : authenticated;
  const ethLogin: DisplayStates = import.meta.env.DRAMA_LLM_ETH_LOGIN;

  return {
    loginScreen,
    isAuthenticated,
    ethLogin,
  };
}

export default useLogin;
