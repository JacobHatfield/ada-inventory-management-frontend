import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '@/shared/services/authService';
import { apiRequest } from '@/shared/services/apiClient';

vi.mock('@/shared/services/apiClient', () => ({
  apiRequest: vi.fn(),
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('register calls correct endpoint', async () => {
    const payload = { email: 'test@test.com', password: 'password123' };
    await authService.register(payload);
    expect(apiRequest).toHaveBeenCalledWith('/auth/register', expect.objectContaining({
      method: 'POST',
      body: payload,
      skipAuth: true
    }));
  });

  it('login calls correct endpoint', async () => {
    const payload = { email: 'test@test.com', password: 'password123' };
    await authService.login(payload);
    expect(apiRequest).toHaveBeenCalledWith('/auth/login', expect.objectContaining({
      method: 'POST',
      body: payload,
      skipAuth: true
    }));
  });

  it('getCurrentUser calls correct endpoint', async () => {
    await authService.getCurrentUser();
    expect(apiRequest).toHaveBeenCalledWith('/auth/me');
  });

  it('forgotPassword calls correct endpoint', async () => {
    const payload = { email: 'test@test.com' };
    await authService.forgotPassword(payload);
    expect(apiRequest).toHaveBeenCalledWith('/auth/forgot-password', expect.objectContaining({
      method: 'POST',
      body: payload,
      skipAuth: true
    }));
  });

  it('resetPassword calls correct endpoint', async () => {
    const payload = { token: 'token123', new_password: 'newpassword' };
    await authService.resetPassword(payload);
    expect(apiRequest).toHaveBeenCalledWith('/auth/reset-password', expect.objectContaining({
      method: 'POST',
      body: payload,
      skipAuth: true
    }));
  });

  it('getProfile calls correct endpoint', async () => {
    await authService.getProfile();
    expect(apiRequest).toHaveBeenCalledWith('/users/me/profile');
  });

  it('updateProfile calls correct endpoint', async () => {
    const payload = { full_name: 'New Name' };
    await authService.updateProfile(payload);
    expect(apiRequest).toHaveBeenCalledWith('/users/me/profile', expect.objectContaining({
      method: 'PUT',
      body: payload
    }));
  });
});
