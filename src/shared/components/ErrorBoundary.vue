<template>
  <div>
    <slot v-if="!error" />

    <div v-else class="p-6">
      <div class="rounded-md border border-red-200 bg-red-50 p-4">
        <p class="font-semibold text-red-700">An unexpected error occurred</p>
        <pre class="mt-2 text-sm text-slate-700">{{ errorMessage }}</pre>
        <button
          class="mt-3 inline-flex items-center rounded bg-white px-3 py-1 text-sm font-medium"
          @click="clear"
        >
          Dismiss
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured, computed } from 'vue';

const error = ref<Error | null>(null);

onErrorCaptured((err) => {
  error.value = err as Error;
  return false;
});

function clear() {
  error.value = null;
}

const errorMessage = computed(() =>
  error.value ? String(error.value.stack || error.value.message) : '',
);
</script>

<style scoped></style>
