import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory, type Router } from 'vue-router';
import AppShell from '@/app/layouts/AppShell.vue';
import { useAuthStore } from '@/shared/stores/authStore';
import { useRouteUiStore } from '@/shared/stores/routeUiStore';

describe('AppShell.vue', () => {
  let router: Router;

  beforeEach(async () => {
    setActivePinia(createPinia());

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'dashboard', component: { template: '<div>D</div>' } },
        { path: '/login', name: 'login', component: { template: '<div>L</div>' } },
        { path: '/inventory', name: 'inventory', component: { template: '<div>I</div>' } },
        { path: '/categories', name: 'categories', component: { template: '<div>C</div>' } },
        { path: '/profile', name: 'profile', component: { template: '<div>P</div>' } },
      ],
    });

    await router.push('/');
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
    const links = wrapper.findAllComponents({ name: 'RouterLink' });
    expect(links.length).toBeGreaterThan(0);
  });
});
