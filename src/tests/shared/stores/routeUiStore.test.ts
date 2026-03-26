import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useRouteUiStore } from '@/shared/stores/routeUiStore';

describe('routeUiStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('initializes with default values', () => {
    const store = useRouteUiStore();
    expect(store.isNavigating).toBe(false);
    expect(store.navigationError).toBeNull();
  });

  it('startNavigation sets isNavigating to true and clears error', () => {
    const store = useRouteUiStore();
    store.navigationError = 'Old error';

    store.startNavigation();

    expect(store.isNavigating).toBe(true);
    expect(store.navigationError).toBeNull();
  });

  it('finishNavigation sets isNavigating to false', () => {
    const store = useRouteUiStore();
    store.isNavigating = true;

    store.finishNavigation();

    expect(store.isNavigating).toBe(false);
  });

  it('setNavigationError sets error and stops navigation', () => {
    const store = useRouteUiStore();
    store.isNavigating = true;

    store.setNavigationError('Network failure');

    expect(store.isNavigating).toBe(false);
    expect(store.navigationError).toBe('Network failure');
  });

  it('clearNavigationError resets error state', () => {
    const store = useRouteUiStore();
    store.navigationError = 'Some error';

    store.clearNavigationError();

    expect(store.navigationError).toBeNull();
  });
});
