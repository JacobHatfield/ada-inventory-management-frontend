<template>
  <div class="mx-auto max-w-2xl">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-xl font-bold text-slate-900">Edit Category</h2>
      <RouterLink
        to="/categories"
        class="text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        &larr; Back to list
      </RouterLink>
    </div>

    <!-- Error loading category -->
    <div
      v-if="store.categoryError"
      class="mb-6 rounded-lg border border-red-200 bg-red-50 p-6 text-center shadow-sm"
    >
      <p class="font-medium text-red-700">Category not found</p>
      <p class="mt-1 text-sm text-red-600">{{ store.categoryError }}</p>
      <RouterLink
        to="/categories"
        class="mt-4 inline-block rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-800 transition hover:bg-red-200"
      >
        Return to list
      </RouterLink>
    </div>

    <!-- Loading skeleton -->
    <div
      v-else-if="store.isFetchingCategory || !store.selectedCategory"
      class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm animate-pulse space-y-5"
    >
      <div class="h-10 rounded-lg bg-slate-100"></div>
      <div class="h-24 rounded-lg bg-slate-100"></div>
      <div class="h-10 w-1/3 rounded-lg bg-slate-100"></div>
    </div>

    <!-- Form -->
    <div v-else class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <CategoryForm
        :initial-values="store.selectedCategory"
        :is-submitting="store.isUpdating"
        :server-error="store.mutationError"
        submit-label="Save changes"
        show-cancel
        @submit="onSubmit"
        @cancel="router.push('/categories')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCategoryStore } from './categoryStore';
import CategoryForm from './CategoryForm.vue';
import type { CategoryCreateRequest } from '@/shared/types';

const route = useRoute();
const router = useRouter();
const store = useCategoryStore();

const categoryId = Number(route.params.id);

onMounted(() => {
  if (!isNaN(categoryId)) {
    store.fetchCategoryById(categoryId);
  }
});

async function onSubmit(values: CategoryCreateRequest) {
  try {
    if (isNaN(categoryId)) return;
    await store.updateCategory(categoryId, values);
    router.push('/categories');
  } catch (error) {
    // Error is handled in the store and passed to the form via props
  }
}
</script>
