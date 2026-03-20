import { setActivePinia, createPinia } from 'pinia';
import { vi } from 'vitest';
import { useCategoryStore } from './categoryStore';
import { categoryService } from '@/shared/services/categoryService';

vi.mock('@/shared/services/categoryService', () => ({
  categoryService: {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

const mockCategory = {
  id: 1,
  name: 'Electronics',
  description: 'Gadgets and devices',
};

const mockCategory2 = {
  id: 2,
  name: 'Furniture',
  description: null,
};

describe('categoryStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('fetchCategories()', () => {
    it('populates categories and clears listError on success', async () => {
      vi.mocked(categoryService.list).mockResolvedValue({ items: [mockCategory, mockCategory2] } as any);

      const store = useCategoryStore();
      await store.fetchCategories();

      expect(store.categories).toHaveLength(2);
      expect(store.categories[0].name).toBe('Electronics');
      expect(store.listError).toBeNull();
    });

    it('sets listError and keeps categories empty on failure', async () => {
      vi.mocked(categoryService.list).mockRejectedValue(new Error('Server error'));

      const store = useCategoryStore();
      await store.fetchCategories();

      expect(store.categories).toHaveLength(0);
      expect(store.listError).toBe('Server error');
    });

    it('resets isFetchingList to false after completion', async () => {
      vi.mocked(categoryService.list).mockResolvedValue([]);

      const store = useCategoryStore();
      await store.fetchCategories();

      expect(store.isFetchingList).toBe(false);
    });
  });

  describe('fetchCategoryById()', () => {
    it('sets selectedCategory on success', async () => {
      vi.mocked(categoryService.getById).mockResolvedValue(mockCategory);

      const store = useCategoryStore();
      await store.fetchCategoryById(1);

      expect(store.selectedCategory).toEqual(mockCategory);
      expect(store.categoryError).toBeNull();
    });

    it('sets categoryError on failure', async () => {
      vi.mocked(categoryService.getById).mockRejectedValue(new Error('Not found'));

      const store = useCategoryStore();
      await store.fetchCategoryById(999);

      expect(store.selectedCategory).toBeNull();
      expect(store.categoryError).toBe('Not found');
    });
  });

  describe('createCategory()', () => {
    it('prepends new category to the list and returns it', async () => {
      vi.mocked(categoryService.list).mockResolvedValue([mockCategory2]);
      vi.mocked(categoryService.create).mockResolvedValue(mockCategory);

      const store = useCategoryStore();
      await store.fetchCategories();
      const created = await store.createCategory({ name: 'Electronics' });

      expect(created).toEqual(mockCategory);
      expect(store.categories[0]).toEqual(mockCategory);
      expect(store.categories).toHaveLength(2);
    });

    it('sets mutationError and throws on failure', async () => {
      vi.mocked(categoryService.create).mockRejectedValue(new Error('Validation failed'));

      const store = useCategoryStore();
      await expect(store.createCategory({ name: '' })).rejects.toThrow();

      expect(store.mutationError).toBe('Validation failed');
    });
  });

  describe('updateCategory()', () => {
    it('updates the category in the list and returns updated category', async () => {
      vi.mocked(categoryService.list).mockResolvedValue([mockCategory]);
      const updatedCategory = { ...mockCategory, name: 'Electro' };
      vi.mocked(categoryService.update).mockResolvedValue(updatedCategory);

      const store = useCategoryStore();
      await store.fetchCategories();
      const result = await store.updateCategory(1, { name: 'Electro' });

      expect(result.name).toBe('Electro');
      expect(store.categories[0].name).toBe('Electro');
    });

    it('also updates selectedCategory if it matches', async () => {
      vi.mocked(categoryService.getById).mockResolvedValue(mockCategory);
      const updatedCategory = { ...mockCategory, description: 'New desc' };
      vi.mocked(categoryService.update).mockResolvedValue(updatedCategory);

      const store = useCategoryStore();
      await store.fetchCategoryById(1);
      await store.updateCategory(1, { description: 'New desc' });

      expect(store.selectedCategory?.description).toBe('New desc');
    });
  });

  describe('deleteCategory()', () => {
    it('removes category from the list on success', async () => {
      vi.mocked(categoryService.list).mockResolvedValue([mockCategory, mockCategory2]);
      vi.mocked(categoryService.remove).mockResolvedValue(undefined);

      const store = useCategoryStore();
      await store.fetchCategories();
      await store.deleteCategory(1);

      expect(store.categories).toHaveLength(1);
      expect(store.categories[0].id).toBe(2);
    });

    it('clears selectedCategory if it was the deleted category', async () => {
      vi.mocked(categoryService.getById).mockResolvedValue(mockCategory);
      vi.mocked(categoryService.remove).mockResolvedValue(undefined);

      const store = useCategoryStore();
      await store.fetchCategoryById(1);
      await store.deleteCategory(1);

      expect(store.selectedCategory).toBeNull();
    });
  });

  describe('computed properties', () => {
    it('hasCategories returns false when list is empty', () => {
      const store = useCategoryStore();
      expect(store.hasCategories).toBe(false);
    });

    it('categoryOptions maps categories to value/label pairs', async () => {
      vi.mocked(categoryService.list).mockResolvedValue([mockCategory, mockCategory2]);

      const store = useCategoryStore();
      await store.fetchCategories();

      expect(store.categoryOptions).toEqual([
        { value: 1, label: 'Electronics' },
        { value: 2, label: 'Furniture' },
      ]);
    });
  });
});
