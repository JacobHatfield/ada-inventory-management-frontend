<template>
  <section class="mx-auto max-w-2xl">
    <!-- Header -->
    <div class="mb-6">
      <RouterLink
        :to="`/inventory/${itemId}`"
        class="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-slate-900"
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
        Back to item
      </RouterLink>
      <h2 class="text-xl font-bold text-slate-900">
        {{ store.selectedItem ? `Edit: ${store.selectedItem.name}` : 'Edit item' }}
      </h2>
    </div>

    <!-- Loading skeleton -->
    <div v-if="store.isFetchingItem" class="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <div v-for="n in 4" :key="n" class="h-10 animate-pulse rounded-lg bg-slate-100" />
    </div>

    <!-- Not found error -->
    <div
      v-else-if="store.itemError"
      class="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"
      role="alert"
    >
      <p class="font-medium">Could not load item</p>
      <p class="mt-1">{{ store.itemError }}</p>
      <RouterLink to="/inventory" class="mt-3 inline-block text-sm underline">
        Return to inventory
      </RouterLink>
    </div>

    <!-- Form card -->
    <div v-else class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <ItemForm
        submit-label="Save changes"
        :initial-values="formInitialValues"
        :is-submitting="store.isUpdating"
        :server-error="store.mutationError"
        :show-cancel="true"
        @submit="handleSubmit"
        @cancel="router.push(`/inventory/${itemId}`)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useInventoryStore } from './inventoryStore';
import ItemForm from './ItemForm.vue';
import type { InventoryCreateRequest } from '@/shared/types';

const store = useInventoryStore();
const router = useRouter();
const route = useRoute();

const itemId = computed(() => Number(route.params.id));

// Map selectedItem into a shape the form understands as initialValues
const formInitialValues = computed(() => {
  const item = store.selectedItem;
  if (!item) return undefined;
  return {
    name: item.name,
    description: item.description ?? undefined,
    quantity: item.quantity,
    low_stock_threshold: item.low_stock_threshold,
    category_id: item.category_id ?? null,
  };
});

onMounted(() => {
  store.fetchItemById(itemId.value);
});

async function handleSubmit(values: InventoryCreateRequest): Promise<void> {
  try {
    await store.updateItem(itemId.value, values);
    await router.push(`/inventory/${itemId.value}`);
  } catch {
    // mutationError is displayed by ItemForm's serverError prop
  }
}
</script>
