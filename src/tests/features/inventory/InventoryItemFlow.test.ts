import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory, type Router } from 'vue-router';
import CreateItemPage from '@/features/inventory/CreateItemPage.vue';
import EditItemPage from '@/features/inventory/EditItemPage.vue';
import { inventoryService } from '@/shared/services/inventoryService';
import { categoryService } from '@/shared/services/categoryService';

vi.mock('@/shared/services/inventoryService');
vi.mock('@/shared/services/categoryService');

describe('Inventory Item Flow (Create/Edit)', () => {
  let router: Router;

  beforeEach(async () => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/inventory/create', component: CreateItemPage },
        { path: '/inventory/:id/edit', component: EditItemPage },
        { path: '/inventory/:id', name: 'inventory-detail', component: { render: () => null } },
        { path: '/inventory', name: 'inventory', component: { render: () => null } },
      ]
    });

    vi.mocked(categoryService.list).mockResolvedValue({
      items: [{ id: 1, name: 'Tools' }],
      total: 1,
      page: 1,
      page_size: 10,
      total_pages: 1
    } as any);
  });

  it('submits CreateItemPage successfully', async () => {
    vi.mocked(inventoryService.create).mockResolvedValue({ id: 99, name: 'New Item' } as any);
    
    await router.push('/inventory/create');
    const wrapper = mount(CreateItemPage, {
      global: { plugins: [router] }
    });

    await flushPromises();

    // Fill form using IDs
    await wrapper.find('#item-name').setValue('Drill');
    await wrapper.find('#item-quantity').setValue(5);
    await wrapper.find('#item-low-stock-threshold').setValue(2);
    
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    
    await vi.waitFor(() => {
        expect(inventoryService.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Drill' }));
    });

    await flushPromises();
    expect(router.currentRoute.value.path).toBe('/inventory/99');
  });

  it('renders EditItemPage with initial values and submits update', async () => {
    const item = { 
      id: 50, 
      name: 'Wrench', 
      quantity: 10, 
      low_stock_threshold: 5, 
      category_id: 1,
      description: 'Old desc'
    };
    vi.mocked(inventoryService.getById).mockResolvedValue(item as any);
    vi.mocked(inventoryService.update).mockResolvedValue(item as any);

    await router.push('/inventory/50/edit');
    const wrapper = mount(EditItemPage, {
      global: { plugins: [router] }
    });

    await vi.waitFor(() => {
        expect(inventoryService.getById).toHaveBeenCalledWith(50);
    });
    
    await flushPromises();
    expect((wrapper.find('#item-name').element as HTMLInputElement).value).toBe('Wrench');
    
    await wrapper.find('#item-name').setValue('Power Wrench');
    await flushPromises();
    await wrapper.find('form').trigger('submit');
    
    await vi.waitFor(() => {
        expect(inventoryService.update).toHaveBeenCalledWith(50, expect.objectContaining({ name: 'Power Wrench' }));
    });

    await flushPromises();
    expect(router.currentRoute.value.path).toBe('/inventory/50');
  });

  it('handles not found error in EditItemPage', async () => {
    vi.mocked(inventoryService.getById).mockRejectedValue(new Error('Item not found'));

    await router.push('/inventory/404/edit');
    const wrapper = mount(EditItemPage, {
      global: { plugins: [router] }
    });

    await vi.waitFor(() => {
        expect(inventoryService.getById).toHaveBeenCalled();
    });
    await flushPromises();
    expect(wrapper.text()).toContain('Item not found');
  });
});
