import { create } from "zustand";
import { streamText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { getRole } from "@/lib/utils";
import { Role } from "@/types/ollama";
import { conversationsService } from "@/api";
import type { Message as BackendMessage } from "@/api/conversations";

// Configure Ollama as an OpenAI-compatible provider
const ollama = createOpenAICompatible({
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama", // Ollama doesn't require a real API key
  name: "ollama",
});

export type Message = {
  type: "question" | "answer";
  content: string;
  id?: string;
  isStreaming?: boolean;
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
  isGenerating: boolean;
  abortController: AbortController | null;
  setLoading: (loading: boolean) => void;
  messages: Message[];
  currentConversationId: string | null;
  setCurrentConversationId: (id: string | null) => void;
  addMessage: (message: Message) => void;
  settings: ChatSettings;
  setSettings: (
    settings: ChatSettings | ((prev: ChatSettings) => ChatSettings),
  ) => void;
  loadConversation: (conversationId: string) => Promise<void>;
  createNewConversation: (title?: string) => Promise<string>;
  clearMessages: () => void;
  saveMessageToBackend: (
    conversationId: string,
    role: "user" | "assistant",
    content: string,
  ) => Promise<string | undefined>;
  stopGeneration: () => void;
  editMessage: (messageIndex: number, newContent: string) => Promise<void>;
  deleteMessage: (messageIndex: number) => Promise<void>;
  regenerateResponse: (fromMessageIndex: number) => Promise<void>;
};

export const useChatStore = create<ChatStore>((set, get) => ({
  loading: false,
  isGenerating: false,
  abortController: null,
  messages: [],
  currentConversationId: null,

  setCurrentConversationId: (id: string | null) => {
    set({ currentConversationId: id });
  },

  setLoading: (loading) => {
    set({ loading });
  },

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
    if (typeof settings === "function") {
      set({ settings: settings(get().settings) });
    } else {
      set({ settings });
    }
  },

  clearMessages: () => {
    set({ messages: [], currentConversationId: null });
  },

  /**
   * Stop the current streaming generation
   */
  stopGeneration: () => {
    const controller = get().abortController;
    if (controller) {
      controller.abort();
    }
    set({ isGenerating: false, abortController: null });
  },

  /**
   * Load a conversation from the backend
   */
  loadConversation: async (conversationId: string) => {
    try {
      set({ loading: true });

      const data = await conversationsService.getConversation(conversationId);

      // Convert backend messages to local format
      const messages: Message[] = data.messages.map((msg: BackendMessage) => ({
        type: msg.role === "user" ? "question" : "answer",
        content: msg.content,
        id: msg.id,
      }));

      set({
        currentConversationId: conversationId,
        messages,
        settings: {
          ...get().settings,
          model: data.conversation.model,
          temperature:
            data.conversation.settings?.temperature ??
            get().settings.temperature,
          topP: data.conversation.settings?.topP ?? get().settings.topP,
          topK: data.conversation.settings?.topK ?? get().settings.topK,
          prompt: data.conversation.settings?.prompt ?? get().settings.prompt,
        },
      });
    } catch (error) {
      console.error("Failed to load conversation:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Create a new conversation
   */
  createNewConversation: async (title?: string) => {
    try {
      const settings = get().settings;

      const conversation = await conversationsService.createConversation({
        title: title || `New Chat - ${new Date().toLocaleDateString()}`,
        model: settings.model,
        settings: {
          temperature: settings.temperature,
          topP: settings.topP,
          topK: settings.topK,
          role: settings.role,
          prompt: settings.prompt,
        },
      });

      set({
        currentConversationId: conversation.id,
        messages: [],
      });

      return conversation.id as string;
    } catch (error) {
      console.error("Failed to create conversation:", error);
      throw error;
    }
  },

  /**
   * Save a message to the backend
   */
  saveMessageToBackend: async (
    conversationId: string,
    role: "user" | "assistant",
    content: string,
  ): Promise<string | undefined> => {
    try {
      const savedMessage = await conversationsService.addMessage(
        conversationId,
        {
          role,
          content,
          metadata: {},
        },
      );
      return savedMessage.id;
    } catch (error) {
      console.error("Failed to save message to backend:", error);
      // Don't throw - allow chat to continue even if backend save fails
      return undefined;
    }
  },

  /**
   * Add a message and handle the conversation flow with streaming
   */
  addMessage: async (message: Message) => {
    // Create abort controller for this generation
    const abortController = new AbortController();
    set({ loading: true, isGenerating: true, abortController });

    try {
      // Create conversation if it doesn't exist
      let conversationId: string | null = get().currentConversationId;
      if (!conversationId) {
        conversationId = await get().createNewConversation();
      }

      // Add the user message to the store
      set({
        messages: [...get().messages, message],
      });

      // Save user message to backend
      if (conversationId) {
        const messageId = await get().saveMessageToBackend(
          conversationId,
          "user",
          message.content,
        );
        // Update message with backend ID
        if (messageId) {
          set({
            messages: get().messages.map((msg, idx) =>
              idx === get().messages.length - 1
                ? { ...msg, id: messageId }
                : msg,
            ),
          });
        }
      }

      // If the message is an answer, don't send to chatbot
      if (message.type === "answer") {
        set({ loading: false, isGenerating: false });
        return;
      }

      // Create placeholder message for streaming
      const streamingMessage: Message = {
        type: "answer",
        content: "",
        isStreaming: true,
      };

      set({
        messages: [...get().messages, streamingMessage],
      });

      let fullContent = "";

      try {
        // Send to Ollama with streaming enabled using AI SDK
        const result = await streamText({
          model: ollama(get().settings.model),
          messages: get()
            .messages.filter((msg) => !msg.isStreaming)
            .map((message) => ({
              role: getRole(message.type),
              content: message.content,
            })),
          temperature: get().settings.temperature,
          topP: get().settings.topP,
          abortSignal: abortController.signal,
        });

        // Process streaming chunks
        for await (const chunk of result.textStream) {
          // Check if generation was stopped - exit immediately
          if (abortController.signal.aborted) {
            // Update the streaming message to show it was stopped
            set({
              messages: get().messages.map((msg, idx) =>
                idx === get().messages.length - 1 && msg.isStreaming
                  ? {
                      ...msg,
                      content: fullContent || "Generation stopped by user.",
                      isStreaming: false,
                    }
                  : msg,
              ),
            });
            return; // Exit the entire addMessage function
          }

          fullContent += chunk;

          // Only update if not aborted
          if (!abortController.signal.aborted) {
            // Update the streaming message
            set({
              messages: get().messages.map((msg, idx) =>
                idx === get().messages.length - 1
                  ? { ...msg, content: fullContent }
                  : msg,
              ),
            });
          }
        }

        // Check one final time if aborted before marking complete
        if (abortController.signal.aborted) {
          // Update message to show completion was aborted
          set({
            messages: get().messages.map((msg, idx) =>
              idx === get().messages.length - 1 && msg.isStreaming
                ? {
                    ...msg,
                    content: fullContent || "Generation stopped by user.",
                    isStreaming: false,
                  }
                : msg,
            ),
          });
          return;
        }

        // Mark streaming as complete
        set({
          messages: get().messages.map((msg, idx) =>
            idx === get().messages.length - 1
              ? { ...msg, isStreaming: false }
              : msg,
          ),
        });

        // Save assistant message to backend (only if not aborted and has content)
        if (conversationId && fullContent && !abortController.signal.aborted) {
          const messageId = await get().saveMessageToBackend(
            conversationId,
            "assistant",
            fullContent,
          );
          // Update message with backend ID
          if (messageId) {
            set({
              messages: get().messages.map((msg, idx) =>
                idx === get().messages.length - 1
                  ? { ...msg, id: messageId }
                  : msg,
              ),
            });
          }
        }
      } catch (streamError) {
        console.error("Streaming error:", streamError);

        // If streaming fails and generation not stopped, fall back to non-streaming
        if (
          streamError instanceof Error &&
          streamError.name !== "AbortError" &&
          streamError.message !== "The user aborted a request." &&
          get().isGenerating
        ) {
          console.log("Falling back to non-streaming mode...");

          // Remove the failed streaming message
          set({
            messages: get().messages.slice(0, -1),
          });

          // Try non-streaming request using AI SDK
          const fallbackResult = await streamText({
            model: ollama(get().settings.model),
            messages: get().messages.map((message) => ({
              role: getRole(message.type),
              content: message.content,
            })),
            temperature: get().settings.temperature,
            topP: get().settings.topP,
          });

          // Get the full text from the stream
          const fullText = await fallbackResult.text;

          const answerMessage: Message = {
            type: "answer",
            content: fullText,
          };

          set({
            messages: [...get().messages, answerMessage],
          });

          // Save to backend
          if (conversationId) {
            const messageId = await get().saveMessageToBackend(
              conversationId,
              "assistant",
              fullText,
            );
            if (messageId) {
              set({
                messages: get().messages.map((msg, idx) =>
                  idx === get().messages.length - 1
                    ? { ...msg, id: messageId }
                    : msg,
                ),
              });
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in addMessage:", error);
      // Remove any streaming message on error
      set({
        messages: get().messages.filter((msg) => !msg.isStreaming),
      });
      // Add error message to chat
      set({
        messages: [
          ...get().messages,
          {
            type: "answer",
            content:
              "Sorry, I encountered an error processing your request. Please try again.",
          },
        ],
      });
    } finally {
      set({ loading: false, isGenerating: false, abortController: null });
    }
  },

  /**
   * Edit a message and update backend
   */
  editMessage: async (messageIndex: number, newContent: string) => {
    try {
      const messages = get().messages;
      if (messageIndex < 0 || messageIndex >= messages.length) {
        throw new Error("Invalid message index");
      }

      const messageToEdit = messages[messageIndex];
      const conversationId = get().currentConversationId;

      // Update locally first
      set({
        messages: messages.map((msg, idx) =>
          idx === messageIndex ? { ...msg, content: newContent } : msg,
        ),
      });

      // Update in backend if message has an ID
      if (conversationId && messageToEdit.id) {
        await conversationsService.updateMessage(
          conversationId,
          messageToEdit.id,
          { content: newContent },
        );
      }
    } catch (error) {
      console.error("Failed to edit message:", error);
      throw error;
    }
  },

  /**
   * Delete a message and update backend
   */
  deleteMessage: async (messageIndex: number) => {
    try {
      const messages = get().messages;
      if (messageIndex < 0 || messageIndex >= messages.length) {
        throw new Error("Invalid message index");
      }

      const messageToDelete = messages[messageIndex];
      const conversationId = get().currentConversationId;

      // Delete from backend first if message has an ID
      if (conversationId && messageToDelete.id) {
        await conversationsService.deleteMessage(
          conversationId,
          messageToDelete.id,
        );
      }

      // Update locally
      set({
        messages: messages.filter((_, idx) => idx !== messageIndex),
      });
    } catch (error) {
      console.error("Failed to delete message:", error);
      throw error;
    }
  },

  /**
   * Regenerate response from a specific message index
   */
  regenerateResponse: async (fromMessageIndex: number) => {
    try {
      const messages = get().messages;
      if (fromMessageIndex < 0 || fromMessageIndex >= messages.length) {
        throw new Error("Invalid message index");
      }

      // Remove all messages after the selected message
      const conversationId = get().currentConversationId;
      const messagesToKeep = messages.slice(0, fromMessageIndex + 1);
      const messagesToDelete = messages.slice(fromMessageIndex + 1);

      // Delete removed messages from backend
      if (conversationId) {
        for (const msg of messagesToDelete) {
          if (msg.id) {
            await conversationsService.deleteMessage(conversationId, msg.id);
          }
        }
      }

      // Update messages locally
      set({ messages: messagesToKeep });

      // Get the last user message to regenerate from
      const lastUserMessage = messagesToKeep[messagesToKeep.length - 1];
      if (lastUserMessage && lastUserMessage.type === "question") {
        // Trigger a new response (this will automatically save to backend)
        await get().addMessage({
          type: "question",
          content: lastUserMessage.content,
        });
      }
    } catch (error) {
      console.error("Failed to regenerate response:", error);
      throw error;
    }
  },
}));
