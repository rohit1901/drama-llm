// Authentication API Service

import apiClient, { ApiResponse } from './client';

export interface User {
  id: string;
  email: string;
  username: string | null;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  is_active: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  expires_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username?: string;
}

export interface UpdateProfileData {
  email?: string;
  username?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface Session {
  id: string;
  created_at: string;
  last_activity: string;
  ip_address: string | null;
  user_agent: string | null;
  expires_at: string;
}

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      data
    );

    if (response.success && response.data) {
      // Store token
      apiClient.setToken(response.data.token);
      return response.data;
    }

    throw new Error(response.error || 'Registration failed');
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials
    );

    if (response.success && response.data) {
      // Store token
      apiClient.setToken(response.data.token);
      return response.data;
    }

    throw new Error(response.error || 'Login failed');
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      // Clear token regardless of API response
      apiClient.setToken(null);
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to get user');
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>('/auth/me', data);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to update profile');
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordData): Promise<void> {
    const response = await apiClient.put<ApiResponse>('/auth/password', data);

    if (!response.success) {
      throw new Error(response.error || 'Failed to change password');
    }
  }

  /**
   * Get active sessions
   */
  async getSessions(): Promise<Session[]> {
    const response = await apiClient.get<ApiResponse<Session[]>>('/auth/sessions');

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to get sessions');
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse>(
      `/auth/sessions/${sessionId}`
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to delete session');
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!apiClient.getToken();
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return apiClient.getToken();
  }

  /**
   * Verify token is still valid by calling /auth/me
   */
  async verifyToken(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      // Token is invalid, clear it
      apiClient.setToken(null);
      return false;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

export default authService;
