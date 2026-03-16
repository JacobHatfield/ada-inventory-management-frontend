import { createRouter, createWebHistory } from 'vue-router'

import DashboardPage from '../app/pages/DashboardPage.vue'
import LoginPage from '../app/pages/LoginPage.vue'
import { useAuthStore } from '../shared/stores/authStore'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    guestOnly?: boolean
  }
}

const authenticatedRoutes = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true },
  },
]

const publicRoutes = [
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { guestOnly: true },
  },
]

const routes = [...authenticatedRoutes, ...publicRoutes]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: 'dashboard' }
  }

  return true
})

export default router
