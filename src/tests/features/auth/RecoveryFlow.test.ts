import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory, type Router } from 'vue-router';
import ForgotPasswordPage from '@/features/auth/ForgotPasswordPage.vue';
import ResetPasswordPage from '@/features/auth/ResetPasswordPage.vue';
import { useAuthStore } from '@/shared/stores/authStore';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('RecoveryFlow.test.ts', () => {
  let router: Router;

  beforeEach(async () => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/forgot-password',
          name: 'forgot-password',
          component: { template: '<div>F</div>' },
        },
        {
          path: '/reset-password',
          name: 'reset-password',
          component: { template: '<div>R</div>' },
        },
        { path: '/login', name: 'login', component: { template: '<div>L</div>' } },
        { path: '/inventory', name: 'inventory', component: { template: '<div>I</div>' } },
      ],
    });
  });

  it('ForgotPasswordPage shows success state after submission', async () => {
    const authStore = useAuthStore();
    vi.spyOn(authStore, 'forgotPassword').mockResolvedValue();

    const wrapper = mount(ForgotPasswordPage, {
      shallow: true,
      global: { plugins: [router] },
    });

    await wrapper.find('input#email').setValue('forgot@example.com');
    await flushPromises();

    await wrapper.find('form').trigger('submit');
    await flushPromises();
    // Use slightly longer delay for Node v24 stability
    await delay(150);

    // After success, it shows a success message
    expect(wrapper.text().toLowerCase()).toContain('email');
  });

  it('ResetPasswordPage calls authStore.resetPassword on success', async () => {
    const authStore = useAuthStore();
    const resetSpy = vi.spyOn(authStore, 'resetPassword').mockResolvedValue();

    // Manual push without isReady to avoid hangs
    await router.push('/reset-password?token=ValidToken');

    const wrapper = mount(ResetPasswordPage, {
      shallow: true,
      global: { plugins: [router] },
    });

    await flushPromises();
    await delay(50); // Settlement buffer

    await wrapper.find('input#new_password').setValue('newpassword123');
    await wrapper.find('input#confirm_password').setValue('newpassword123');
    await flushPromises();

    await wrapper.find('form').trigger('submit');
    await flushPromises();
    await delay(150);

    expect(resetSpy).toHaveBeenCalled();
  });
});
