import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { inventoryService } from '../services/inventoryService';
import type {
  InventoryItem,
  InventoryCreateRequest,
  InventoryUpdateRequest,
  InventoryListQueryParams,
  PaginationMeta,
} from '../types';

export const useInventoryStore = defineStore('inventory', () => {
  // State
  const items = ref<InventoryItem[]>([]);
  const selectedItem = ref<InventoryItem | null>(null);
  const paginationMeta = ref<PaginationMeta | null>(null);

  // Loading flags
  const isFetchingList = ref(false);
  const isFetchingItem = ref(false);
  const isCreating = ref(false);
  const isUpdating = ref(false);
  const isDeleting = ref(false);
  const isUpdatingStock = ref(false);

  // Error state
  const listError = ref<string | null>(null);
  const itemError = ref<string | null>(null);
  const mutationError = ref<string | null>(null);

  // Computed
  const hasItems = computed(() => items.value.length > 0);
  const lowStockItems = computed(() =>
    items.value.filter((item) => item.is_low_stock),
  );

  // Actions
  async function fetchItems(params: InventoryListQueryParams = {}): Promise<void> {
    isFetchingList.value = true;
    listError.value = null;

    try {
      const response = await inventoryService.list(params);
      items.value = response.items;
      paginationMeta.value = response.meta ?? null;
    } catch (error) {
      listError.value = error instanceof Error ? error.message : 'Failed to load inventory';
    } finally {
      isFetchingList.value = false;
    }
  }

  async function fetchItemById(itemId: number): Promise<void> {
    isFetchingItem.value = true;
    itemError.value = null;
    selectedItem.value = null;

    try {
      selectedItem.value = await inventoryService.getById(itemId);
    } catch (error) {
      itemError.value = error instanceof Error ? error.message : 'Failed to load item';
    } finally {
      isFetchingItem.value = false;
    }
  }

  async function createItem(payload: InventoryCreateRequest): Promise<InventoryItem> {
    isCreating.value = true;
    mutationError.value = null;

    try {
      const newItem = await inventoryService.create(payload);
      items.value.unshift(newItem);
      return newItem;
    } catch (error) {
      mutationError.value = error instanceof Error ? error.message : 'Failed to create item';
      throw error;
    } finally {
      isCreating.value = false;
    }
  }

  async function updateItem(
    itemId: number,
    payload: InventoryUpdateRequest,
  ): Promise<InventoryItem> {
    isUpdating.value = true;
    mutationError.value = null;

    try {
      const updated = await inventoryService.update(itemId, payload);
      const index = items.value.findIndex((i) => i.id === itemId);
      if (index !== -1) {
        items.value[index] = updated;
      }
      if (selectedItem.value?.id === itemId) {
        selectedItem.value = updated;
      }
      return updated;
    } catch (error) {
      mutationError.value = error instanceof Error ? error.message : 'Failed to update item';
      throw error;
    } finally {
      isUpdating.value = false;
    }
  }

  async function deleteItem(itemId: number): Promise<void> {
    isDeleting.value = true;
    mutationError.value = null;

    try {
      await inventoryService.remove(itemId);
      items.value = items.value.filter((i) => i.id !== itemId);
      if (selectedItem.value?.id === itemId) {
        selectedItem.value = null;
      }
    } catch (error) {
      mutationError.value = error instanceof Error ? error.message : 'Failed to delete item';
      throw error;
    } finally {
      isDeleting.value = false;
    }
  }

  async function incrementStock(itemId: number, amount = 1): Promise<void> {
    isUpdatingStock.value = true;
    mutationError.value = null;

    try {
      const updated = await inventoryService.incrementStock(itemId, amount);
      const index = items.value.findIndex((i) => i.id === itemId);
      if (index !== -1) {
        items.value[index] = updated;
      }
      if (selectedItem.value?.id === itemId) {
        selectedItem.value = updated;
      }
    } catch (error) {
      mutationError.value = error instanceof Error ? error.message : 'Failed to increment stock';
      throw error;
    } finally {
      isUpdatingStock.value = false;
    }
  }

  async function decrementStock(itemId: number, amount = 1): Promise<void> {
    isUpdatingStock.value = true;
    mutationError.value = null;

    try {
      const updated = await inventoryService.decrementStock(itemId, amount);
      const index = items.value.findIndex((i) => i.id === itemId);
      if (index !== -1) {
        items.value[index] = updated;
      }
      if (selectedItem.value?.id === itemId) {
        selectedItem.value = updated;
      }
    } catch (error) {
      mutationError.value = error instanceof Error ? error.message : 'Failed to decrement stock';
      throw error;
    } finally {
      isUpdatingStock.value = false;
    }
  }

  function clearSelectedItem(): void {
    selectedItem.value = null;
    itemError.value = null;
  }

  function clearMutationError(): void {
    mutationError.value = null;
  }

  return {
    // State
    items,
    selectedItem,
    paginationMeta,
    // Loading flags
    isFetchingList,
    isFetchingItem,
    isCreating,
    isUpdating,
    isDeleting,
    isUpdatingStock,
    // Errors
    listError,
    itemError,
    mutationError,
    // Computed
    hasItems,
    lowStockItems,
    // Actions
    fetchItems,
    fetchItemById,
    createItem,
    updateItem,
    deleteItem,
    incrementStock,
    decrementStock,
    clearSelectedItem,
    clearMutationError,
  };
});
