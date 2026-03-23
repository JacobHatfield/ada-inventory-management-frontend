<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 backdrop-blur-sm p-4"
    @click.self="close"
  >
    <div
      class="relative w-full max-w-4xl rounded-xl bg-white shadow-2xl transition-all"
      role="dialog"
      aria-modal="true"
    >
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h3 class="text-lg font-semibold text-slate-900">Audit History</h3>
          <p class="text-sm text-slate-500">History for {{ itemName || 'this item' }}</p>
        </div>
        <button
          class="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          @click="close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="px-6 py-6">
        <div v-if="store.isFetchingHistory" class="flex flex-col items-center justify-center py-12">
          <div
            class="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"
          ></div>
          <p class="mt-4 text-sm text-slate-500">Loading history...</p>
        </div>

        <div v-else-if="store.auditError" class="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {{ store.auditError }}
        </div>

        <div v-else-if="store.auditHistory.length === 0" class="text-center py-12">
          <p class="text-slate-500">No history found for this item.</p>
        </div>

        <div v-else class="overflow-hidden rounded-lg border border-slate-200">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Date
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Action
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Details
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Change
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-white">
              <tr v-for="log in store.auditHistory" :key="log.id" class="hover:bg-slate-50 transition">
                <td class="whitespace-nowrap px-4 py-3 text-xs text-slate-600">
                  {{ formatDateTime(log.timestamp) }}
                </td>
                <td class="whitespace-nowrap px-4 py-3">
                  <span
                    class="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium"
                    :class="getActionClass(log.action)"
                  >
                    {{ formatAction(log.action) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-xs text-slate-700">
                  <span v-if="log.field_name" class="font-medium text-slate-900">
                    {{ formatFieldName(log.field_name) }}
                  </span>
                  <span v-else class="text-slate-400">—</span>
                </td>
                <td class="px-4 py-3 text-xs">
                  <div v-if="log.old_value !== null || log.new_value !== null" class="flex items-center gap-2">
                    <span class="text-slate-500 line-through">{{ log.old_value ?? 'None' }}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-3 w-3 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                    <span class="font-medium text-emerald-600">{{ log.new_value ?? 'None' }}</span>
                  </div>
                  <span v-else class="text-slate-400">—</span>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <AppPagination
            v-if="store.auditPaginationMeta && store.auditPaginationMeta.total_pages > 1"
            :current-page="store.auditPaginationMeta.page"
            :total-pages="store.auditPaginationMeta.total_pages"
            :total-items="store.auditPaginationMeta.total_items"
            :page-size="store.auditPaginationMeta.page_size"
            @update:page="handlePageChange"
          />
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-end border-t border-slate-100 px-6 py-4">
        <button
          class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 transition"
          @click="close"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useInventoryStore } from '../inventoryStore';
import AppPagination from '@/shared/components/AppPagination.vue';

const props = defineProps<{
  isOpen: boolean;
  itemId: number | null;
  itemName?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = useInventoryStore();

// Fetch history when modal opens or item changes
watch(
  () => [props.isOpen, props.itemId],
  ([isOpen, itemId]) => {
    if (isOpen && itemId) {
      store.fetchAuditHistory(itemId as number, { page: 1, page_size: 10 });
    }
  },
);

const close = () => {
  emit('close');
};

const handlePageChange = (page: number) => {
  if (props.itemId) {
    store.fetchAuditHistory(props.itemId, { page, page_size: 10 });
  }
};

const formatDateTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const formatAction = (action: string) => {
  return action.charAt(0).toUpperCase() + action.slice(1).replace('_', ' ');
};

const formatFieldName = (field: string) => {
  return field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ');
};

const getActionClass = (action: string) => {
  switch (action.toLowerCase()) {
    case 'create':
      return 'bg-emerald-100 text-emerald-700';
    case 'update':
      return 'bg-blue-100 text-blue-700';
    case 'delete':
      return 'bg-red-100 text-red-700';
    case 'stock_adjustment':
    case 'increment':
    case 'decrement':
      return 'bg-amber-100 text-amber-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};
</script>
