// API Services Index
// Central export point for all API services

export { apiClient, ApiError } from "./client";
export type { ApiResponse, PaginatedResponse } from "./client";

export { authService } from "./auth";
export type {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  UpdateProfileData,
  ChangePasswordData,
  Session,
} from "./auth";

export { conversationsService } from "./conversations";
export type {
  Conversation,
  ConversationWithCount,
  ConversationSettings,
  Message,
  CreateConversationData,
  UpdateConversationData,
  CreateMessageData,
  UpdateMessageData,
  GetConversationsParams,
  GetMessagesParams,
  ConversationWithMessages,
  ConversationExport,
} from "./conversations";

// Re-export as default for convenience
import { authService } from "./auth";
import { conversationsService } from "./conversations";
import { apiClient } from "./client";

export default {
  auth: authService,
  conversations: conversationsService,
  client: apiClient,
};
