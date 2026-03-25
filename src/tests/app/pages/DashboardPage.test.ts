import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import DashboardPage from '@/app/pages/DashboardPage.vue';
import { useDashboardStore } from '@/features/dashboard/dashboardStore';
import { alertService } from '@/shared/services/alertService';
import { useNotificationStore } from '@/shared/stores/notificationStore';

// Mock dependencies
vi.mock('@/features/dashboard/dashboardStore');
vi.mock('@/shared/services/alertService');
vi.mock('@/shared/stores/notificationStore');

describe('DashboardPage.vue', () => {
  let router: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'dashboard', component: DashboardPage },
        { path: '/inventory', name: 'inventory', component: { render: () => null } },
        { path: '/inventory/create', name: 'inventory-create', component: { render: () => null } },
        { path: '/inventory/:id', name: 'inventory-detail', component: { render: () => null } },
      ]
    });

    // Default mock implementation for useDashboardStore
    (useDashboardStore as any).mockReturnValue({
      summary: {
        total_items: 100,
        healthy_stock: 80,
        low_stock: 15,
        out_of_stock: 5
      },
      lowStockItems: [
        { id: 1, name: 'Item 1', quantity: 2, low_stock_threshold: 5 }
      ],
      isLoadingLowStock: false,
      error: null,
      fetchSummary: vi.fn().mockResolvedValue(undefined),
      fetchLowStockItems: vi.fn().mockResolvedValue(undefined)
    });

    // Default mock for useNotificationStore
    (useNotificationStore as any).mockReturnValue({
      success: vi.fn(),
      info: vi.fn(),
      error: vi.fn(),
      handleEmailError: vi.fn()
    });
  });

  it('performs parallel data fetching on mount', async () => {
    const store = useDashboardStore();
    mount(DashboardPage, {
      global: { plugins: [router] }
    });

    expect(store.fetchSummary).toHaveBeenCalled();
    expect(store.fetchLowStockItems).toHaveBeenCalled();
  });

  it('renders summary metrics correctly', () => {
    const wrapper = mount(DashboardPage, {
      global: { plugins: [router] }
    });

    const text = wrapper.text();
    expect(text).toContain('Total Items');
    expect(text).toContain('100');
    expect(text).toContain('Healthy Stock');
    expect(text).toContain('80');
    expect(text).toContain('Low Stock');
    expect(text).toContain('15');
    expect(text).toContain('Out of Stock');
    expect(text).toContain('5');
  });

  it('executes successful manual alert check', async () => {
    const notificationStore = useNotificationStore();
    
    // Use deferred promise to control timing and capture "Checking..." state
    let resolveAlert: any;
    const alertPromise = new Promise((resolve) => {
      resolveAlert = resolve;
    });
    vi.mocked(alertService.triggerManualAlertCheck).mockReturnValue(alertPromise as any);

    const wrapper = mount(DashboardPage, {
      global: { plugins: [router] }
    });

    const checkButton = wrapper.find('button');
    await checkButton.trigger('click');

    // Should be in triggering state
    expect(checkButton.text()).toContain('Checking...');
    
    // Resolve the promise
    resolveAlert({
      success: true,
      low_stock_count: 2,
      critical_stock_count: 1,
      low_stock_sent: true,
      critical_stock_sent: true
    });

    await flushPromises();

    expect(notificationStore.success).toHaveBeenCalledWith('Low stock alert emails have been dispatched.');
    expect(wrapper.text()).toContain('Alert check complete');
    expect(wrapper.text()).toContain('2 low stock sent');
    expect(wrapper.text()).toContain('1 critical sent');
  });

  it('displays info message when alerts are detected but already sent', async () => {
    const notificationStore = useNotificationStore();
    vi.mocked(alertService.triggerManualAlertCheck).mockResolvedValue({
      success: true,
      low_stock_count: 1,
      critical_stock_count: 0,
      low_stock_sent: false,
      critical_stock_sent: false
    });

    const wrapper = mount(DashboardPage, {
      global: { plugins: [router] }
    });

    await wrapper.find('button').trigger('click');
    
    await flushPromises();
    
    expect(notificationStore.info).toHaveBeenCalledWith(
        expect.stringContaining('emails were skipped')
    );
    expect(wrapper.text()).toContain('1 low stock found');
  });

  it('renders error banner on fetch failure', () => {
    (useDashboardStore as any).mockReturnValue({
      summary: null,
      lowStockItems: [],
      isLoadingLowStock: false,
      error: 'Failed to load summary',
      fetchSummary: vi.fn(),
      fetchLowStockItems: vi.fn()
    });

    const wrapper = mount(DashboardPage, {
      global: { plugins: [router] }
    });

    expect(wrapper.text()).toContain('Error loading dashboard');
    expect(wrapper.text()).toContain('Failed to load summary');
  });

  it('handles alert check rejection with notification and UI feedback', async () => {
    const notificationStore = useNotificationStore();
    const error = new Error('API server timeout');
    vi.mocked(alertService.triggerManualAlertCheck).mockRejectedValue(error);

    const wrapper = mount(DashboardPage, {
      global: { plugins: [router] }
    });

    await wrapper.find('button').trigger('click');

    await flushPromises();
    expect(wrapper.text()).toContain('API server timeout');
    expect(notificationStore.handleEmailError).toHaveBeenCalledWith(error);
  });

  it('shows overwhelmed email service message on 503 error', async () => {
    vi.mocked(alertService.triggerManualAlertCheck).mockRejectedValue(new Error('503 Service Unavailable'));

    const wrapper = mount(DashboardPage, {
      global: { plugins: [router] }
    });

    await wrapper.find('button').trigger('click');

    await flushPromises();
    expect(wrapper.text()).toContain('The email service is currently overwhelmed');
    expect(wrapper.text()).toContain('Wait 5 minutes before trying again');
  });

  it('navigates to inventory create page via Add Item button', () => {
    const wrapper = mount(DashboardPage, {
      global: { plugins: [router] }
    });

    const addLink = wrapper.find('a[href="/inventory/create"]');
    expect(addLink.exists()).toBe(true);
    expect(addLink.text()).toContain('Add Item');
  });
});
