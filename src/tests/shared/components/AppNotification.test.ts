import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import AppNotification from '@/shared/components/AppNotification.vue';
import { useNotificationStore } from '@/shared/stores/notificationStore';

describe('AppNotification.vue', () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  it('renders notifications from the store', async () => {
    const store = useNotificationStore();
    store.success('Success message');

    const wrapper = mount(AppNotification, {
      global: {
        plugins: [pinia],
        stubs: {
          Teleport: true,
          TransitionGroup: true,
        },
      },
    });

    expect(wrapper.text()).toContain('Success message');
  });

  it('removes a notification when close button is clicked', async () => {
    const store = useNotificationStore();
    const id = store.notify('Test notification');

    const wrapper = mount(AppNotification, {
      global: {
        plugins: [pinia],
        stubs: {
          Teleport: true,
          TransitionGroup: true,
        },
      },
    });

    const closeBtn = wrapper.find('button');
    await closeBtn.trigger('click');

    expect(store.notifications).toHaveLength(0);
  });
});
