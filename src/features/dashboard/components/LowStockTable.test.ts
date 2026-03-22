import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import LowStockTable from './LowStockTable.vue';
import type { InventoryItem } from '@/shared/types/inventory';

describe('LowStockTable.vue', () => {
  const mockItems: InventoryItem[] = [
    {
      id: 1,
      name: 'Test Item 1',
      description: null,
      quantity: 5,
      low_stock_threshold: 10,
      category_id: null,
    },
    {
      id: 2,
      name: 'Out of Stock Item',
      description: null,
      quantity: 0,
      low_stock_threshold: 5,
      category_id: null,
    },
  ];

  const globalMountOptions = {
    stubs: {
      RouterLink: true,
    },
  };

  it('shows loading state when loading is true', () => {
    const wrapper = mount(LowStockTable, {
      props: {
        items: [],
        loading: true,
      },
      global: globalMountOptions,
    });

    expect(wrapper.text()).toContain('Loading low stock items...');
  });

  it('shows healthy stock message when items array is empty', () => {
    const wrapper = mount(LowStockTable, {
      props: {
        items: [],
        loading: false,
      },
      global: globalMountOptions,
    });

    expect(wrapper.text()).toContain('All stock levels are healthy!');
  });

  it('renders a table with items when provided', () => {
    const wrapper = mount(LowStockTable, {
      props: {
        items: mockItems,
        loading: false,
      },
      global: globalMountOptions,
    });

    expect(wrapper.find('table').exists()).toBe(true);
    expect(wrapper.text()).toContain('Test Item 1');
    expect(wrapper.text()).toContain('Out of Stock Item');
  });

  it('sorts out-of-stock items to the top automatically', () => {
    const wrapper = mount(LowStockTable, {
      props: {
        items: mockItems,
        loading: false,
      },
      global: globalMountOptions,
    });

    // We can verify order by checking the rows (quantity 0 should be first)
    const rows = wrapper.findAll('tbody tr');
    expect(rows[0].text()).toContain('Out of Stock Item'); // Quantity 0
    expect(rows[1].text()).toContain('Test Item 1');       // Quantity 5
  });

  it('limits the display based on the limit prop', () => {
    const wrapper = mount(LowStockTable, {
      props: {
        items: mockItems,
        loading: false,
        limit: 1, // Only show 1 item
      },
      global: globalMountOptions,
    });

    const rows = wrapper.findAll('tbody tr');
    expect(rows).toHaveLength(1);
    // Since it sorts by quantity, the out of stock item should be the one displayed
    expect(rows[0].text()).toContain('Out of Stock Item');
  });
});
