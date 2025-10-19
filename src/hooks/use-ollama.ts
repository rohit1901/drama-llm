import { useLocation } from "boom-router";

/**
 *
 * @returns
 */
export async function useOllama() {
  const [, setLocation] = useLocation();
  try {
    const response = await fetch("http://localhost:11434/");
    const text = await response.text();
    console.info(text.includes("Ollama is running"));
    return true;
  } catch (err) {
    setLocation("/error");
    console.error(`Error: ${err} Ollama`);
  }
}
