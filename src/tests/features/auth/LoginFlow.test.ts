import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory, type Router } from 'vue-router';
import LoginPage from '@/features/auth/LoginPage.vue';
import { useAuthStore } from '@/shared/stores/authStore';

describe('LoginFlow', () => {
  let router: Router;

  beforeEach(async () => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/login', name: 'login', component: { render: () => null } },
        { path: '/', name: 'dashboard', component: { render: () => null } },
        { path: '/inventory', name: 'inventory', component: { render: () => null } },
      ],
    });
    await router.push('/login');
  });

  it('successful login redirects to dashboard', async () => {
    const authStore = useAuthStore();
    const loginSpy = vi.spyOn(authStore, 'login').mockResolvedValue();
    const routerPushSpy = vi.spyOn(router, 'push');
    
    const wrapper = mount(LoginPage, {
      global: {
        plugins: [router],
        stubs: {
          RouterLink: true,
        }
      }
    });

    await wrapper.find('#email').setValue('test@example.com');
    await wrapper.find('#password').setValue('password123');
    await flushPromises();
    
    await wrapper.find('form').trigger('submit');
    await flushPromises();
    await new Promise(resolve => setTimeout(resolve, 200));

    expect(loginSpy).toHaveBeenCalled();
    expect(routerPushSpy).toHaveBeenCalled();
  });

  it('failed login displays error message', async () => {
    const authStore = useAuthStore();
    authStore.loginError = 'Auth failed';
    
    const wrapper = mount(LoginPage, {
      global: {
        plugins: [router],
        stubs: { RouterLink: true }
      }
    });
    
    expect(wrapper.text()).toContain('Auth failed');
  });
});
