import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/custom/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Toaster />
      <App />
    </ThemeProvider>
  </ErrorBoundary>,
);
