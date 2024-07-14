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
}
/**
 * Copy the current URL to the clipboard.
 */
export const handleCopyUrl = async () => {
  try {
    const url = window.location.href; // Get the current URL
    await navigator.clipboard.writeText(url); // Copy the URL to the clipboard
  } catch (error) {
    console.error("Failed to copy the URL: ", error);
    // Optionally, handle the error case, e.g., by showing an error toast
  }
};
