import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import AuditHistoryModal from '@/features/inventory/components/AuditHistoryModal.vue';
import { inventoryService } from '@/shared/services/inventoryService';

vi.mock('@/shared/services/inventoryService', () => ({
  inventoryService: {
    getAuditHistory: vi.fn()
  }
}));

describe('AuditHistoryModal.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const wrapper = mount(AuditHistoryModal, {
      props: { isOpen: false, itemId: 1, itemName: 'Test Item' }
    });
    expect(wrapper.find('.fixed').exists()).toBe(false);
  });

  it('renders and fetches history when opened', async () => {
    const mockLogs = {
      items: [
        { id: 101, action: 'UPDATE', field_name: 'quantity', old_value: '5', new_value: '10', timestamp: '2024-01-01T10:00:00Z' }
      ],
      total: 1,
      page: 1,
      page_size: 10,
      total_pages: 1
    };
    vi.mocked(inventoryService.getAuditHistory).mockResolvedValue(mockLogs as any);

    const wrapper = mount(AuditHistoryModal, {
      props: { isOpen: true, itemId: 1, itemName: 'Test Item' }
    });

    // Wait for the service to be called (triggered by immediate watch)
    await vi.waitFor(() => {
        expect(inventoryService.getAuditHistory).toHaveBeenCalled();
    });
    
    await flushPromises();
    
    expect(wrapper.text()).toContain('Audit History');
    expect(wrapper.text()).toContain('History for Test Item');
    expect(wrapper.text()).toContain('UPDATE');
    expect(wrapper.text()).toContain('Quantity');
    expect(wrapper.text()).toContain('10');
  });

  it('displays empty state when no logs exist', async () => {
    vi.mocked(inventoryService.getAuditHistory).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      page_size: 10,
      total_pages: 0
    } as any);

    const wrapper = mount(AuditHistoryModal, {
      props: { isOpen: true, itemId: 1, itemName: 'Test Item' }
    });

    await vi.waitFor(() => {
        expect(inventoryService.getAuditHistory).toHaveBeenCalled();
    });
    await flushPromises();
    expect(wrapper.text()).toContain('No history found');
  });

  it('emits close event when close button is clicked', async () => {
    vi.mocked(inventoryService.getAuditHistory).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      page_size: 10,
      total_pages: 0
    } as any);
    const wrapper = mount(AuditHistoryModal, {
      props: { isOpen: true, itemId: 1, itemName: 'Test Item' }
    });

    await vi.waitFor(() => {
        expect(inventoryService.getAuditHistory).toHaveBeenCalled();
    });
    await flushPromises();
    const closeBtn = wrapper.find('button.rounded-lg.p-2');
    await closeBtn.trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });
});
