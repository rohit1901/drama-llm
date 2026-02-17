import { Dashboard } from "@/pages/Dashboard";
import { UserLogin } from "@/pages/UserLogin";
import { UserRegister } from "@/pages/UserRegister";
import { Route, Switch } from "boom-router";
import { ChatPage } from "@/pages/ChatPage.tsx";
import { Models } from "@/pages/Models.tsx";
import useLogin from "@/hooks/use-login";
import { useOllama } from "@/hooks/use-ollama";
import ErrorPage from "@/pages/ErrorPage";

const App = () => {
  const { isAuthenticated, isVerifying } = useLogin();
  const { isRunning, isChecking } = useOllama();

  // 1️⃣ Show loading while checking authentication or Ollama
  if (isVerifying || isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {isVerifying
              ? "Verifying authentication..."
              : "Connecting to Ollama..."}
          </p>
        </div>
      </div>
    );
  }

  // 2️⃣ If Ollama is not running → show the error page
  if (isRunning === false) {
    return <ErrorPage />;
  }

  // 3️⃣ If not authenticated → show login/register routes
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/register">
          <UserRegister />
        </Route>
        <Route path="*">
          <UserLogin />
        </Route>
      </Switch>
    );
  }

  // 4️⃣ Authenticated and Ollama running → render the app routes
  return (
    <Switch>
      <Route path="/">
        <Dashboard>
          <ChatPage />
        </Dashboard>
      </Route>
      <Route path="/chat">
        <Dashboard>
          <ChatPage />
        </Dashboard>
      </Route>
      <Route path="/models">
        <Dashboard>
          <Models />
        </Dashboard>
      </Route>
      <Route path="/error">
        <Dashboard>
          <ErrorPage />
        </Dashboard>
      </Route>
    </Switch>
  );
};

export default App;
