import { Dashboard } from "@/pages/Dashboard";
import { UserLogin } from "@/pages/UserLogin";
import { Route, Switch } from "boom-router";
import { ChatPage } from "@/pages/ChatPage.tsx";
import { Models } from "@/pages/Models.tsx";
import useLogin from "@/hooks/use-login";
import { useOllama } from "@/hooks/use-ollama";
import ErrorPage from "@/pages/ErrorPage";
const App = () => {
  const { isAuthenticated } = useLogin();
  const isOllamaRunning = useOllama();
  if (!isOllamaRunning) {
    return null;
  }
  if (!isAuthenticated) {
    return <UserLogin />;
  }
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
