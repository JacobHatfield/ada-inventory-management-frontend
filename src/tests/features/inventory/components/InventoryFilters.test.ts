import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import InventoryFilters from '@/features/inventory/components/InventoryFilters.vue';

// Mock the category store hook
vi.mock('@/features/categories/categoryStore', () => ({
  useCategoryStore: vi.fn(() => ({
    categories: [{ id: 1, name: 'Test Category' }],
    hasCategories: true,
    fetchCategories: vi.fn(),
  })),
}));

describe('InventoryFilters.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const generateWrapper = (props = {}) => {
    return mount(InventoryFilters, { props });
  };

  it('renders correctly with default values', () => {
    const wrapper = generateWrapper();
    expect(wrapper.find('input#search').exists()).toBe(true);
    expect(wrapper.find('select#category').exists()).toBe(true);
    expect(wrapper.find('select#stockStatus').exists()).toBe(true);
    expect(wrapper.find('select#sort').exists()).toBe(true);
  });

  it('debounces search input and emits change event', async () => {
    const wrapper = generateWrapper();
    const input = wrapper.find('input#search');

    await input.setValue('test search');

    // Should not emit immediately due to debounce
    expect(wrapper.emitted('change')).toBeUndefined();

    // Fast-forward time
    vi.advanceTimersByTime(300);

    expect(wrapper.emitted('change')).toBeTruthy();
    expect(wrapper.emitted('change')![0][0]).toEqual({
      search: 'test search',
      category_id: undefined,
      stock_status: undefined,
      sort_by: 'created_at',
      sort_order: 'desc',
    });
  });

  it('emits change event immediately when select changes', async () => {
    const wrapper = generateWrapper();
    const select = wrapper.find('select#stockStatus');

    await select.setValue('low_stock');

    expect(wrapper.emitted('change')).toBeTruthy();
    expect(wrapper.emitted('change')![0][0]).toMatchObject({
      stock_status: 'low_stock',
    });
  });

  it('parses initial props correctly', () => {
    const wrapper = generateWrapper({
      initialSearch: 'hello',
      initialStockStatus: 'in_stock',
      initialSortBy: 'quantity',
      initialSortOrder: 'asc',
    });

    const input = wrapper.find('input#search').element as HTMLInputElement;
    expect(input.value).toBe('hello');

    const sortSelect = wrapper.find('select#sort').element as HTMLSelectElement;
    expect(sortSelect.value).toBe('quantity:asc');
  });
});
