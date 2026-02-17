// Type definitions for Drama LLM Backend

export interface User {
  id: string;
  email: string;
  password_hash?: string;
  username: string | null;
  created_at: Date;
  updated_at: Date;
  last_login: Date | null;
  is_active: boolean;
}

export interface UserCreateInput {
  email: string;
  password: string;
  username?: string;
}

export interface UserUpdateInput {
  email?: string;
  username?: string;
  password?: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  model: string;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
  settings: ConversationSettings;
}

export interface ConversationSettings {
  temperature?: number;
  topP?: number;
  topK?: number;
  role?: string;
  prompt?: string;
  [key: string]: any;
}

export interface ConversationCreateInput {
  user_id: string;
  title: string;
  model: string;
  settings?: ConversationSettings;
}

export interface ConversationUpdateInput {
  title?: string;
  model?: string;
  settings?: ConversationSettings;
}

export interface ConversationWithCount extends Conversation {
  message_count: number;
  last_message: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
  metadata: MessageMetadata;
}

export interface MessageMetadata {
  tokens?: number;
  duration_ms?: number;
  model?: string;
  [key: string]: any;
}

export interface MessageCreateInput {
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: MessageMetadata;
}

export interface MessageUpdateInput {
  content?: string;
  metadata?: MessageMetadata;
}

export interface ChatSettings {
  id: string;
  user_id: string;
  name: string;
  settings: ConversationSettings;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ChatSettingsCreateInput {
  user_id: string;
  name: string;
  settings: ConversationSettings;
  is_default?: boolean;
}

export interface ChatSettingsUpdateInput {
  name?: string;
  settings?: ConversationSettings;
  is_default?: boolean;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
  last_activity: Date;
  ip_address: string | null;
  user_agent: string | null;
}

export interface SessionCreateInput {
  user_id: string;
  token: string;
  expires_at: Date;
  ip_address?: string;
  user_agent?: string;
}

export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
  expires_at: Date;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  username?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface ConversationExport {
  conversation: Conversation;
  messages: Message[];
  exported_at: Date;
}

export interface ConversationStats {
  total_conversations: number;
  total_messages: number;
  models_used: { model: string; count: number }[];
  most_active_day: string;
}

// Request/Response types for API endpoints
export interface CreateConversationRequest {
  title?: string;
  model: string;
  settings?: ConversationSettings;
}

export interface UpdateConversationRequest {
  title?: string;
  model?: string;
  settings?: ConversationSettings;
}

export interface CreateMessageRequest {
  role: 'user' | 'assistant';
  content: string;
}

export interface GetConversationsQuery {
  page?: number;
  limit?: number;
  search?: string;
  model?: string;
  sort_by?: 'created_at' | 'updated_at' | 'title';
  sort_order?: 'asc' | 'desc';
}

export interface GetMessagesQuery {
  page?: number;
  limit?: number;
  before?: string;
  after?: string;
}

// Error types
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409);
  }
}
