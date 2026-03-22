import { createRouter, createWebHistory } from 'vue-router';

import DashboardPage from '../app/pages/DashboardPage.vue';
import LoginPage from '../features/auth/LoginPage.vue';
import RegisterPage from '../features/auth/RegisterPage.vue';
import InventoryListPage from '../features/inventory/InventoryListPage.vue';
import CreateItemPage from '../features/inventory/CreateItemPage.vue';
import ItemDetailPage from '../features/inventory/ItemDetailPage.vue';
import EditItemPage from '../features/inventory/EditItemPage.vue';
import CategoryListPage from '../features/categories/CategoryListPage.vue';
import CreateCategoryPage from '../features/categories/CreateCategoryPage.vue';
import EditCategoryPage from '../features/categories/EditCategoryPage.vue';
import { useAuthStore } from '../shared/stores/authStore';
import { useRouteUiStore } from '../shared/stores/routeUiStore'; // Added import for route UI store

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    guestOnly?: boolean;
  }
}

const authenticatedRoutes = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/inventory',
    name: 'inventory',
    component: InventoryListPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/inventory/create',
    name: 'inventory-create',
    component: CreateItemPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/inventory/:id',
    name: 'inventory-detail',
    component: ItemDetailPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/inventory/:id/edit',
    name: 'inventory-edit',
    component: EditItemPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/categories',
    name: 'categories',
    component: CategoryListPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/categories/create',
    name: 'category-create',
    component: CreateCategoryPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/categories/:id/edit',
    name: 'category-edit',
    component: EditCategoryPage,
    meta: { requiresAuth: true },
  },
];

const publicRoutes = [
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { guestOnly: true },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterPage,
    meta: { guestOnly: true },
  },
];

const routes = [...authenticatedRoutes, ...publicRoutes];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to) => {
  const authStore = useAuthStore();
  const routeUi = useRouteUiStore();

  routeUi.startNavigation();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    };
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: 'dashboard' };
  }

  return true;
});

router.afterEach(() => {
  const routeUi = useRouteUiStore();
  routeUi.finishNavigation();
});

router.onError((err) => {
  const routeUi = useRouteUiStore();
  routeUi.setNavigationError(String(err instanceof Error ? err.message : err));
});

export default router;
