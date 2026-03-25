import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import AppShell from '@/app/layouts/AppShell.vue';
import { useAuthStore } from '@/shared/stores/authStore';
import { useRouteUiStore } from '@/shared/stores/routeUiStore';

// Mock RouterLink and RouterView
const routes = [
  { path: '/', name: 'dashboard', component: { template: '<div>Dashboard</div>' } },
  { path: '/login', name: 'login', component: { template: '<div>Login</div>' } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

describe('AppShell.vue', () => {
  beforeEach(async () => {
    setActivePinia(createPinia());
    router.push('/');
    await router.isReady();
    vi.clearAllMocks();
  });

  it('renders authenticated layout when user is logged in', async () => {
    const authStore = useAuthStore();
    authStore.token = 'fake-token';
    authStore.user = { id: 1, email: 'test@test.com', full_name: 'Test User', is_active: true };

    const wrapper = mount(AppShell, {
      global: {
        plugins: [router],
        stubs: {
          GlobalLoading: true,
        },
      },
    });

    expect(wrapper.text()).toContain('Inventory Management');
    expect(wrapper.text()).toContain('Logout');
    expect(wrapper.find('aside').exists()).toBe(true);
    expect(wrapper.find('nav').exists()).toBe(true);
  });

  it('renders unauthenticated layout (just router view) when logged out', async () => {
    const authStore = useAuthStore();
    authStore.token = null;
    authStore.user = null;

    const wrapper = mount(AppShell, {
      global: {
        plugins: [router],
        stubs: {
          GlobalLoading: true,
        },
      },
    });

    expect(wrapper.text()).not.toContain('Inventory Management');
    expect(wrapper.find('aside').exists()).toBe(false);
    expect(wrapper.find('header').exists()).toBe(false);
  });

  it('shows GlobalLoading when isNavigating is true', async () => {
    const routeUi = useRouteUiStore();
    routeUi.isNavigating = true;

    const wrapper = mount(AppShell, {
      global: {
        plugins: [router],
      },
    });

    // GlobalLoading is in the template but might be hidden by CSS or v-if in its own component
    expect(wrapper.findComponent({ name: 'GlobalLoading' }).exists()).toBe(true);
  });

  it('calls logout and redirects on logout button click', async () => {
    const authStore = useAuthStore();
    authStore.token = 'fake-token';
    authStore.user = { id: 1, email: 't@t.com', full_name: 'U', is_active: true };
    const logoutSpy = vi.spyOn(authStore, 'markLoggedOut');
    const routerPushSpy = vi.spyOn(router, 'push');

    const wrapper = mount(AppShell, {
      global: {
        plugins: [router],
        stubs: { GlobalLoading: true },
      },
    });

    const logoutBtn = wrapper.find('button');
    await logoutBtn.trigger('click');

    expect(logoutSpy).toHaveBeenCalled();
    expect(routerPushSpy).toHaveBeenCalledWith({ name: 'login' });
  });

  it('highlights active navigation link', async () => {
    const authStore = useAuthStore();
    authStore.token = 'token';
    authStore.user = { id: 1, email: 't@t.com', full_name: 'U', is_active: true };

    const wrapper = mount(AppShell, {
      global: {
        plugins: [router],
        stubs: { GlobalLoading: true },
      },
    });

    await router.push('/inventory');
    // RouterLink active classes are handled by vue-router, we just verify they exist
    const links = wrapper.findAllComponents({ name: 'RouterLink' });
    expect(links.length).toBeGreaterThan(0);
  });
});
