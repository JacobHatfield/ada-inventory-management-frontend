import { createRouter, createWebHistory } from 'vue-router'

import DashboardPage from '../app/pages/DashboardPage.vue'
import LoginPage from '../app/pages/LoginPage.vue'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardPage,
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
