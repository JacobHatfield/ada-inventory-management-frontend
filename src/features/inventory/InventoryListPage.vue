<template>
  <section>
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Inventory</h2>
        <p v-if="store.paginationMeta" class="mt-0.5 text-sm text-slate-500">
          {{ store.paginationMeta.total_items }} item{{
            store.paginationMeta.total_items === 1 ? '' : 's'
          }}
        </p>
      </div>
      <RouterLink
        to="/inventory/create"
        class="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add item
      </RouterLink>
    </div>

    <!-- Filters -->
    <InventoryFilters
      :initial-search="initialFilters.search"
      :initial-category-id="initialFilters.category_id"
      :initial-stock-status="initialFilters.stock_status"
      :initial-sort-by="initialFilters.sort_by"
      :initial-sort-order="initialFilters.sort_order"
      @change="onFiltersChanged"
    />

    <!-- Error banner -->
    <div
      v-if="store.listError"
      class="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
    >
      {{ store.listError }}
    </div>

    <!-- Loading skeleton -->
    <div v-if="store.isFetchingList" class="space-y-3">
      <div v-for="n in 5" :key="n" class="h-16 animate-pulse rounded-lg bg-slate-100" />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!store.hasItems"
      class="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="mb-3 h-10 w-10 text-slate-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M20 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 3H8l-2 4h12l-2-4z"
        />
      </svg>
      <p class="font-medium text-slate-600">No items in inventory</p>
      <p class="mt-1 text-sm text-slate-400">Add your first item to get started.</p>
      <RouterLink
        to="/inventory/create"
        class="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
      >
        Add item
      </RouterLink>
    </div>

    <!-- Item table -->
    <div v-else class="overflow-hidden rounded-xl border border-slate-200">
      <table class="w-full text-sm">
        <thead
          class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          <tr>
            <th class="px-4 py-3">Name</th>
            <th class="px-4 py-3">Category</th>
            <th class="px-4 py-3 text-right">Quantity</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white">
          <tr v-for="item in store.items" :key="item.id" class="transition hover:bg-slate-50">
            <!-- Name -->
            <td class="px-4 py-3">
              <RouterLink
                :to="`/inventory/${item.id}`"
                class="font-medium text-slate-900 hover:underline"
              >
                {{ item.name }}
              </RouterLink>
              <p v-if="item.description" class="mt-0.5 truncate text-xs text-slate-400 max-w-xs">
                {{ item.description }}
              </p>
            </td>

            <!-- Category -->
            <td class="px-4 py-3">
              <span
                v-if="item.category"
                class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700"
              >
                {{ item.category.name }}
              </span>
              <span v-else class="text-xs text-slate-400">—</span>
            </td>

            <!-- Quantity -->
            <td class="px-4 py-3 text-right font-mono font-medium text-slate-900">
              {{ item.quantity }}
            </td>

            <!-- Low stock badge -->
            <td class="px-4 py-3">
              <span
                v-if="item.is_low_stock"
                class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Low stock
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                In stock
              </span>
            </td>

            <!-- Actions -->
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-2">
                <RouterLink
                  :to="`/inventory/${item.id}/edit`"
                  class="rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Edit
                </RouterLink>

                <!-- Delete with confirmation -->
                <template v-if="confirmDeleteId === item.id">
                  <span class="text-xs text-slate-500">Delete?</span>
                  <button
                    class="rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
                    :disabled="store.isDeleting"
                    @click="confirmDelete(item.id)"
                  >
                    Yes
                  </button>
                  <button
                    class="rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                    @click="confirmDeleteId = null"
                  >
                    No
                  </button>
                </template>
                <button
                  v-else
                  class="rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                  @click="confirmDeleteId = item.id"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="store.paginationMeta && store.paginationMeta.total_pages > 1" class="mt-4">
      <AppPagination
        :current-page="store.paginationMeta.page"
        :total-pages="store.paginationMeta.total_pages"
        :total-items="store.paginationMeta.total_items"
        :page-size="store.paginationMeta.page_size"
        @update:page="onPageChange"
      />
    </div>

    <!-- Mutation error (e.g. delete failed) -->
    <div
      v-if="store.mutationError"
      class="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
    >
      {{ store.mutationError }}
      <button class="ml-2 underline" @click="store.clearMutationError()">Dismiss</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useInventoryStore } from './inventoryStore';
import InventoryFilters from './components/InventoryFilters.vue';
import AppPagination from '@/shared/components/AppPagination.vue';
import type { StockStatus, InventoryListQueryParams } from '@/shared/types';
import type { SortOrder } from '@/shared/types/common';

const route = useRoute();
const router = useRouter();
const store = useInventoryStore();

const confirmDeleteId = ref<number | null>(null);

// Parse initial filters from URL
const initialFilters = {
  search: route.query.search as string | undefined,
  category_id: route.query.category_id ? Number(route.query.category_id) : undefined,
  stock_status: route.query.stock_status as StockStatus | undefined,
  sort_by: route.query.sort_by as 'name' | 'quantity' | 'created_at' | 'updated_at' | undefined,
  sort_order: route.query.sort_order as SortOrder | undefined,
  page: route.query.page ? Number(route.query.page) : 1,
  page_size: route.query.page_size ? Number(route.query.page_size) : 10,
};

onMounted(() => {
  store.fetchItems(initialFilters);
});

// Watch URL query changes to fetch data
watch(
  () => route.query,
  (newQuery) => {
    store.fetchItems({
      search: newQuery.search as string | undefined,
      category_id: newQuery.category_id ? Number(newQuery.category_id) : undefined,
      stock_status: newQuery.stock_status as StockStatus | undefined,
      sort_by: newQuery.sort_by as 'name' | 'quantity' | 'created_at' | 'updated_at' | undefined,
      sort_order: newQuery.sort_order as SortOrder | undefined,
      page: newQuery.page ? Number(newQuery.page) : 1,
      page_size: newQuery.page_size ? Number(newQuery.page_size) : 10,
    });
  },
  { deep: true },
);

const onFiltersChanged = (filters: InventoryListQueryParams) => {
  // Build new query object, dropping undefined/null values
  const query = { ...route.query };

  // Update fields
  if (filters.search) query.search = filters.search;
  else delete query.search;

  if (filters.category_id) query.category_id = String(filters.category_id);
  else delete query.category_id;

  if (filters.stock_status) query.stock_status = filters.stock_status;
  else delete query.stock_status;

  if (filters.sort_by) query.sort_by = filters.sort_by;
  else delete query.sort_by;

  if (filters.sort_order) query.sort_order = filters.sort_order;
  else delete query.sort_order;

  // Since it's a new search/filter/sort, reset page
  delete query.page;

  // Push to router
  // We use push so users can use the back button.
  router.push({ query });
};

const onPageChange = (newPage: number) => {
  const query = { ...route.query, page: String(newPage) };
  router.push({ query });
};

async function confirmDelete(itemId: number): Promise<void> {
  await store.deleteItem(itemId);
  confirmDeleteId.value = null;
}
</script>
