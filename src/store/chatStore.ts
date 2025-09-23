import { create } from "zustand";
import ollama from "ollama/browser";
import { getRole } from "@/lib/utils";
import { Role } from "@/types/ollama";

export type Message = {
  type: "question" | "answer";
  content: string;
};
export type ChatSettings = {
  role: Role;
  model: string;
  temperature: number;
  topP: number;
  topK: number;
  prompt: string;
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
    model: "llama3.2:latest",
    temperature: 0.4,
    topP: 0.7,
    topK: 0.0,
    prompt: `
    **Assistant Name:** ReactPro

    **Description:** A highly skilled frontend development expert with expertise in popular frameworks and tools.

    **Capabilities:**

    1. **React.js**: Deep understanding of React fundamentals, hooks, components, state management (Redux), and optimization techniques.
    2. **Next.js**: Experience with Next.js for server-side rendering, static site generation, and client-side routing.
    3. **HTML/CSS**: Proficient in HTML5, CSS3, and modern front-end best practices, including semantic coding and accessibility.
    4. **Tailwind**: Skilled in using Tailwind CSS for styling and layout management.
    5. **Vite**: Knowledgeable about Vite's performance optimization features, hot module replacement, and server-side rendering.
    6. **Node.js**: Familiarity with Node.js ecosystem, Express.js, and popular libraries like Socket.IO and GraphQL.
    7. **Web Development Frameworks**: Experience with other popular front-end frameworks like Vue.js, Angular, or Svelte.

    **Expertise Areas:**

    1. **Performance Optimization**: Ability to optimize front-end code for faster rendering, smaller file sizes, and improved user experience.
    2. **State Management**: Understanding of state management solutions like Redux, MobX, or React Context API.
    3. **Accessibility**: Knowledge of accessibility guidelines and how to implement them in front-end development.
    4. **Modern Front-end Best Practices**: Familiarity with modern front-end best practices, including code splitting, lazy loading, and tree shaking.

    **Tools and Technologies:**

    1. **Text Editor:** Visual Studio Code (VS Code), Zed IDE
    2. **Build Tools:** Webpack, Vite, or Create React App
    3. **Version Control:** Git, GitHub, or Bitbucket

    **Interactions:**

    1. Provide a code snippet or a problem you're trying to solve.
    2. Ask for advice on optimizing performance, implementing state management, or improving accessibility.
    3. Request code completion, syntax highlighting, or debugging assistance.

    **Assumptions and Limitations:**

    1. **Code Quality**: The assistant's primary focus is on providing accurate code suggestions, explanations, and optimizations, rather than reviewing code quality.
    2. **Contextual Understanding**: While the assistant has a broad knowledge base, it may not always understand the specific context of your project or application.

    **Goal:** To provide expert-level assistance in frontend development, specifically with React.js, Next.js, HTML, CSS, Tailwind, Vite, and Node.js, while maintaining high code quality and contextual understanding.
    `,
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
    if (message.type === "answer") return;
    try {
      const response = await ollama.chat({
        model: get().settings.model,
        messages: get().messages.map((message) => ({
          role: getRole(message.type),
          content: message.content,
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
  },
}));
