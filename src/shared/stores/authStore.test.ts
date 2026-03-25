import { setActivePinia, createPinia } from 'pinia';
import { vi } from 'vitest';
import { useAuthStore } from './authStore';
import { authService } from '../services/authService';

vi.mock('../services/apiClient', () => ({
  setAuthTokenProvider: vi.fn(),
}));

vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    getCurrentUser: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
  },
}));

const mockUser = {
  id: 1,
  email: 'test@example.com',
  full_name: 'Test User',
  is_active: true,
};

const mockTokenResponse = {
  access_token: 'mock-jwt-token',
  token_type: 'bearer',
};

describe('authStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('login()', () => {
    it('stores token and user on success', async () => {
      vi.mocked(authService.login).mockResolvedValue(mockTokenResponse);
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

      const store = useAuthStore();
      await store.login({ email: 'test@example.com', password: 'password123' });

      expect(store.token).toBe('mock-jwt-token');
      expect(store.user).toEqual(mockUser);
      expect(store.isAuthenticated).toBe(true);
      expect(store.loginError).toBeNull();
    });

    it('persists token to localStorage on success', async () => {
      vi.mocked(authService.login).mockResolvedValue(mockTokenResponse);
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

      const store = useAuthStore();
      await store.login({ email: 'test@example.com', password: 'password123' });

      expect(localStorage.getItem('ada_inventory_access_token')).toBe('mock-jwt-token');
    });

    it('sets loginError and throws on bad credentials', async () => {
      vi.mocked(authService.login).mockRejectedValue(new Error('Invalid credentials'));

      const store = useAuthStore();
      await expect(store.login({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow(
        'Invalid credentials',
      );

      expect(store.token).toBeNull();
      expect(store.user).toBeNull();
      expect(store.isAuthenticated).toBe(false);
      expect(store.loginError).toBe('Invalid credentials');
    });

    it('resets isLoggingIn to false after completion', async () => {
      vi.mocked(authService.login).mockResolvedValue(mockTokenResponse);
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

      const store = useAuthStore();
      await store.login({ email: 'test@example.com', password: 'password123' });

      expect(store.isLoggingIn).toBe(false);
    });

    it('resets isLoggingIn to false even when login fails', async () => {
      vi.mocked(authService.login).mockRejectedValue(new Error('Server error'));

      const store = useAuthStore();
      await store.login({ email: 'test@example.com', password: 'password123' }).catch(() => {});

      expect(store.isLoggingIn).toBe(false);
    });
  });

  describe('register()', () => {
    it('registers and auto-logs in on success', async () => {
      vi.mocked(authService.register).mockResolvedValue(mockUser);
      vi.mocked(authService.login).mockResolvedValue(mockTokenResponse);
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

      const store = useAuthStore();
      await store.register({ email: 'test@example.com', password: 'password123' });

      expect(store.token).toBe('mock-jwt-token');
      expect(store.user).toEqual(mockUser);
      expect(store.isAuthenticated).toBe(true);
    });

    it('sets registerError and throws when registration fails', async () => {
      vi.mocked(authService.register).mockRejectedValue(new Error('Email already in use'));

      const store = useAuthStore();
      await expect(
        store.register({ email: 'existing@example.com', password: 'password123' }),
      ).rejects.toThrow();

      expect(store.registerError).toBe('Email already in use');
      expect(store.isAuthenticated).toBe(false);
    });

    it('resets isRegistering to false after success', async () => {
      vi.mocked(authService.register).mockResolvedValue(mockUser);
      vi.mocked(authService.login).mockResolvedValue(mockTokenResponse);
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

      const store = useAuthStore();
      await store.register({ email: 'test@example.com', password: 'password123' });

      expect(store.isRegistering).toBe(false);
    });

    it('resets isRegistering to false even when registration fails', async () => {
      vi.mocked(authService.register).mockRejectedValue(new Error('Server error'));

      const store = useAuthStore();
      await store.register({ email: 'test@example.com', password: 'password123' }).catch(() => {});

      expect(store.isRegistering).toBe(false);
    });
  });

  describe('initializeSession()', () => {
    it('restores user when a valid token is in localStorage', async () => {
      localStorage.setItem('ada_inventory_access_token', 'stored-token');
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

      const store = useAuthStore();
      await store.initializeSession();

      expect(store.token).toBe('stored-token');
      expect(store.user).toEqual(mockUser);
      expect(store.initialized).toBe(true);
    });

    it('clears session when stored token is rejected by the server', async () => {
      localStorage.setItem('ada_inventory_access_token', 'expired-token');
      vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error('Unauthorized'));

      const store = useAuthStore();
      await store.initializeSession();

      expect(store.token).toBeNull();
      expect(store.user).toBeNull();
      expect(localStorage.getItem('ada_inventory_access_token')).toBeNull();
    });

    it('does nothing when no token is in localStorage', async () => {
      const store = useAuthStore();
      await store.initializeSession();

      expect(store.token).toBeNull();
      expect(store.user).toBeNull();
      expect(store.initialized).toBe(true);
      expect(authService.getCurrentUser).not.toHaveBeenCalled();
    });

    it('does not re-initialize if already initialized', async () => {
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

      const store = useAuthStore();
      store.markLoggedOut();
      await store.initializeSession();

      expect(authService.getCurrentUser).not.toHaveBeenCalled();
    });
  });

  describe('markLoggedOut()', () => {
    it('clears token, user, and localStorage', async () => {
      vi.mocked(authService.login).mockResolvedValue(mockTokenResponse);
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

      const store = useAuthStore();
      await store.login({ email: 'test@example.com', password: 'password123' });

      store.markLoggedOut();

      expect(store.token).toBeNull();
      expect(store.user).toBeNull();
      expect(store.isAuthenticated).toBe(false);
      expect(store.initialized).toBe(true);
      expect(localStorage.getItem('ada_inventory_access_token')).toBeNull();
    });
  });

  describe('forgotPassword()', () => {
    it('calls authService.forgotPassword and handles success', async () => {
      vi.mocked(authService.forgotPassword).mockResolvedValue({ message: 'Email sent' });

      const store = useAuthStore();
      await store.forgotPassword('test@example.com');

      expect(authService.forgotPassword).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(store.isRequestingReset).toBe(false);
      expect(store.resetError).toBeNull();
    });

    it('sets resetError and throws when request fails', async () => {
      vi.mocked(authService.forgotPassword).mockRejectedValue(new Error('Email not found'));

      const store = useAuthStore();
      await expect(store.forgotPassword('unknown@example.com')).rejects.toThrow('Email not found');

      expect(store.resetError).toBe('Email not found');
      expect(store.isRequestingReset).toBe(false);
    });
  });

  describe('resetPassword()', () => {
    it('calls authService.resetPassword and handles success', async () => {
      vi.mocked(authService.resetPassword).mockResolvedValue({ message: 'Password reset' });

      const store = useAuthStore();
      const payload = { token: 'token123', new_password: 'newpassword123' };
      await store.resetPassword(payload);

      expect(authService.resetPassword).toHaveBeenCalledWith(payload);
      expect(store.isResettingPassword).toBe(false);
      expect(store.resetError).toBeNull();
    });

    it('sets resetError and throws when reset fails', async () => {
      vi.mocked(authService.resetPassword).mockRejectedValue(new Error('Token expired'));

      const store = useAuthStore();
      await expect(store.resetPassword({ token: 'expired', new_password: 'new' })).rejects.toThrow(
        'Token expired',
      );

      expect(store.resetError).toBe('Token expired');
      expect(store.isResettingPassword).toBe(false);
    });
  });

  describe('fetchProfile()', () => {
    it('updates userProfile on success', async () => {
      const mockProfile = { ...mockUser, profile_image_url: 'https://test.com/img.jpg' };
      vi.mocked(authService.getProfile).mockResolvedValue(mockProfile);

      const store = useAuthStore();
      await store.fetchProfile();

      expect(store.userProfile).toEqual(mockProfile);
      expect(store.isFetchingProfile).toBe(false);
      expect(store.profileError).toBeNull();
    });

    it('sets profileError on failure', async () => {
      vi.mocked(authService.getProfile).mockRejectedValue(new Error('Fetch failed'));

      const store = useAuthStore();
      await expect(store.fetchProfile()).rejects.toThrow('Fetch failed');

      expect(store.profileError).toBe('Fetch failed');
      expect(store.isFetchingProfile).toBe(false);
    });
  });

  describe('updateProfile()', () => {
    it('updates userProfile and user on success', async () => {
      const updatedProfile = { ...mockUser, full_name: 'Updated Name' };
      vi.mocked(authService.updateProfile).mockResolvedValue(updatedProfile);

      const store = useAuthStore();
      store.user = mockUser;
      await store.updateProfile({ full_name: 'Updated Name' });

      expect(store.userProfile).toEqual(updatedProfile);
      expect(store.user).toEqual(updatedProfile);
      expect(store.isUpdatingProfile).toBe(false);
      expect(store.profileError).toBeNull();
    });

    it('sets profileError on failure', async () => {
      vi.mocked(authService.updateProfile).mockRejectedValue(new Error('Update failed'));

      const store = useAuthStore();
      await expect(store.updateProfile({ full_name: 'Fail' })).rejects.toThrow('Update failed');

      expect(store.profileError).toBe('Update failed');
      expect(store.isUpdatingProfile).toBe(false);
    });
  });
});
