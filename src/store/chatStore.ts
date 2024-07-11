import { create } from "zustand";

type ChatStore = {
  questions: string[];
  answers: string[];
  addQuestion: (question: string) => void;
  addAnswer: (answer: string) => void;
};
export const useChatStore = create<ChatStore>((set) => ({
  questions: [],
  answers: [],
  addQuestion: (question) =>
    set((state) => ({ questions: [...state.questions, question] })),
  addAnswer: (answer) =>
    set((state) => ({ answers: [...state.answers, answer] })),
}));
