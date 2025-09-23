import { ChatSettings } from "@/store/chatStore";

export const isRole = (value: unknown): value is ChatSettings["role"] => {
  return value === "user" || value === "system" || value === "assistant";
};
