<template>
  <section>
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Categories</h2>
        <p v-if="store.hasCategories" class="mt-0.5 text-sm text-slate-500">
          {{ store.categories.length }} categor{{ store.categories.length === 1 ? 'y' : 'ies' }}
        </p>
      </div>
      <RouterLink
        to="/categories/create"
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
        Add category
      </RouterLink>
    </div>

    <!-- List error -->
    <div
      v-if="store.listError"
      class="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
    >
      {{ store.listError }}
    </div>

    <!-- Loading skeleton -->
    <div v-if="store.isFetchingList" class="space-y-3">
      <div v-for="n in 4" :key="n" class="h-14 animate-pulse rounded-lg bg-slate-100" />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!store.hasCategories"
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
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
        />
      </svg>
      <p class="font-medium text-slate-600">No categories yet</p>
      <p class="mt-1 text-sm text-slate-400">Create a category to organise your inventory.</p>
      <RouterLink
        to="/categories/create"
        class="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
      >
        Add category
      </RouterLink>
    </div>

    <!-- Category table -->
    <div v-else class="overflow-hidden rounded-xl border border-slate-200">
      <table class="w-full text-sm">
        <thead
          class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          <tr>
            <th class="px-4 py-3">Name</th>
            <th class="px-4 py-3">Description</th>
            <th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white">
          <tr
            v-for="category in store.categories"
            :key="category.id"
            class="transition hover:bg-slate-50"
          >
            <!-- Name -->
            <td class="px-4 py-3 font-medium text-slate-900">
              {{ category.name }}
            </td>

            <!-- Description -->
            <td class="max-w-sm px-4 py-3 text-slate-500">
              <span v-if="category.description" class="truncate">
                {{ category.description }}
              </span>
              <span v-else class="text-slate-300">—</span>
            </td>

            <!-- Actions -->
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-2">
                <RouterLink
                  :to="`/categories/${category.id}/edit`"
                  class="rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Edit
                </RouterLink>

                <template v-if="confirmDeleteId === category.id">
                  <span class="text-xs text-slate-500">Delete?</span>
                  <button
                    class="rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
                    :disabled="store.isDeleting"
                    @click="confirmDelete(category.id)"
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
                  @click="confirmDeleteId = category.id"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
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
import { ref, onMounted } from 'vue';
import { useCategoryStore } from './categoryStore';

const store = useCategoryStore();
const confirmDeleteId = ref<number | null>(null);

onMounted(() => {
  store.fetchCategories();
});

async function confirmDelete(categoryId: number): Promise<void> {
  await store.deleteCategory(categoryId);
  confirmDeleteId.value = null;
}
</script>
