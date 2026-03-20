import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { categoryService } from '@/shared/services/categoryService';
import type { Category, CategoryCreateRequest, CategoryUpdateRequest } from '@/shared/types';

export const useCategoryStore = defineStore('category', () => {
  // State
  const categories = ref<Category[]>([]);
  const selectedCategory = ref<Category | null>(null);

  // Loading flags
  const isFetchingList = ref(false);
  const isFetchingCategory = ref(false);
  const isCreating = ref(false);
  const isUpdating = ref(false);
  const isDeleting = ref(false);

  // Error state
  const listError = ref<string | null>(null);
  const categoryError = ref<string | null>(null);
  const mutationError = ref<string | null>(null);

  // Computed
  const hasCategories = computed(() => categories.value.length > 0);
  const categoryOptions = computed(() =>
    categories.value.map((c: Category) => ({ value: c.id, label: c.name })),
  );

  // Actions
  async function fetchCategories(): Promise<void> {
    isFetchingList.value = true;
    listError.value = null;

    try {
      const response = await categoryService.list();
      categories.value = response.items ?? response;
    } catch (error) {
      listError.value = error instanceof Error ? error.message : 'Failed to load categories';
    } finally {
      isFetchingList.value = false;
    }
  }

  async function fetchCategoryById(categoryId: number): Promise<void> {
    isFetchingCategory.value = true;
    categoryError.value = null;
    selectedCategory.value = null;

    try {
      selectedCategory.value = await categoryService.getById(categoryId);
    } catch (error) {
      categoryError.value = error instanceof Error ? error.message : 'Failed to load category';
    } finally {
      isFetchingCategory.value = false;
    }
  }

  async function createCategory(payload: CategoryCreateRequest): Promise<Category> {
    isCreating.value = true;
    mutationError.value = null;

    try {
      const newCategory = await categoryService.create(payload);
      categories.value.unshift(newCategory);
      return newCategory;
    } catch (error) {
      mutationError.value = error instanceof Error ? error.message : 'Failed to create category';
      throw error;
    } finally {
      isCreating.value = false;
    }
  }

  async function updateCategory(
    categoryId: number,
    payload: CategoryUpdateRequest,
  ): Promise<Category> {
    isUpdating.value = true;
    mutationError.value = null;

    try {
      const updated = await categoryService.update(categoryId, payload);
      const index = categories.value.findIndex((c: Category) => c.id === categoryId);
      if (index !== -1) {
        categories.value[index] = updated;
      }
      if (selectedCategory.value?.id === categoryId) {
        selectedCategory.value = updated;
      }
      return updated;
    } catch (error) {
      mutationError.value = error instanceof Error ? error.message : 'Failed to update category';
      throw error;
    } finally {
      isUpdating.value = false;
    }
  }

  async function deleteCategory(categoryId: number): Promise<void> {
    isDeleting.value = true;
    mutationError.value = null;

    try {
      await categoryService.remove(categoryId);
      categories.value = categories.value.filter((c: Category) => c.id !== categoryId);
      if (selectedCategory.value?.id === categoryId) {
        selectedCategory.value = null;
      }
    } catch (error) {
      mutationError.value = error instanceof Error ? error.message : 'Failed to delete category';
      throw error;
    } finally {
      isDeleting.value = false;
    }
  }

  function clearSelectedCategory(): void {
    selectedCategory.value = null;
    categoryError.value = null;
  }

  function clearMutationError(): void {
    mutationError.value = null;
  }

  return {
    // State
    categories,
    selectedCategory,
    // Loading flags
    isFetchingList,
    isFetchingCategory,
    isCreating,
    isUpdating,
    isDeleting,
    // Errors
    listError,
    categoryError,
    mutationError,
    // Computed
    hasCategories,
    categoryOptions,
    // Actions
    fetchCategories,
    fetchCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    clearSelectedCategory,
    clearMutationError,
  };
});
