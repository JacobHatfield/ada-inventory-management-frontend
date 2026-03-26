import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ItemForm from '@/features/inventory/ItemForm.vue';
import { useCategoryStore } from '@/features/categories/categoryStore';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('ItemForm.test.ts', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('renders form with initial values', async () => {
    const initialValues = {
      name: 'Existing Item',
      quantity: 50,
      description: 'Test description',
    };

    const wrapper = mount(ItemForm, {
      props: { initialValues },
    });

    expect((wrapper.find('#item-name').element as HTMLInputElement).value).toBe('Existing Item');
    expect((wrapper.find('#item-quantity').element as HTMLInputElement).value).toBe('50');
  });

  it('emits submit event with form data on valid submission', async () => {
    const wrapper = mount(ItemForm);

    await wrapper.find('#item-name').setValue('New Gadget');
    await wrapper.find('#item-quantity').setValue(100);
    await wrapper.find('#item-description').setValue('Splendid gadget');
    await flushPromises();

    await wrapper.find('form').trigger('submit');
    await flushPromises();
    await delay(50);

    expect(wrapper.emitted().submit).toBeTruthy();
    expect((wrapper.emitted().submit as any[][])[0][0]).toMatchObject({
      name: 'New Gadget',
      quantity: 100,
      description: 'Splendid gadget',
    });
  });

  it('shows validation errors for negative quantity', async () => {
    const wrapper = mount(ItemForm);

    await wrapper.find('#item-name').setValue('Bad Item');
    await wrapper.find('#item-quantity').setValue(-5);
    await flushPromises();

    await wrapper.find('form').trigger('submit');
    await flushPromises();
    await delay(50);

    expect(wrapper.text().toLowerCase()).toContain('cannot be negative');
  });

  it('populates category options from store', async () => {
    const categoryStore = useCategoryStore();
    categoryStore.categories = [
      { id: 1, name: 'Electronics', description: '' },
      { id: 2, name: 'Furniture', description: '' },
    ];

    const wrapper = mount(ItemForm);

    const options = wrapper.findAll('option');
    expect(options.some((opt) => opt.text() === 'Electronics')).toBe(true);
    expect(options.some((opt) => opt.text() === 'Furniture')).toBe(true);
  });
});
