// Conversations API Service

import apiClient, { ApiResponse, PaginatedResponse } from "./client";

export interface ConversationSettings {
  temperature?: number;
  topP?: number;
  topK?: number;
  role?: string;
  prompt?: string;
  [key: string]: unknown;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  model: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  settings: ConversationSettings;
}

export interface ConversationWithCount extends Conversation {
  message_count: number;
  last_message: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  metadata: {
    tokens?: number;
    duration_ms?: number;
    model?: string;
    [key: string]: unknown;
  };
}

export interface CreateConversationData {
  title?: string;
  model: string;
  settings?: ConversationSettings;
}

export interface UpdateConversationData {
  title?: string;
  model?: string;
  settings?: ConversationSettings;
}

export interface CreateMessageData {
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: {
    tokens?: number;
    duration_ms?: number;
    [key: string]: unknown;
  };
}

export interface UpdateMessageData {
  content?: string;
  metadata?: Record<string, unknown>;
}

export interface GetConversationsParams {
  page?: number;
  limit?: number;
  search?: string;
  model?: string;
  sort_by?: "created_at" | "updated_at" | "title";
  sort_order?: "asc" | "desc";
}

export interface GetMessagesParams {
  page?: number;
  limit?: number;
  before?: string;
  after?: string;
}

export interface ConversationWithMessages {
  conversation: Conversation;
  messages: Message[];
}

export interface ConversationExport {
  conversation: Conversation;
  messages: Message[];
  exported_at: string;
}

class ConversationsService {
  /**
   * Get all conversations for current user
   */
  async getConversations(
    params?: GetConversationsParams,
  ): Promise<PaginatedResponse<ConversationWithCount>> {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<ConversationWithCount>>
    >("/conversations", params);

    if (response.success && response.data) {
      return response.data;
    }

    console.error("🔵 getConversations failed:", response.error);
    throw new Error(response.error || "Failed to get conversations");
  }

  /**
   * Create a new conversation
   */
  async createConversation(
    data: CreateConversationData,
  ): Promise<Conversation> {
    const response = await apiClient.post<ApiResponse<Conversation>>(
      "/conversations",
      data,
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || "Failed to create conversation");
  }

  /**
   * Get a specific conversation with messages
   */
  async getConversation(id: string): Promise<ConversationWithMessages> {
    const response = await apiClient.get<ApiResponse<ConversationWithMessages>>(
      `/conversations/${id}`,
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || "Failed to get conversation");
  }

  /**
   * Update a conversation
   */
  async updateConversation(
    id: string,
    data: UpdateConversationData,
  ): Promise<Conversation> {
    const response = await apiClient.put<ApiResponse<Conversation>>(
      `/conversations/${id}`,
      data,
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || "Failed to update conversation");
  }

  /**
   * Delete a conversation (soft delete)
   */
  async deleteConversation(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse>(
      `/conversations/${id}`,
    );

    if (!response.success) {
      throw new Error(response.error || "Failed to delete conversation");
    }
  }

  /**
   * Add a message to a conversation
   */
  async addMessage(
    conversationId: string,
    data: CreateMessageData,
  ): Promise<Message> {
    const response = await apiClient.post<ApiResponse<Message>>(
      `/conversations/${conversationId}/messages`,
      data,
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || "Failed to add message");
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(
    conversationId: string,
    params?: GetMessagesParams,
  ): Promise<PaginatedResponse<Message>> {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<Message>>
    >(`/conversations/${conversationId}/messages`, params);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || "Failed to get messages");
  }

  /**
   * Update a message
   */
  async updateMessage(
    conversationId: string,
    messageId: string,
    data: UpdateMessageData,
  ): Promise<Message> {
    const response = await apiClient.put<ApiResponse<Message>>(
      `/conversations/${conversationId}/messages/${messageId}`,
      data,
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || "Failed to update message");
  }

  /**
   * Delete a message (soft delete)
   */
  async deleteMessage(
    conversationId: string,
    messageId: string,
  ): Promise<void> {
    const response = await apiClient.delete<ApiResponse>(
      `/conversations/${conversationId}/messages/${messageId}`,
    );

    if (!response.success) {
      throw new Error(response.error || "Failed to delete message");
    }
  }

  /**
   * Export conversation as JSON
   */
  async exportConversation(id: string): Promise<ConversationExport> {
    const response = await apiClient.get<ApiResponse<ConversationExport>>(
      `/conversations/${id}/export`,
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || "Failed to export conversation");
  }

  /**
   * Duplicate a conversation
   */
  async duplicateConversation(id: string): Promise<Conversation> {
    const response = await apiClient.post<ApiResponse<Conversation>>(
      `/conversations/${id}/duplicate`,
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || "Failed to duplicate conversation");
  }

  /**
   * Get all conversations (without pagination, for sidebar)
   */
  async getAllConversations(): Promise<ConversationWithCount[]> {
    const paginatedResponse = await this.getConversations({ limit: 100 });
    if (Array.isArray(paginatedResponse)) {
      return paginatedResponse as ConversationWithCount[];
    }

    return [];
  }

  /**
   * Search conversations
   */
  async searchConversations(query: string): Promise<ConversationWithCount[]> {
    const response = await this.getConversations({ search: query, limit: 50 });
    return response.data;
  }
}

// Export singleton instance
export const conversationsService = new ConversationsService();

export default conversationsService;
