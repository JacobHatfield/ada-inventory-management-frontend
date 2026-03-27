/* eslint-disable vue/no-deprecated-props-default-this */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useNotificationStore } from '@/shared/stores/notificationStore';

describe('Notification Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  it('should add a notification', () => {
    const store = useNotificationStore();
    store.notify('Test message', 'success');

    expect(store.notifications).toHaveLength(1);
    expect(store.notifications[0].message).toBe('Test message');
    expect(store.notifications[0].type).toBe('success');
  });

  it('should remove a notification by id', () => {
    const store = useNotificationStore();
    const id = store.notify('To be removed');
    store.remove(id);

    expect(store.notifications).toHaveLength(0);
  });

  it('should automatically remove notification after duration', () => {
    const store = useNotificationStore();
    store.notify('Temp message', 'info', 3000);

    expect(store.notifications).toHaveLength(1);

    vi.advanceTimersByTime(3000);
    expect(store.notifications).toHaveLength(0);
  });

  it('should provide helper methods for types', () => {
    const store = useNotificationStore();
    store.success('Success!');
    store.error('Error!');
    store.info('Info!');
    store.warning('Warning!');

    expect(store.notifications).toHaveLength(4);
    expect(store.notifications[0].type).toBe('success');
    expect(store.notifications[1].type).toBe('error');
    expect(store.notifications[2].type).toBe('info');
    expect(store.notifications[3].type).toBe('warning');
  });

  describe('handleEmailError', () => {
    it('should categorize 503 errors as warnings with longer duration', () => {
      const store = useNotificationStore();
      const error = new Error('Request failed with status 503');

      store.handleEmailError(error);

      expect(store.notifications).toHaveLength(1);
      expect(store.notifications[0].type).toBe('warning');
      expect(store.notifications[0].message).toContain('busy');
      expect(store.notifications[0].duration).toBe(10000);
    });

    it('should categorize other errors as basic errors', () => {
      const store = useNotificationStore();
      const error = new Error('Unknown connection issue');

      store.handleEmailError(error);

      expect(store.notifications).toHaveLength(1);
      expect(store.notifications[0].type).toBe('error');
      expect(store.notifications[0].message).toContain('Email action failed');
    });
  });
});
