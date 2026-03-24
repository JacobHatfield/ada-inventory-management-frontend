import { apiRequest } from './apiClient';
import type {
  ForgotPasswordRequest,
  LoginRequest,
  ResetPasswordRequest,
  RegisterRequest,
  TokenResponse,
  UserProfile,
  ProfileUpdate,
} from '../types';

export const authService = {
  register(payload: RegisterRequest): Promise<UserProfile> {
    return apiRequest<UserProfile>('/auth/register', {
      method: 'POST',
      body: payload,
      skipAuth: true,
    });
  },

  login(payload: LoginRequest): Promise<TokenResponse> {
    return apiRequest<TokenResponse>('/auth/login', {
      method: 'POST',
      body: payload,
      skipAuth: true,
    });
  },

  getCurrentUser(): Promise<UserProfile> {
    return apiRequest<UserProfile>('/auth/me');
  },

  forgotPassword(payload: ForgotPasswordRequest): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: payload,
      skipAuth: true,
    });
  },

  resetPassword(payload: ResetPasswordRequest): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: payload,
      skipAuth: true,
    });
  },

  getProfile(): Promise<UserProfile> {
    return apiRequest<UserProfile>('/users/me/profile');
  },

  updateProfile(payload: ProfileUpdate): Promise<UserProfile> {
    return apiRequest<UserProfile>('/users/me/profile', {
      method: 'PUT',
      body: payload,
    });
  },
};
