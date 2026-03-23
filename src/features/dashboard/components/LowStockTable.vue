<template>
  <div class="rounded-xl border border-slate-200 bg-white shadow-sm">
    <div class="border-b border-slate-200 px-6 py-4 flex justify-between items-center">
      <h3 class="text-lg font-semibold text-slate-900">Items Requiring Attention</h3>
      <RouterLink
        :to="{ name: 'inventory', query: { stock_status: 'low_stock' } }"
        class="text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        View all low stock
      </RouterLink>
    </div>

    <div v-if="loading" class="p-6 text-center text-slate-500">Loading low stock items...</div>

    <div v-else-if="items.length === 0" class="p-6 text-center text-slate-500">
      <svg
        class="mx-auto h-12 w-12 text-slate-300"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p class="mt-2 text-sm font-medium">All stock levels are healthy!</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-left text-sm text-slate-600">
        <thead class="bg-slate-50 text-xs text-slate-500 uppercase">
          <tr>
            <th class="px-6 py-3 font-medium">Item Name</th>
            <th class="px-6 py-3 font-medium">Category</th>
            <th class="px-6 py-3 font-medium text-right">Current Stock</th>
            <th class="px-6 py-3 font-medium text-right">Threshold</th>
            <th class="px-6 py-3 font-medium text-right">Status</th>
            <th class="px-6 py-3 font-medium text-right">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr v-for="item in displayItems" :key="item.id" class="transition hover:bg-slate-50">
            <td class="px-6 py-4 font-medium text-slate-900">{{ item.name }}</td>
            <td class="px-6 py-4">{{ item.category?.name || 'Uncategorized' }}</td>
            <td
              class="px-6 py-4 text-right font-medium"
              :class="item.quantity === 0 ? 'text-red-600' : 'text-amber-600'"
            >
              {{ item.quantity }}
            </td>
            <td class="px-6 py-4 text-right">{{ item.low_stock_threshold || 0 }}</td>
            <td class="px-6 py-4 text-right">
              <span
                v-if="item.quantity === 0"
                class="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10"
                >Out of Stock</span
              >
              <span
                v-else
                class="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/10"
                >Low Stock</span
              >
            </td>
            <td class="px-6 py-4 text-right">
              <RouterLink
                :to="{ name: 'inventory-detail', params: { id: item.id } }"
                class="font-medium text-blue-600 hover:text-blue-900"
              >
                Manage
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { InventoryItem } from '@/shared/types/inventory';

const props = defineProps<{
  items: InventoryItem[];
  loading: boolean;
  limit?: number;
}>();

const displayItems = computed(() => {
  if (!props.items) return [];
  // Sort out of stock to the top
  const sorted = [...props.items].sort((a, b) => a.quantity - b.quantity);
  return props.limit ? sorted.slice(0, props.limit) : sorted;
});
</script>
