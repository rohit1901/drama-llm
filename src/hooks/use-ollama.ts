import { useEffect, useState } from "react";

type OllamaStatus = {
  isRunning: boolean | null;
  isChecking: boolean;
  error: Error | null;
};

/**
 * Hook to check if Ollama service is running
 * @returns Object containing connection status, checking state, and error
 */
export function useOllama(): OllamaStatus {
  const [isRunning, setIsRunning] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const checkOllama = async () => {
      try {
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch("http://localhost:11434/", {
          signal: controller.signal,
        });
        const text = await response.text();

        if (isMounted) {
          console.info(`Drama LLM: ${text}`);
          setIsRunning(true);
          setError(null);
          setIsChecking(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error(`Error connecting to Ollama:`, err);
          setIsRunning(false);
          setError(err instanceof Error ? err : new Error("Unknown error"));
          setIsChecking(false);
        }
      }
    };

    checkOllama();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return { isRunning, isChecking, error };
}
