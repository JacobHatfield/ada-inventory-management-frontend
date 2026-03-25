import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory, type Router } from 'vue-router';
import ProfilePage from '@/features/auth/ProfilePage.vue';
import { useAuthStore } from '@/shared/stores/authStore';
import { useNotificationStore } from '@/shared/stores/notificationStore';
import { authService } from '@/shared/services/authService';

vi.mock('@/shared/services/authService', () => ({
  authService: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
  }
}));

describe('ProfilePage.test.ts', () => {
  let router: Router;

  beforeEach(async () => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/profile', name: 'profile', component: ProfilePage },
      ],
    });
    
    await router.push('/profile');
    await router.isReady();
  });

  it('fetches profile and populates form on mount', async () => {
    const authStore = useAuthStore();
    const mockProfile = {
      id: 1,
      full_name: 'John Doe',
      email: 'john@example.com',
      profile_image_url: 'https://example.com/john.jpg',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };
    
    vi.mocked(authService.getProfile).mockResolvedValue(mockProfile);

    const wrapper = mount(ProfilePage, {
      global: { plugins: [router] }
    });

    await flushPromises();
    // Wait for vee-validate
    await new Promise(resolve => setTimeout(resolve, 50));

    expect((wrapper.find('#full_name').element as HTMLInputElement).value).toBe('John Doe');
    expect((wrapper.find('#email').element as HTMLInputElement).value).toBe('john@example.com');
  });

  it('successful update shows notification', async () => {
    const notificationStore = useNotificationStore();
    const successSpy = vi.spyOn(notificationStore, 'success');
    
    vi.mocked(authService.getProfile).mockResolvedValue({ id: 1, full_name: 'John Doe', email: 'john@example.com', is_active: true } as any);
    vi.mocked(authService.updateProfile).mockResolvedValue({ id: 1, full_name: 'John Doe', email: 'john@example.com', is_active: true } as any);

    const wrapper = mount(ProfilePage, {
      global: { plugins: [router] }
    });

    await flushPromises();
    await wrapper.find('form').trigger('submit');
    await flushPromises();
    await new Promise(resolve => setTimeout(resolve, 150));

    expect(authService.updateProfile).toHaveBeenCalled();
    expect(successSpy).toHaveBeenCalled();
  });
});
