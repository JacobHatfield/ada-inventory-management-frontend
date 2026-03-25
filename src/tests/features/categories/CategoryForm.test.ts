import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import CategoryForm from '@/features/categories/CategoryForm.vue';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('CategoryForm.test.ts', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('renders with initial values and emits submit', async () => {
    const initialValues = { name: 'Paint', description: 'Wall paint' };
    const wrapper = mount(CategoryForm, {
      props: { initialValues },
    });

    expect(wrapper.find('#category-name').element.value).toBe('Paint');
    expect(wrapper.find('#category-description').element.value).toBe('Wall paint');

    await wrapper.find('form').trigger('submit');
    await flushPromises();
    await delay(50);

    expect(wrapper.emitted().submit).toBeTruthy();
    expect(wrapper.emitted().submit[0][0]).toEqual({ name: 'Paint', description: 'Wall paint' });
  });

  it('shows required validation error', async () => {
    const wrapper = mount(CategoryForm);

    await wrapper.find('form').trigger('submit');
    await flushPromises();
    await delay(50);

    expect(wrapper.text().toLowerCase()).toContain('name is required');
  });
});
