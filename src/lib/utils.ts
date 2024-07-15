import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isFieldEmpty = (value: string) => value.trim() === "";
export const isArrayEmpty = (value: unknown[]) => value.length === 0;
export const formatDate = (date?: string, time = true) => {
  // Create a new Date object
  const convertedDate = new Date(date ?? new Date());

// Create an Intl.DateTimeFormat instance with desired options
  const formatter = new Intl.DateTimeFormat('en-DE', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: time ? 'numeric' : undefined,
    minute: time ? 'numeric' : undefined,
  });

  return formatter.format(convertedDate);
};
/**
 * Copy text to clipboard
 * @param text {string} - The text to copy to clipboard
 */
export const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
    } catch (error) {
        console.error("Failed to copy text: ", error);
    }
}
