import { create } from "zustand";
import ollama from "ollama/browser";

type Message = {
  type: "question" | "answer";
  content: string;
};
type ChatSettings = {
  role: string;
  model: string;
  temperature: number;
  topP: number;
  topK: number;
};
type ChatStore = {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  messages: Message[];
  addMessage: (message: Message) => void;
  settings: ChatSettings;
  setSettings: (settings: ChatSettings) => void;
};
export const useChatStore = create<ChatStore>((set, get) => ({
  loading: false,
  messages: [],
  settings: {
    role: "user",
    model: "llama3:latest",
    temperature: 0.4,
    topP: 0.7,
    topK: 0.0,
  },
  setSettings: (settings) => {
    set({ settings });
  },
  setLoading: (loading) => {
    set({ loading });
  },
  addMessage: async (message) => {
    set({ loading: true });
    // Add the message to the store
    set({
      messages: [...get().messages, message],
    });
    // If the message is a question, send it to the chatbot
    if (message.type === "question") {
      try {
        const response = await ollama.chat({
          model: get().settings.model,
          messages: get()
            .messages.filter((message) => message.type === "question")
            ?.map((question) => ({
              role: get().settings.role,
              content: question.content,
            })),
          options: {
            temperature: get().settings.temperature,
            top_p: get().settings.topP,
            top_k: get().settings.topK,
          },
        });
        // Add the response to the store after the chatbot responds
        set({
          messages: [
            ...get().messages,
            {
              type: "answer",
              content: response.message.content,
            },
          ],
        });
      } catch (error) {
        console.error(error);
      } finally {
        set({ loading: false });
      }
    }
  },
}));
