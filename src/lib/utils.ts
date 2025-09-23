import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import ollama from "ollama/browser";
import { Model } from "@/types/ollama.ts";
import { DisplayStates } from "@/types";
import { ChatSettings, Message } from "@/store/chatStore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isFieldEmpty = (value: string) => value.trim() === "";
export const isArrayEmpty = (value: unknown[]) => value.length === 0;
export const isFieldBlank = (value: string) => value.trim() === " ";
export const isFieldEmptyOrBlank = (value: string | null) =>
  value === null ||
  value === undefined ||
  isFieldBlank(value) ||
  isFieldEmpty(value);
export const formatDate = (date?: string, time = true) => {
  // Create a new Date object
  const convertedDate = new Date(date ?? new Date());

  // Create an Intl.DateTimeFormat instance with desired options
  const formatter = new Intl.DateTimeFormat("en-DE", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: time ? "numeric" : undefined,
    minute: time ? "numeric" : undefined,
  });

  return formatter.format(convertedDate);
};
/**
 * Copy text to clipboard
 * @param text - The text to copy to clipboard
 */
export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error("Failed to copy text: ", error);
  }
};
/**
 * Fetch available models from the API
 * @returns {Promise<string[]>} - An array of available models
 */
export const listPulledModels = async (): Promise<Model[]> => {
  try {
    const response = await ollama.list();
    const models = response.models;
    if (models.length === 0) {
      throw new Error("No models found");
    }
    return models.map((m) => ({
      model: m.name,
      ...m,
    }));
  } catch (error) {
    console.error("Failed to list models: ", error);
    return [];
  }
};
/**
 * Check if a model is pulled
 * @param pulledModels {Partial<Model>[]} - An array of pulled models
 * @param model {string | undefined} - The model to check
 */
export const isModelPulled = (
  pulledModels: Partial<Model>[],
  model?: string,
) => {
  return !!pulledModels.find((m) => m.model === model);
};

/**
 * Transforms the display state to a boolean value.
 *
 * @param displayState - The display state to transform.
 * @returns Returns true if the display state is "enable", otherwise false.
 */
export const transformDisplayStates = (displayState?: DisplayStates) => {
  if (displayState === "enable") return true;
  return false;
};

/**
 * Safely compares two strings using localeCompare.
 *
 * @param a - The first string to compare.
 * @param b - The second string to compare.
 * @returns A negative number if a < b, 0 if a === b, or a positive number if a > b.
 */
export function safeLocaleCompare(a = "", b = ""): number {
  return a.localeCompare(b);
}

/**
 * Maps a message type to its corresponding chat role.
 *
 * @param type - The type of the message, which can be either "question" or "answer".
 * @returns The corresponding chat role, either "user" for "question" or "assistant" for "answer".
 * @throws {Error} If the provided message type is invalid.
 */
export function getRole(type: Message["type"]): ChatSettings["role"] {
  switch (type) {
    case "question":
      return "user";
    case "answer":
      return "assistant";
    default:
      throw new Error("Invalid message type");
  }
}
