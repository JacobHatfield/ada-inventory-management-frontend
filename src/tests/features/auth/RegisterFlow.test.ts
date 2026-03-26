import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory, type Router } from 'vue-router';
import RegisterPage from '@/features/auth/RegisterPage.vue';
import { useAuthStore } from '@/shared/stores/authStore';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('RegisterFlow.test.ts', () => {
  let router: Router;

  beforeEach(async () => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/register', name: 'register', component: { template: '<div>R</div>' } },
        { path: '/', name: 'dashboard', component: { template: '<div>D</div>' } },
        { path: '/inventory', name: 'inventory', component: { template: '<div>I</div>' } },
      ],
    });
    await router.push('/register');
  });

  it('shows validation error if passwords do not match', async () => {
    const wrapper = mount(RegisterPage, {
      shallow: true,
      global: { plugins: [router] },
    });

    await wrapper.find('input#email').setValue('reg@example.com');
    await wrapper.find('input#password').setValue('password123');
    await wrapper.find('input#confirm_password').setValue('mismatch');

    await wrapper.find('form').trigger('submit');
    await flushPromises();
    await delay(100);

    expect(wrapper.text().toLowerCase()).toContain('match');
  });

  it('successful registration calls authStore.register', async () => {
    const authStore = useAuthStore();
    const registerSpy = vi.spyOn(authStore, 'register').mockResolvedValue();
    const wrapper = mount(RegisterPage, {
      shallow: true,
      global: { plugins: [router] },
    });

    await wrapper.find('input#email').setValue('reg@test.com');
    await wrapper.find('input#password').setValue('password123');
    await wrapper.find('input#confirm_password').setValue('password123');
    await flushPromises();

    await wrapper.find('form').trigger('submit');
    await flushPromises();
    await delay(100);

    expect(registerSpy).toHaveBeenCalled();
  });
});
