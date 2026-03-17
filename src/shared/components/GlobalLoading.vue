<template>
  <div v-if="isNavigating" class="fixed inset-0 z-50 flex items-start justify-center pointer-events-none">
    <div class="mt-4 w-full max-w-3xl px-4">
      <div class="h-1 w-full overflow-hidden rounded bg-slate-200">
        <div class="h-1 bg-sky-600 animate-loading" :style="{ width: '60%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouteUiStore } from '../stores/routeUiStore'

const store = useRouteUiStore()
const isNavigating = computed(() => store.isNavigating)
</script>

<style scoped>
@keyframes loading {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(0%); }
  100% { transform: translateX(100%); }
}
.animate-loading {
  animation: loading 1.2s linear infinite;
}
</style>
