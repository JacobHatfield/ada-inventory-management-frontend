<template>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p class="mt-1 text-sm text-slate-500">Real-time summary of your inventory.</p>
      </div>
      <div class="flex gap-3">
        <RouterLink
          :to="{ name: 'inventory-create' }"
          class="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          <svg class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Item
        </RouterLink>
      </div>
    </header>

    <div v-if="dashboardStore.error" class="rounded-md bg-red-50 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error loading dashboard</h3>
          <div class="mt-2 text-sm text-red-700">
            <p>{{ dashboardStore.error }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Cards Row -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricsCard
        title="Total Items"
        :value="dashboardStore.summary?.total_items ?? 0"
        colorTheme="blue"
      >
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </template>
      </MetricsCard>
      
      <MetricsCard
        title="Healthy Stock"
        :value="dashboardStore.summary?.healthy_stock ?? 0"
        colorTheme="emerald"
      >
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </template>
      </MetricsCard>

      <MetricsCard
        title="Low Stock"
        :value="dashboardStore.summary?.low_stock ?? 0"
        colorTheme="amber"
      >
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </template>
      </MetricsCard>

      <MetricsCard
        title="Out of Stock"
        :value="dashboardStore.summary?.out_of_stock ?? 0"
        colorTheme="red"
      >
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
import { onMounted } from 'vue';
import { useDashboardStore } from '@/features/dashboard/dashboardStore';
import MetricsCard from '@/features/dashboard/components/MetricsCard.vue';
import LowStockTable from '@/features/dashboard/components/LowStockTable.vue';

const dashboardStore = useDashboardStore();

onMounted(async () => {
  // Fetch summary and low stock items in parallel
  await Promise.all([
    dashboardStore.fetchSummary(),
    dashboardStore.fetchLowStockItems()
  ]);
});
</script>
