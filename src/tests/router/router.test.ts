import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import router from '@/router';
import { useAuthStore } from '@/shared/stores/authStore';
import { useRouteUiStore } from '@/shared/stores/routeUiStore';

// We need to provide a mock for any components that the router might try to load
vi.mock('@/app/pages/DashboardPage.vue', () => ({ default: { template: '<div>Dashboard</div>' } }));
vi.mock('@/features/auth/LoginPage.vue', () => ({ default: { template: '<div>Login</div>' } }));

describe('router guards', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('redirects to login if route requiresAuth and user is not authenticated', async () => {
    const authStore = useAuthStore();
    authStore.token = null; // Unauthenticated

    await router.push('/'); // Dashboard requiresAuth
    expect(router.currentRoute.value.name).toBe('login');
    expect(router.currentRoute.value.query.redirect).toBe('/');
  });

  it('redirects to dashboard if route is guestOnly and user is authenticated', async () => {
    const authStore = useAuthStore();
    authStore.token = 'valid-token';
    authStore.user = { id: 1 } as any;

    await router.push('/login');
    expect(router.currentRoute.value.name).toBe('dashboard');
  });

  it('allows access to requiresAuth route if user is authenticated', async () => {
    const authStore = useAuthStore();
    authStore.token = 'valid-token';
    authStore.user = { id: 1 } as any;

    await router.push('/inventory');
    expect(router.currentRoute.value.name).toBe('inventory');
  });

  it('triggers routeUiStore start/finish during navigation', async () => {
    const routeUi = useRouteUiStore();
    const startSpy = vi.spyOn(routeUi, 'startNavigation');
    const finishSpy = vi.spyOn(routeUi, 'finishNavigation');

    await router.push('/login');
    expect(startSpy).toHaveBeenCalled();
    expect(finishSpy).toHaveBeenCalled();
  });
});
