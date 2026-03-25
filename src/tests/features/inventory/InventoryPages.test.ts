import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory, type Router } from 'vue-router';
import { nextTick } from 'vue';
import { inventoryService } from '@/shared/services/inventoryService';
import InventoryListPage from '@/features/inventory/InventoryListPage.vue';
import ItemDetailPage from '@/features/inventory/ItemDetailPage.vue';
import { useInventoryStore } from '@/features/inventory/inventoryStore';

// Mock the service
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
  }
}));

describe('InventoryPages Integration', () => {
  let router: Router;

  beforeEach(async () => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/inventory', name: 'inventory', component: InventoryListPage },
        { path: '/inventory/:id', name: 'item-detail', component: ItemDetailPage },
        { path: '/inventory/:id/edit', name: 'item-edit', component: { render: () => null } },
      ],
    });
    
    await router.push('/inventory');
    await router.isReady();
  });

  describe('InventoryListPage.vue', () => {
    it('renders empty state when no items exist', async () => {
      vi.mocked(inventoryService.list).mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        page_size: 10,
        total_pages: 0
      });

      const wrapper = mount(InventoryListPage, {
        global: { 
          plugins: [router], 
          stubs: { InventoryFilters: true, AuditHistoryModal: true, AppPagination: true } 
        }
      });

      await flushPromises();
      await nextTick();
      expect(wrapper.text()).toContain('No items in inventory');
    });

    it('renders item list when items are present', async () => {
      vi.mocked(inventoryService.list).mockResolvedValue({
        items: [{ 
          id: 1, 
          name: 'Screwdriver', 
          quantity: 10, 
          is_low_stock: false, 
          category: { id: 1, name: 'Tools' },
          description: 'A tool',
          low_stock_threshold: 5,
          category_id: 1
        }] as any,
        total: 1,
        page: 1,
        page_size: 10,
        total_pages: 1
      });

      const wrapper = mount(InventoryListPage, {
        global: { 
          plugins: [router], 
          stubs: { InventoryFilters: true, AuditHistoryModal: true, AppPagination: true } 
        }
      });

      await flushPromises();
      await nextTick();
      expect(wrapper.text()).toContain('Screwdriver');
      expect(wrapper.text()).toContain('Tools');
    });

    it('shows delete confirmation when delete button is clicked', async () => {
      vi.mocked(inventoryService.list).mockResolvedValue({
        items: [{ 
          id: 1, 
          name: 'DeleteMe', 
          quantity: 5, 
          is_low_stock: false,
          description: '',
          low_stock_threshold: 2,
          category_id: null
        }] as any,
        total: 1,
        page: 1,
        page_size: 10,
        total_pages: 1
      });
      
      const wrapper = mount(InventoryListPage, {
        global: { 
          plugins: [router], 
          stubs: { InventoryFilters: true, AuditHistoryModal: true, AppPagination: true } 
        }
      });

      await flushPromises();
      await nextTick();
      
      const deleteBtn = wrapper.find('button.text-red-600');
      await deleteBtn.trigger('click');
      expect(wrapper.text()).toContain('Delete?');
    });
  });

  describe('ItemDetailPage.vue', () => {
    it('fetches item on mount and renders details', async () => {
      vi.mocked(inventoryService.getById).mockResolvedValue({ 
        id: 55, 
        name: 'Hammer', 
        quantity: 5, 
        low_stock_threshold: 10, 
        is_low_stock: true,
        description: 'A heavy tool',
        category_id: 1
      } as any);

      await router.push('/inventory/55');
      await router.isReady();

      const wrapper = mount(ItemDetailPage, {
        global: { 
          plugins: [router], 
          stubs: { AuditHistoryModal: true } 
        }
      });

      await flushPromises();
      await nextTick();
      expect(wrapper.text()).toContain('Hammer');
    });
  });
});
