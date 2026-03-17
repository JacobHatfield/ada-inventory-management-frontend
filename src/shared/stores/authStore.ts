import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import { authService } from '../services/authService';
import { setAuthTokenProvider } from '../services/apiClient';
import type { UserProfile } from '../types';

const TOKEN_STORAGE_KEY = 'ada_inventory_access_token';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null);
  const user = ref<UserProfile | null>(null);
  const initialized = ref(false);
  const isBootstrapping = ref(false);
  const authError = ref<string | null>(null);

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
    authError.value = null;
    persistToken(null);
  }

  async function restoreSessionFromToken(existingToken: string): Promise<void> {
    token.value = existingToken;

    try {
      user.value = await authService.getCurrentUser();
      authError.value = null;
    } catch (error) {
      clearSession();
      authError.value = error instanceof Error ? error.message : 'Session restore failed';
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

  function markLoggedOut(): void {
    clearSession();
    initialized.value = true;
  }

  return {
    token,
    user,
    initialized,
    isBootstrapping,
    authError,
    isAuthenticated,
    setToken,
    clearSession,
    initializeSession,
    markLoggedOut,
  };
});
