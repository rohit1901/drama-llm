import { Dashboard } from "@/pages/Dashboard";
import { useAppStore } from "@/store/appStore";
import { UserLogin } from "@/pages/UserLogin";
const App = () => {
  const isAuthenticated = useAppStore().authenticated;

  if (!isAuthenticated) {
    return <UserLogin />;
  }
  return <Dashboard />;
};
export default App;
