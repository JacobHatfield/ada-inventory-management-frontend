import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory, type Router } from 'vue-router';
import { useAuthStore } from '@/shared/stores/authStore';
import { routes, setupRouterGuards } from '@/router/index';

describe('App Router Guards', () => {
  let router: Router;

  beforeEach(async () => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    // Create a real router but with memory history
    router = createRouter({
      history: createMemoryHistory(),
      routes,
    });
    setupRouterGuards(router);
  });

  it('redirects to login if route requires auth and user is not logged in', async () => {
    const authStore = useAuthStore();
    authStore.token = null;
    authStore.user = null;

    // Use a route that requires auth
    router.push('/inventory');
    await router.isReady();

    expect(router.currentRoute.value.path).toBe('/login');
  });

  it('allows access to login if user is not logged in', async () => {
    router.push('/login');
    await router.isReady();
    expect(router.currentRoute.value.path).toBe('/login');
  });

  it('allows access to inventory if user is logged in', async () => {
    const authStore = useAuthStore();
    authStore.token = 'fake-token';
    authStore.user = { id: 1, email: 't@t.com', full_name: 'U', is_active: true };

    router.push('/inventory');
    await router.isReady();

    expect(router.currentRoute.value.path).toBe('/inventory');
  });

  it('redirects to inventory if user is logged in and tries to access login', async () => {
    const authStore = useAuthStore();
    authStore.token = 'fake-token';
    authStore.user = { id: 1, email: 't@t.com', full_name: 'U', is_active: true };
    authStore.initialized = true;

    await router.push('/login');

    expect(router.currentRoute.value.path).toBe('/inventory');
  });

  it('waits for session initialization before redirecting guestOnly routes', async () => {
    const authStore = useAuthStore();
    authStore.initialized = false;

    // Mock initializeSession to take some time and then set authenticated state
    vi.spyOn(authStore, 'initializeSession').mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      authStore.token = 'fake-token';
      authStore.user = { id: 1, email: 't@t.com', full_name: 'U', is_active: true };
      authStore.initialized = true;
    });

    // Start navigation to a guestOnly route
    await router.push('/login');

    expect(router.currentRoute.value.path).toBe('/inventory');
  });
});
