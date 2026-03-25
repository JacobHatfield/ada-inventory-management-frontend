import { setActivePinia, createPinia } from 'pinia';
import { vi } from 'vitest';
import { useInventoryStore } from '@/features/inventory/inventoryStore';
import { inventoryService } from '@/shared/services/inventoryService';

vi.mock('@/shared/services/inventoryService', () => ({
  inventoryService: {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    incrementStock: vi.fn(),
    decrementStock: vi.fn(),
    getAuditHistory: vi.fn(),
  },
}));

const mockItem = {
  id: 1,
  name: 'Widget A',
  description: 'A test widget',
  quantity: 10,
  low_stock_threshold: 5,
  category_id: null,
  is_low_stock: false,
};

const mockItem2 = {
  id: 2,
  name: 'Widget B',
  description: null,
  quantity: 2,
  low_stock_threshold: 5,
  category_id: null,
  is_low_stock: true,
};

describe('inventoryStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('fetchItems()', () => {
    it('populates items and clears listError on success', async () => {
      vi.mocked(inventoryService.list).mockResolvedValue({
        items: [mockItem, mockItem2],
        total: 2,
        page: 1,
        page_size: 10,
        total_pages: 1,
      });

      const store = useInventoryStore();
      await store.fetchItems();

      expect(store.items).toHaveLength(2);
      expect(store.items[0].name).toBe('Widget A');
      expect(store.listError).toBeNull();
    });

    it('handles non-Error objects in catch block', async () => {
      vi.mocked(inventoryService.list).mockRejectedValue('String error');

      const store = useInventoryStore();
      await store.fetchItems();

      expect(store.listError).toBe('Failed to load inventory');
    });

    it('sets listError and keeps items empty on failure', async () => {
      vi.mocked(inventoryService.list).mockRejectedValue(new Error('Server error'));

      const store = useInventoryStore();
      await store.fetchItems();

      expect(store.items).toHaveLength(0);
      expect(store.listError).toBe('Server error');
    });

    it('resets isFetchingList to false after completion', async () => {
      vi.mocked(inventoryService.list).mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        page_size: 10,
        total_pages: 0,
      });

      const store = useInventoryStore();
      await store.fetchItems();

      expect(store.isFetchingList).toBe(false);
    });

    it('stores pagination meta when provided', async () => {
      const response = {
        items: [mockItem],
        total: 2,
        page: 1,
        page_size: 10,
        total_pages: 1,
      };
      vi.mocked(inventoryService.list).mockResolvedValue(response);

      const store = useInventoryStore();
      await store.fetchItems();

      expect(store.paginationMeta).toEqual({
        page: 1,
        page_size: 10,
        total_items: 2,
        total_pages: 1,
      });
    });
  });

  describe('fetchItemById()', () => {
    it('sets selectedItem on success', async () => {
      vi.mocked(inventoryService.getById).mockResolvedValue(mockItem);

      const store = useInventoryStore();
      await store.fetchItemById(1);

      expect(store.selectedItem).toEqual(mockItem);
      expect(store.itemError).toBeNull();
    });

    it('sets itemError on failure', async () => {
      vi.mocked(inventoryService.getById).mockRejectedValue(new Error('Not found'));

      const store = useInventoryStore();
      await store.fetchItemById(999);

      expect(store.selectedItem).toBeNull();
      expect(store.itemError).toBe('Not found');
    });

    it('handles non-Error objects in catch block', async () => {
      vi.mocked(inventoryService.getById).mockRejectedValue(null);

      const store = useInventoryStore();
      await store.fetchItemById(1);

      expect(store.itemError).toBe('Failed to load item');
    });
  });

  describe('createItem()', () => {
    it('prepends new item to the list and returns it', async () => {
      vi.mocked(inventoryService.list).mockResolvedValue({
        items: [mockItem2],
        total: 1,
        page: 1,
        page_size: 10,
        total_pages: 1,
      });
      vi.mocked(inventoryService.create).mockResolvedValue(mockItem);

      const store = useInventoryStore();
      await store.fetchItems();
      const created = await store.createItem({ name: 'Widget A', quantity: 10 });

      expect(created).toEqual(mockItem);
      expect(store.items[0]).toEqual(mockItem);
      expect(store.items).toHaveLength(2);
    });

    it('sets mutationError and throws on failure', async () => {
      vi.mocked(inventoryService.create).mockRejectedValue(new Error('Validation failed'));

      const store = useInventoryStore();
      await expect(store.createItem({ name: '', quantity: 0 })).rejects.toThrow();

      expect(store.mutationError).toBe('Validation failed');
    });

    it('handles non-Error objects in catch block', async () => {
      vi.mocked(inventoryService.create).mockRejectedValue({});

      const store = useInventoryStore();
      await expect(store.createItem({ name: 'x' })).rejects.toThrow();

      expect(store.mutationError).toBe('Failed to create item');
    });

    it('resets isCreating to false after completion', async () => {
      vi.mocked(inventoryService.create).mockResolvedValue(mockItem);

      const store = useInventoryStore();
      await store.createItem({ name: 'Widget A', quantity: 10 });

      expect(store.isCreating).toBe(false);
    });
  });

  describe('updateItem()', () => {
    it('updates the item in the list and returns updated item', async () => {
      vi.mocked(inventoryService.list).mockResolvedValue({
        items: [mockItem],
        total: 1,
        page: 1,
        page_size: 10,
        total_pages: 1,
      });
      const updatedItem = { ...mockItem, name: 'Widget A Updated' };
      vi.mocked(inventoryService.update).mockResolvedValue(updatedItem);

      const store = useInventoryStore();
      await store.fetchItems();
      const result = await store.updateItem(1, { name: 'Widget A Updated' });

      expect(result.name).toBe('Widget A Updated');
      expect(store.items[0].name).toBe('Widget A Updated');
    });

    it('also updates selectedItem if it matches', async () => {
      vi.mocked(inventoryService.getById).mockResolvedValue(mockItem);
      const updatedItem = { ...mockItem, quantity: 20 };
      vi.mocked(inventoryService.update).mockResolvedValue(updatedItem);

      const store = useInventoryStore();
      await store.fetchItemById(1);
      await store.updateItem(1, { quantity: 20 });

      expect(store.selectedItem?.quantity).toBe(20);
    });

    it('does not update selectedItem if IDs do not match', async () => {
      vi.mocked(inventoryService.getById).mockResolvedValue(mockItem);
      vi.mocked(inventoryService.update).mockResolvedValue({ ...mockItem2, quantity: 20 });

      const store = useInventoryStore();
      await store.fetchItemById(1);
      await store.updateItem(2, { quantity: 20 });

      expect(store.selectedItem?.quantity).toBe(10);
    });

    it('handles missing item in list during update', async () => {
      vi.mocked(inventoryService.list).mockResolvedValue({ 
        items: [], total: 0, page: 1, page_size: 10, total_pages: 0 
      } as any);
      vi.mocked(inventoryService.update).mockResolvedValue(mockItem);

      const store = useInventoryStore();
      await store.fetchItems();
      await store.updateItem(1, { name: 'New' });

      expect(store.items).toHaveLength(0);
    });

    it('sets mutationError and throws on failure', async () => {
      vi.mocked(inventoryService.update).mockRejectedValue(new Error('Update failed'));

      const store = useInventoryStore();
      await expect(store.updateItem(1, { name: 'x' })).rejects.toThrow();

      expect(store.mutationError).toBe('Update failed');
    });

    it('handles non-Error objects in catch block during update', async () => {
      vi.mocked(inventoryService.update).mockRejectedValue(undefined);

      const store = useInventoryStore();
      await expect(store.updateItem(1, {})).rejects.toThrow();
      expect(store.mutationError).toBe('Failed to update item');
    });
  });

  describe('deleteItem()', () => {
    it('removes item from the list on success', async () => {
      vi.mocked(inventoryService.list).mockResolvedValue({
        items: [mockItem, mockItem2],
        total: 2,
        page: 1,
        page_size: 10,
        total_pages: 1,
      });
      vi.mocked(inventoryService.remove).mockResolvedValue(undefined);

      const store = useInventoryStore();
      await store.fetchItems();
      await store.deleteItem(1);

      expect(store.items).toHaveLength(1);
      expect(store.items[0].id).toBe(2);
    });

    it('clears selectedItem if it was the deleted item', async () => {
      vi.mocked(inventoryService.getById).mockResolvedValue(mockItem);
      vi.mocked(inventoryService.remove).mockResolvedValue(undefined);

      const store = useInventoryStore();
      await store.fetchItemById(1);
      await store.deleteItem(1);

      expect(store.selectedItem).toBeNull();
    });

    it('does not clear selectedItem if IDs do not match', async () => {
      vi.mocked(inventoryService.getById).mockResolvedValue(mockItem);
      vi.mocked(inventoryService.remove).mockResolvedValue(undefined);

      const store = useInventoryStore();
      await store.fetchItemById(1);
      await store.deleteItem(2);

      expect(store.selectedItem).not.toBeNull();
    });

    it('handles non-Error objects in catch block', async () => {
      vi.mocked(inventoryService.remove).mockRejectedValue(123);

      const store = useInventoryStore();
      await expect(store.deleteItem(1)).rejects.toThrow();
      expect(store.mutationError).toBe('Failed to delete item');
    });
  });

  describe('incrementStock()', () => {
    it('updates quantity in list and selectedItem', async () => {
      vi.mocked(inventoryService.list).mockResolvedValue({
        items: [mockItem],
        total: 1,
        page: 1,
        page_size: 10,
        total_pages: 1,
      });
      vi.mocked(inventoryService.getById).mockResolvedValue(mockItem);
      const incremented = { ...mockItem, quantity: 11 };
      vi.mocked(inventoryService.incrementStock).mockResolvedValue(incremented);

      const store = useInventoryStore();
      await store.fetchItems();
      await store.fetchItemById(1);
      await store.incrementStock(1);

      expect(store.selectedItem?.quantity).toBe(11);
    });

    it('handles non-Error objects in catch block', async () => {
      vi.mocked(inventoryService.incrementStock).mockRejectedValue('Err');

      const store = useInventoryStore();
      await expect(store.incrementStock(1)).rejects.toThrow();

      expect(store.mutationError).toBe('Failed to increment stock');
    });

    it('handles missing item in list during increment', async () => {
      vi.mocked(inventoryService.list).mockResolvedValue({ 
        items: [], total: 0, page: 1, page_size: 10, total_pages: 0 
      } as any);
      vi.mocked(inventoryService.incrementStock).mockResolvedValue({ ...mockItem, quantity: 11 });

      const store = useInventoryStore();
      await store.fetchItems();
      await store.incrementStock(1);

      expect(store.items).toHaveLength(0);
    });
  });

  describe('decrementStock()', () => {
    it('updates quantity in list and selectedItem', async () => {
      vi.mocked(inventoryService.list).mockResolvedValue({
        items: [mockItem],
        total: 1,
        page: 1,
        page_size: 10,
        total_pages: 1,
      });
      vi.mocked(inventoryService.getById).mockResolvedValue(mockItem);
      const decremented = { ...mockItem, quantity: 9 };
      vi.mocked(inventoryService.decrementStock).mockResolvedValue(decremented);

      const store = useInventoryStore();
      await store.fetchItems();
      await store.fetchItemById(mockItem.id);
      await store.decrementStock(mockItem.id, 1);

      expect(store.selectedItem?.quantity).toBe(9);
    });

    it('handles non-Error objects in catch block', async () => {
      vi.mocked(inventoryService.decrementStock).mockRejectedValue(true);

      const store = useInventoryStore();
      await expect(store.decrementStock(1)).rejects.toThrow();

      expect(store.mutationError).toBe('Failed to decrement stock');
    });

    it('handles missing item in list during decrement', async () => {
      vi.mocked(inventoryService.list).mockResolvedValue({ 
        items: [], total: 0, page: 1, page_size: 10, total_pages: 0 
      } as any);
      vi.mocked(inventoryService.decrementStock).mockResolvedValue({ ...mockItem, quantity: 9 });

      const store = useInventoryStore();
      await store.fetchItems();
      await store.decrementStock(1);

      expect(store.items).toHaveLength(0);
    });
  });

  describe('fetchAuditHistory()', () => {
    const mockAuditLog = {
      id: 1,
      inventory_item_id: 1,
      user_id: 1,
      action: 'update',
      field_name: 'quantity',
      old_value: '10',
      new_value: '5',
      timestamp: '2023-01-01T00:00:00Z',
    };

    it('successfully fetches and updates auditHistory and auditPaginationMeta', async () => {
      vi.mocked(inventoryService.getAuditHistory).mockResolvedValue({
        items: [mockAuditLog],
        total: 1,
        page: 1,
        page_size: 10,
        total_pages: 1,
      });

      const store = useInventoryStore();
      await store.fetchAuditHistory(1);

      expect(store.auditHistory).toHaveLength(1);
      expect(store.auditHistory[0].action).toBe('update');
      expect(store.auditPaginationMeta?.total_items).toBe(1);
      expect(store.isFetchingHistory).toBe(false);
    });

    it('sets auditError on failure', async () => {
      vi.mocked(inventoryService.getAuditHistory).mockRejectedValue(new Error('Audit fail'));

      const store = useInventoryStore();
      await store.fetchAuditHistory(1);

      expect(store.auditHistory).toHaveLength(0);
      expect(store.auditError).toBe('Audit fail');
      expect(store.isFetchingHistory).toBe(false);
    });

    it('handles non-Error objects in catch block', async () => {
      vi.mocked(inventoryService.getAuditHistory).mockRejectedValue({ msg: 'error' });

      const store = useInventoryStore();
      await store.fetchAuditHistory(1);

      expect(store.auditError).toBe('Failed to load audit history');
    });
  });

  describe('utility actions', () => {
    it('clearSelectedItem resets selection and error', () => {
      const store = useInventoryStore();
      store.selectedItem = mockItem;
      store.itemError = 'Some error';

      store.clearSelectedItem();

      expect(store.selectedItem).toBeNull();
      expect(store.itemError).toBeNull();
    });

    it('clearMutationError resets mutation error state', () => {
      const store = useInventoryStore();
      store.mutationError = 'Some error';

      store.clearMutationError();

      expect(store.mutationError).toBeNull();
    });
  });

  describe('computed', () => {
    it('hasItems returns false when list is empty', () => {
      const store = useInventoryStore();
      expect(store.hasItems).toBe(false);
    });

    it('lowStockItems returns only items where is_low_stock is true', async () => {
      vi.mocked(inventoryService.list).mockResolvedValue({
        items: [mockItem, mockItem2],
        total: 2,
        page: 1,
        page_size: 10,
        total_pages: 1,
      });

      const store = useInventoryStore();
      await store.fetchItems();

      expect(store.lowStockItems).toHaveLength(1);
      expect(store.lowStockItems[0].id).toBe(2);
    });
  });
});
