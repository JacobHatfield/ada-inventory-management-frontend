import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'

import { useAuthStore } from './shared/stores/authStore'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)

// Initialize auth session before mounting so protected routes can rely on restored session
const authStore = useAuthStore()
authStore.initializeSession().catch(() => {})

app.mount('#app')
