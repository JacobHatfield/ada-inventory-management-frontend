import { describe, it, expect, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import GlobalLoading from '@/shared/components/GlobalLoading.vue';
import { useRouteUiStore } from '@/shared/stores/routeUiStore';

describe('GlobalLoading.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('is hidden by default (when not navigating)', () => {
    const wrapper = mount(GlobalLoading);
    expect(wrapper.find('.fixed').exists()).toBe(false);
  });

  it('is visible when navigating', async () => {
    const routeUi = useRouteUiStore();
    const wrapper = mount(GlobalLoading);

    routeUi.startNavigation();
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.fixed').exists()).toBe(true);
    expect(wrapper.find('.animate-loading').exists()).toBe(true);
  });

  it('hides again when navigation finishes', async () => {
    const routeUi = useRouteUiStore();
    const wrapper = mount(GlobalLoading);

    routeUi.startNavigation();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.fixed').exists()).toBe(true);

    routeUi.finishNavigation();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.fixed').exists()).toBe(false);
  });
});
