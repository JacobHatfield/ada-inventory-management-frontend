<template>
  <div class="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <!-- Search Input -->
      <div>
        <label
          for="search"
          class="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wider"
        >
          Search
        </label>
        <div class="relative">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              class="h-4 w-4 text-slate-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            id="search"
            v-model="localSearch"
            type="text"
            placeholder="Search items..."
            class="block w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-10 pr-3 text-sm placeholder-slate-400 focus:border-slate-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-500"
            @input="onSearchInput"
          />
        </div>
      </div>

      <!-- Category Filter -->
      <div>
        <label
          for="category"
          class="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wider"
        >
          Category
        </label>
        <select
          id="category"
          v-model="localCategoryId"
          class="block w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-3 pr-10 text-sm focus:border-slate-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-500"
          @change="onFilterChange"
        >
          <option :value="undefined">All Categories</option>
          <option v-for="cat in categoryStore.categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>

      <!-- Stock Status Filter -->
      <div>
        <label
          for="stockStatus"
          class="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wider"
        >
          Stock Status
        </label>
        <select
          id="stockStatus"
          v-model="localStockStatus"
          class="block w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-3 pr-10 text-sm focus:border-slate-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-500"
          @change="onFilterChange"
        >
          <option :value="undefined">All Statuses</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      <!-- Sort -->
      <div>
        <label
          for="sort"
          class="mb-1 block text-xs font-semibold text-slate-500 uppercase tracking-wider"
        >
          Sort By
        </label>
        <select
          id="sort"
          v-model="localSort"
          class="block w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-3 pr-10 text-sm focus:border-slate-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-500"
          @change="onFilterChange"
        >
          <option value="created_at:desc">Newest First</option>
          <option value="created_at:asc">Oldest First</option>
          <option value="name:asc">Name (A-Z)</option>
          <option value="name:desc">Name (Z-A)</option>
          <option value="quantity:desc">Highest Quantity</option>
          <option value="quantity:asc">Lowest Quantity</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useCategoryStore } from '@/features/categories/categoryStore';
import { debounce } from '@/shared/utils/debounce';
import type { StockStatus } from '@/shared/types';
import type { SortOrder } from '@/shared/types/common';

const props = defineProps<{
  initialSearch?: string;
  initialCategoryId?: number;
  initialStockStatus?: StockStatus;
  initialSortBy?: 'name' | 'quantity' | 'created_at' | 'updated_at';
  initialSortOrder?: SortOrder;
}>();

const emit = defineEmits<{
  (
    e: 'change',
    filters: {
      search?: string;
      category_id?: number;
      stock_status?: StockStatus;
      sort_by?: 'name' | 'quantity' | 'created_at' | 'updated_at';
      sort_order?: SortOrder;
    },
  ): void;
}>();

const categoryStore = useCategoryStore();

// Local state
const localSearch = ref(props.initialSearch ?? '');
const localCategoryId = ref<number | undefined>(props.initialCategoryId);
const localStockStatus = ref<StockStatus | undefined>(props.initialStockStatus);
const localSort = ref<string>(
  props.initialSortBy && props.initialSortOrder
    ? `${props.initialSortBy}:${props.initialSortOrder}`
    : 'created_at:desc',
);

// Fetch categories if not already loaded
onMounted(() => {
  if (!categoryStore.hasCategories) {
    categoryStore.fetchCategories();
  }
});

// Watch for external prop changes (e.g. from URL parsing)
watch(
  () => props.initialSearch,
  (newVal) => {
    localSearch.value = newVal ?? '';
  },
);
watch(
  () => props.initialCategoryId,
  (newVal) => {
    localCategoryId.value = newVal;
  },
);
watch(
  () => props.initialStockStatus,
  (newVal) => {
    localStockStatus.value = newVal;
  },
);
watch(
  () => [props.initialSortBy, props.initialSortOrder],
  () => {
    if (props.initialSortBy && props.initialSortOrder) {
      localSort.value = `${props.initialSortBy}:${props.initialSortOrder}`;
    }
  },
);

const emitChange = () => {
  const [sortBy, sortOrder] = localSort.value.split(':') as [
    'name' | 'quantity' | 'created_at' | 'updated_at',
    SortOrder,
  ];

  emit('change', {
    search: localSearch.value.trim() || undefined,
    category_id: localCategoryId.value,
    stock_status: localStockStatus.value,
    sort_by: sortBy,
    sort_order: sortOrder,
  });
};

const debouncedEmitSearch = debounce(emitChange, 300);

const onSearchInput = () => {
  debouncedEmitSearch();
};

const onFilterChange = () => {
  emitChange();
};
</script>
