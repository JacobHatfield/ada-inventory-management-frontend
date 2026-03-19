import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import { authService } from '../services/authService';
import { setAuthTokenProvider } from '../services/apiClient';
import type { LoginRequest, RegisterRequest, UserProfile } from '../types';

const TOKEN_STORAGE_KEY = 'ada_inventory_access_token';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null);
  const user = ref<UserProfile | null>(null);
  const initialized = ref(false);
  const isBootstrapping = ref(false);

  // Per-action loading flags
  const isLoggingIn = ref(false);
  const isRegistering = ref(false);

  // Per-action error state
  const loginError = ref<string | null>(null);
  const registerError = ref<string | null>(null);

  setAuthTokenProvider(() => token.value);

  const isAuthenticated = computed(() => Boolean(token.value && user.value));

  function loadTokenFromStorage(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  function persistToken(nextToken: string | null): void {
    if (typeof window === 'undefined') {
      return;
    }

    if (nextToken) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
      return;
    }

    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  function setToken(nextToken: string | null): void {
    token.value = nextToken;
    persistToken(nextToken);
  }

  function clearSession(): void {
    token.value = null;
    user.value = null;
    loginError.value = null;
    registerError.value = null;
    persistToken(null);
  }

  async function restoreSessionFromToken(existingToken: string): Promise<void> {
    token.value = existingToken;

    try {
      user.value = await authService.getCurrentUser();
    } catch {
      clearSession();
    }
  }

  async function initializeSession(): Promise<void> {
    if (initialized.value || isBootstrapping.value) {
      return;
    }

    isBootstrapping.value = true;

    try {
      const storedToken = loadTokenFromStorage();
      if (!storedToken) {
        initialized.value = true;
        return;
      }

      await restoreSessionFromToken(storedToken);
      initialized.value = true;
    } finally {
      isBootstrapping.value = false;
    }
  }

  async function login(payload: LoginRequest): Promise<void> {
    isLoggingIn.value = true;
    loginError.value = null;

    try {
      const tokenResponse = await authService.login(payload);
      setToken(tokenResponse.access_token);
      user.value = await authService.getCurrentUser();
      initialized.value = true;
    } catch (error) {
      loginError.value = error instanceof Error ? error.message : 'Login failed';
      throw error;
    } finally {
      isLoggingIn.value = false;
    }
  }

  async function register(payload: RegisterRequest): Promise<void> {
    isRegistering.value = true;
    registerError.value = null;

    try {
      await authService.register(payload);
      // Auto-login after successful registration
      await login({ email: payload.email, password: payload.password });
    } catch (error) {
      // Only set registerError if the failure was in registration, not the auto-login
      if (!loginError.value) {
        registerError.value = error instanceof Error ? error.message : 'Registration failed';
      }
      throw error;
    } finally {
      isRegistering.value = false;
    }
  }

  function markLoggedOut(): void {
    clearSession();
    initialized.value = true;
  }

  return {
    token,
    user,
    initialized,
    isBootstrapping,
    isLoggingIn,
    isRegistering,
    loginError,
    registerError,
    isAuthenticated,
    setToken,
    clearSession,
    initializeSession,
    login,
    register,
    markLoggedOut,
  };
});
