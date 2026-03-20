<template>
  <div class="mx-auto max-w-2xl">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-xl font-bold text-slate-900">Add New Category</h2>
      <RouterLink
        to="/categories"
        class="text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        &larr; Back to list
      </RouterLink>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <CategoryForm
        :is-submitting="store.isCreating"
        :server-error="store.mutationError"
        submit-label="Create category"
        show-cancel
        @submit="onSubmit"
        @cancel="router.push('/categories')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useCategoryStore } from './categoryStore';
import CategoryForm from './CategoryForm.vue';
import type { CategoryCreateRequest } from '@/shared/types';

const router = useRouter();
const store = useCategoryStore();

async function onSubmit(values: CategoryCreateRequest) {
  try {
    await store.createCategory(values);
    router.push('/categories');
  } catch (error) {
    // Error is handled in the store and passed to the form via props
  }
}
</script>
