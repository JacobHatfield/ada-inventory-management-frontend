import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory, type Router } from 'vue-router';
import CategoryListPage from '@/features/categories/CategoryListPage.vue';
import CreateCategoryPage from '@/features/categories/CreateCategoryPage.vue';
import EditCategoryPage from '@/features/categories/EditCategoryPage.vue';
import { categoryService } from '@/shared/services/categoryService';

// Mock service
vi.mock('@/shared/services/categoryService', () => ({
  categoryService: {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('CategoryPages Integration', () => {
  let router: Router;

  beforeEach(async () => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/categories', name: 'categories', component: CategoryListPage },
        { path: '/categories/create', name: 'category-create', component: CreateCategoryPage },
        { path: '/categories/:id/edit', name: 'category-edit', component: EditCategoryPage },
      ],
    });

    await router.push('/categories');
    await router.isReady();
  });

  describe('CategoryListPage.vue', () => {
    it('renders category list and handle deletion', async () => {
      const mockCat = { id: 1, name: 'Tools', description: 'Hand and power tools' };

      vi.mocked(categoryService.list).mockResolvedValue({ items: [mockCat] });
      vi.mocked(categoryService.remove).mockResolvedValue();

      const wrapper = mount(CategoryListPage, {
        global: { plugins: [router] },
      });

      await flushPromises();
      expect(wrapper.text()).toContain('Tools');

      await wrapper.find('button.text-red-600').trigger('click');
      expect(wrapper.text()).toContain('Delete?');

      await wrapper.find('button.bg-red-600').trigger('click');
      expect(categoryService.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('CreateCategoryPage.vue', () => {
    it('calls store.createCategory and redirects on submit', async () => {
      vi.mocked(categoryService.create).mockResolvedValue({ id: 99, name: 'New Cat' } as any);
      const routerPushSpy = vi.spyOn(router, 'push');

      const wrapper = mount(CreateCategoryPage, {
        global: {
          plugins: [router],
          stubs: {
            CategoryForm: {
              template:
                '<div @click="$emit(\'submit\', { name: \'New Cat\' })" class="mock-submit"></div>',
            },
          },
        },
      });

      await wrapper.find('.mock-submit').trigger('click');
      await flushPromises();

      expect(categoryService.create).toHaveBeenCalledWith({ name: 'New Cat' });
      expect(routerPushSpy).toHaveBeenCalledWith('/categories');
    });
  });

  describe('EditCategoryPage.vue', () => {
    it('fetches category on mount and redirects on update', async () => {
      vi.mocked(categoryService.getById).mockResolvedValue({
        id: 10,
        name: 'Old Name',
        description: '',
      });
      vi.mocked(categoryService.update).mockResolvedValue({ id: 10, name: 'Updated Name' } as any);
      const routerPushSpy = vi.spyOn(router, 'push');

      await router.push('/categories/10/edit');
      await router.isReady();

      const wrapper = mount(EditCategoryPage, {
        global: {
          plugins: [router],
          stubs: {
            CategoryForm: {
              template:
                '<div @click="$emit(\'submit\', { name: \'Updated Name\' })" class="mock-submit"></div>',
            },
          },
        },
      });

      await flushPromises();
      expect(categoryService.getById).toHaveBeenCalledWith(10);

      await wrapper.find('.mock-submit').trigger('click');
      await flushPromises();

      expect(categoryService.update).toHaveBeenCalledWith(10, { name: 'Updated Name' });
      expect(routerPushSpy).toHaveBeenCalledWith('/categories');
    });
  });
});
