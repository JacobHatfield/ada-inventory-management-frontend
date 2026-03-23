<template>
  <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div class="flex items-center gap-4">
      <div
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
        :class="colorClasses"
      >
        <slot name="icon" />
      </div>
      <div>
        <p class="text-sm font-medium text-slate-500">{{ title }}</p>
        <div class="flex items-baseline gap-2">
          <p class="text-2xl font-bold text-slate-900">{{ value }}</p>
          <span
            v-if="trend"
            class="text-sm font-medium"
            :class="trend > 0 ? 'text-emerald-600' : 'text-red-600'"
          >
            {{ trend > 0 ? '+' : '' }}{{ trend }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  value: number | string;
  trend?: number;
  colorTheme?: 'blue' | 'emerald' | 'amber' | 'red' | 'purple';
}>();

const colorClasses = computed(() => {
  switch (props.colorTheme) {
    case 'blue':
      return 'bg-blue-50 text-blue-600';
    case 'emerald':
      return 'bg-emerald-50 text-emerald-600';
    case 'amber':
      return 'bg-amber-50 text-amber-600';
    case 'red':
      return 'bg-red-50 text-red-600';
    case 'purple':
      return 'bg-purple-50 text-purple-600';
    default:
      return 'bg-slate-50 text-slate-600';
  }
});
</script>
