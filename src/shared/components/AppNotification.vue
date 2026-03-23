<template>
  <Teleport to="body">
    <div
      class="fixed right-4 top-4 z-[9999] flex flex-col gap-3 pointer-events-none sm:top-6 sm:right-6"
    >
      <TransitionGroup
        enter-active-class="transform ease-out duration-300 transition"
        enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-4"
        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-for="notification in store.notifications"
          :key="notification.id"
          class="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-white p-4 shadow-xl ring-1 ring-black/5"
          :class="getTypeStyles(notification.type)"
        >
          <!-- Icon -->
          <div class="flex-shrink-0">
            <template v-if="notification.type === 'success'">
              <svg
                class="h-5 w-5 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </template>
            <template v-else-if="notification.type === 'error'">
              <svg
                class="h-5 w-5 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </template>
            <template v-else-if="notification.type === 'warning'">
              <svg
                class="h-5 w-5 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </template>
            <template v-else>
              <svg
                class="h-5 w-5 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </template>
          </div>

          <!-- Message -->
          <div class="flex-1 pt-0.5">
            <p class="text-sm font-medium text-slate-900">
              {{ notification.message }}
            </p>
          </div>

          <!-- Close button -->
          <button
            class="flex-shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-500 transition-colors"
            @click="store.remove(notification.id)"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useNotificationStore } from '../stores/notificationStore';

const store = useNotificationStore();

const getTypeStyles = (type: string) => {
  switch (type) {
    case 'success':
      return 'border-emerald-100 bg-emerald-50/50';
    case 'error':
      return 'border-red-100 bg-red-50/50';
    case 'warning':
      return 'border-amber-100 bg-amber-50/50';
    default:
      return 'border-slate-100 bg-white';
  }
};
</script>
