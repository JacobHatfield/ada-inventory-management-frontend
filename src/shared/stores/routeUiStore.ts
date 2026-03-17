import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useRouteUiStore = defineStore('route-ui', () => {
  const isNavigating = ref(false)
  const navigationError = ref<string | null>(null)

  function startNavigation(): void {
    isNavigating.value = true
    navigationError.value = null
  }

  function finishNavigation(): void {
    isNavigating.value = false
  }

  function setNavigationError(message: string): void {
    isNavigating.value = false
    navigationError.value = message
  }

  function clearNavigationError(): void {
    navigationError.value = null
  }

  return {
    isNavigating,
    navigationError,
    startNavigation,
    finishNavigation,
    setNavigationError,
    clearNavigationError,
  }
})
