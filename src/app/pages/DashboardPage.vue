<template>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p class="mt-1 text-sm text-slate-500">Real-time summary of your inventory.</p>
      </div>
      <div class="flex gap-3">
        <button
          :disabled="isTriggering"
          class="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
          @click="triggerAlerts"
        >
          <svg
            v-if="isTriggering"
            class="mr-2 h-4 w-4 animate-spin text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <svg v-else class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {{ isTriggering ? 'Checking...' : 'Check alerts' }}
        </button>
        <RouterLink
          :to="{ name: 'inventory-create' }"
          class="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          <svg class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Item
        </RouterLink>
      </div>
    </header>

    <!-- Error Banner -->
    <div v-if="dashboardStore.error || alertError" class="rounded-md bg-red-50 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">
            {{ alertError ? 'Alert check failed' : 'Error loading dashboard' }}
          </h3>
          <div class="mt-2 text-sm text-red-700">
            <p v-if="isEmailServiceError" class="font-semibold text-red-800">
              <svg
                class="h-4 w-4 inline mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              The email service is currently overwhelmed.
            </p>
            <p>{{ alertError || dashboardStore.error }}</p>
          </div>
          <p v-if="isEmailServiceError" class="mt-2 text-xs text-red-600">
            Wait 5 minutes before trying again.
          </p>
        </div>
      </div>
    </div>

    <!-- Alert Check Feedback -->
    <div
      v-if="lastCheckResult"
      class="rounded-xl border border-slate-200 bg-white px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div>
          <p class="text-sm font-medium text-slate-900">Alert check complete</p>
          <p class="text-xs text-slate-500">Run at {{ formatDate(lastCheckResult.timestamp) }}</p>
        </div>
      </div>
      <div class="flex flex-wrap gap-2">
        <span
          class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
          :class="
            lastCheckResult.low_stock_sent
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-slate-100 text-slate-700'
          "
        >
          {{ lastCheckResult.low_stock_count }}
          {{ lastCheckResult.low_stock_sent ? 'low stock sent' : 'low stock found' }}
        </span>
        <span
          class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
          :class="
            lastCheckResult.critical_stock_sent
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-slate-100 text-slate-700'
          "
        >
          {{ lastCheckResult.critical_stock_count }}
          {{ lastCheckResult.critical_stock_sent ? 'critical sent' : 'critical found' }}
        </span>
      </div>
    </div>

    <!-- Cards Row -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricsCard
        title="Total Items"
        :value="dashboardStore.summary?.total_items ?? 0"
        color-theme="blue"
      >
        <template #icon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </template>
      </MetricsCard>

      <MetricsCard
        title="Healthy Stock"
        :value="dashboardStore.summary?.healthy_stock ?? 0"
        color-theme="emerald"
      >
        <template #icon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </template>
      </MetricsCard>

      <MetricsCard
        title="Low Stock"
        :value="dashboardStore.summary?.low_stock ?? 0"
        color-theme="amber"
      >
        <template #icon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </template>
      </MetricsCard>

      <MetricsCard
        title="Out of Stock"
        :value="dashboardStore.summary?.out_of_stock ?? 0"
        color-theme="red"
      >
        <template #icon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </template>
      </MetricsCard>
    </div>

    <!-- Alert Table -->
    <LowStockTable
      :items="dashboardStore.lowStockItems"
      :loading="dashboardStore.isLoadingLowStock"
      :limit="5"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useDashboardStore } from '@/features/dashboard/dashboardStore';
import { alertService } from '@/shared/services/alertService';
import { useNotificationStore } from '@/shared/stores/notificationStore';
import MetricsCard from '@/features/dashboard/components/MetricsCard.vue';
import LowStockTable from '@/features/dashboard/components/LowStockTable.vue';

const dashboardStore = useDashboardStore();
const notificationStore = useNotificationStore();
const isTriggering = ref(false);
const alertError = ref<string | null>(null);
const lastCheckResult = ref<{
  low_stock_count: number;
  critical_stock_count: number;
  low_stock_sent: boolean;
  critical_stock_sent: boolean;
  timestamp: string;
} | null>(null);

const isEmailServiceError = computed(() => {
  return (
    alertError.value?.includes('Email service is temporarily unavailable') ||
    alertError.value?.includes('503')
  );
});

const triggerAlerts = async () => {
  isTriggering.value = true;
  alertError.value = null;
  try {
    const result = await alertService.triggerManualAlertCheck();
    if (result.success) {
      lastCheckResult.value = {
        low_stock_count: result.low_stock_count,
        critical_stock_count: result.critical_stock_count,
        low_stock_sent: result.low_stock_sent,
        critical_stock_sent: result.critical_stock_sent,
        timestamp: new Date().toISOString(),
      };

      const totalSent = (result.low_stock_sent ? 1 : 0) + (result.critical_stock_sent ? 1 : 0);
      if (totalSent > 0) {
        notificationStore.success('Low stock alert emails have been dispatched.');
      } else if (result.low_stock_count > 0 || result.critical_stock_count > 0) {
        notificationStore.info(
          'Low stock detected, but emails were skipped (likely already sent recently).',
        );
      } else {
        notificationStore.info('All good! No items currently require low stock alerts.');
      }
    }
  } catch (error) {
    alertError.value = error instanceof Error ? error.message : 'Failed to trigger alert check';
    notificationStore.handleEmailError(error);
  } finally {
    isTriggering.value = false;
  }
};

const formatDate = (iso: string): string => {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(async () => {
  // Fetch summary and low stock items in parallel
  await Promise.all([dashboardStore.fetchSummary(), dashboardStore.fetchLowStockItems()]);
});
</script>
