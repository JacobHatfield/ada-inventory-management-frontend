<template>
  <section class="mx-auto max-w-2xl">
    <!-- Back link -->
    <RouterLink
      to="/inventory"
      class="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-slate-900"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Back to inventory
    </RouterLink>

    <!-- Loading skeleton -->
    <div
      v-if="store.isFetchingItem"
      class="space-y-4 rounded-xl border border-slate-200 bg-white p-6"
    >
      <div class="h-7 w-1/2 animate-pulse rounded-lg bg-slate-100" />
      <div v-for="n in 5" :key="n" class="h-10 animate-pulse rounded-lg bg-slate-100" />
    </div>

    <!-- Error state -->
    <div
      v-else-if="store.itemError"
      class="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"
      role="alert"
    >
      <p class="font-medium">Could not load item</p>
      <p class="mt-1">{{ store.itemError }}</p>
      <RouterLink to="/inventory" class="mt-3 inline-block underline">
        Return to inventory
      </RouterLink>
    </div>

    <!-- Item detail -->
    <template v-else-if="store.selectedItem">
      <!-- Header -->
      <div class="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-slate-900">{{ store.selectedItem.name }}</h2>
          <p v-if="store.selectedItem.category" class="mt-1">
            <span
              class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700"
            >
              {{ store.selectedItem.category.name }}
            </span>
          </p>
        </div>
        <RouterLink
          :to="`/inventory/${itemId}/edit`"
          class="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Edit
        </RouterLink>
      </div>

      <!-- Low stock alert -->
      <div
        v-if="store.selectedItem.is_low_stock"
        class="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        role="alert"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 shrink-0 text-amber-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          />
        </svg>
        Stock is below the low stock threshold of
        <strong>{{ store.selectedItem.low_stock_threshold }}</strong
        >.
      </div>

      <!-- Attributes card -->
      <div class="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <dl class="divide-y divide-slate-100">
          <!-- Description -->
          <div class="grid grid-cols-3 gap-4 px-5 py-4">
            <dt class="text-sm font-medium text-slate-500">Description</dt>
            <dd class="col-span-2 text-sm text-slate-900">
              {{ store.selectedItem.description || '—' }}
            </dd>
          </div>

          <!-- Quantity with stock controls -->
          <div class="grid grid-cols-3 gap-4 px-5 py-4">
            <dt class="text-sm font-medium text-slate-500">Quantity</dt>
            <dd class="col-span-2 flex items-center gap-3">
              <span class="text-2xl font-bold tabular-nums text-slate-900">
                {{ store.selectedItem.quantity }}
              </span>
              <div class="flex items-center gap-1">
                <button
                  class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  :disabled="store.isUpdatingStock || store.selectedItem.quantity <= 0"
                  title="Decrement stock"
                  @click="handleDecrement"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4" />
                  </svg>
                </button>
                <button
                  class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  :disabled="store.isUpdatingStock"
                  title="Increment stock"
                  @click="handleIncrement"
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
                </button>
              </div>
              <span v-if="store.isUpdatingStock" class="text-xs text-slate-400">Updating…</span>
            </dd>
          </div>

          <!-- Low stock threshold -->
          <div class="grid grid-cols-3 gap-4 px-5 py-4">
            <dt class="text-sm font-medium text-slate-500">Low stock threshold</dt>
            <dd class="col-span-2 text-sm text-slate-900">
              {{ store.selectedItem.low_stock_threshold }}
            </dd>
          </div>

          <!-- Category -->
          <div class="grid grid-cols-3 gap-4 px-5 py-4">
            <dt class="text-sm font-medium text-slate-500">Category</dt>
            <dd class="col-span-2 text-sm text-slate-900">
              {{ store.selectedItem.category?.name || '—' }}
            </dd>
          </div>

          <!-- Created at -->
          <div v-if="store.selectedItem.created_at" class="grid grid-cols-3 gap-4 px-5 py-4">
            <dt class="text-sm font-medium text-slate-500">Created</dt>
            <dd class="col-span-2 text-sm text-slate-900">
              {{ formatDate(store.selectedItem.created_at) }}
            </dd>
          </div>

          <!-- Updated at -->
          <div v-if="store.selectedItem.updated_at" class="grid grid-cols-3 gap-4 px-5 py-4">
            <dt class="text-sm font-medium text-slate-500">Last updated</dt>
            <dd class="col-span-2 text-sm text-slate-900">
              {{ formatDate(store.selectedItem.updated_at) }}
            </dd>
          </div>
        </dl>
      </div>

      <!-- Stock mutation error -->
      <div
        v-if="store.mutationError"
        class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        role="alert"
      >
        {{ store.mutationError }}
        <button class="ml-2 underline" @click="store.clearMutationError()">Dismiss</button>
      </div>

      <!-- Audit history link (placeholder until Phase 4.2) -->
      <div class="rounded-xl border border-slate-200 bg-white px-5 py-4">
        <p class="text-sm font-medium text-slate-700">Audit history</p>
        <p class="mt-0.5 text-xs text-slate-400">Coming in Phase 4.2</p>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useInventoryStore } from './inventoryStore';

const store = useInventoryStore();
const route = useRoute();

const itemId = computed(() => Number(route.params.id));

onMounted(() => {
  store.fetchItemById(itemId.value);
});

async function handleIncrement(): Promise<void> {
  await store.incrementStock(itemId.value);
}

async function handleDecrement(): Promise<void> {
  if (!store.selectedItem || store.selectedItem.quantity <= 0) return;
  await store.decrementStock(itemId.value);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
</script>
