<template>
  <section class="mx-auto max-w-2xl">
    <!-- Header -->
    <div class="mb-6">
      <RouterLink
        to="/inventory"
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
        Back to inventory
      </RouterLink>
      <h2 class="text-xl font-bold text-slate-900">Add new item</h2>
    </div>

    <!-- Form card -->
    <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <ItemForm
        submit-label="Create item"
        :is-submitting="store.isCreating"
        :server-error="store.mutationError"
        :show-cancel="true"
        @submit="handleSubmit"
        @cancel="router.push('/inventory')"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useInventoryStore } from './inventoryStore';
import ItemForm from './ItemForm.vue';
import type { InventoryCreateRequest } from '@/shared/types';

const store = useInventoryStore();
const router = useRouter();

async function handleSubmit(values: InventoryCreateRequest): Promise<void> {
  try {
    const item = await store.createItem(values);
    await router.push(`/inventory/${item.id}`);
  } catch {
    // mutationError is displayed by ItemForm's serverError prop
  }
}
</script>
