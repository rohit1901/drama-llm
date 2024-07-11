import { create } from "zustand";
import ollama from "ollama";

type Message = {
  type: "question" | "answer";
  content: string;
};
type ChatStore = {
    loading: boolean;
    setLoading: (loading: boolean) => void;
  messages: Message[];
    addMessage: (message: Message) => void;
};
export const useChatStore = create<ChatStore>((set, get) => ({
    loading: false,
    messages: [],
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
            const response = await ollama
                .chat({
                    model: "llama3",
                    messages: get().messages.filter(message => message.type === "question")?.map((question) => ({
                        role: "user",
                        content: question.content,
                    })),
                })
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
            set({ loading: false });
        }
    },
}));
