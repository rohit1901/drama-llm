import { Dashboard } from "@/pages/Dashboard";
import { useAppStore } from "@/store/appStore";
import { UserLogin } from "@/pages/UserLogin";
import {Route, Switch} from "boom-router";
import {ChatPage} from "@/pages/ChatPage.tsx";
import {Models} from "@/pages/Models.tsx";
const App = () => {
  const isAuthenticated = useAppStore().authenticated;
  if (!isAuthenticated) {
    return <UserLogin />;
  }
  return <Switch>
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
  </Switch>
};
export default App;
