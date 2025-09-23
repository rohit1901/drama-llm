import { Role } from "@/types/ollama";

export const isRole = (value: unknown): value is Role => {
  return value === "user" || value === "system" || value === "assistant";
};
