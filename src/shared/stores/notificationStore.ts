import { defineStore } from 'pinia';
import { ref } from 'vue';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([]);

  const notify = (message: string, type: NotificationType = 'info', duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 11);
    const notification: Notification = { id, message, type, duration };
    
    notifications.value.push(notification);

    if (duration > 0) {
      setTimeout(() => {
        remove(id);
      }, duration);
    }
    
    return id;
  };

  const remove = (id: string) => {
    const index = notifications.value.findIndex((n) => n.id === id);
    if (index !== -1) {
      notifications.value.splice(index, 1);
    }
  };

  const success = (message: string, duration?: number) => notify(message, 'success', duration);
  const error = (message: string, duration?: number) => notify(message, 'error', duration);
  const info = (message: string, duration?: number) => notify(message, 'info', duration);
  const warning = (message: string, duration?: number) => notify(message, 'warning', duration);

  return {
    notifications,
    notify,
    remove,
    success,
    error,
    info,
    warning,
  };
});
