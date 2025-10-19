import { ReactNode } from "react";
import { ChatPage } from "@/pages/ChatPage.tsx";
import { Models } from "@/pages/Models.tsx";

export type Route = {
  path: "/" | "/chat" | "/models";
  value: string;
  component: ReactNode;
};
export const routes: Route[] = [
  { path: "/", value: "Playground", component: <ChatPage /> },
  { path: "/chat", value: "Playground", component: <ChatPage /> },
  { path: "/models", value: "Models", component: <Models /> },
];
