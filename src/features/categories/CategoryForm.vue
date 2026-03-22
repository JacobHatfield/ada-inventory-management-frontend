<template>
  <form novalidate class="space-y-5" @submit="onSubmit">
    <!-- Server error -->
    <div
      v-if="serverError"
      class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
    >
      {{ serverError }}
    </div>

    <!-- Name -->
    <div>
      <label class="mb-1.5 block text-sm font-medium text-slate-700" for="category-name">
        Name <span class="text-red-500">*</span>
      </label>
      <input
        id="category-name"
        v-model="name"
        type="text"
        placeholder="e.g. Electronics"
        :class="[
          'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition',
          nameError
            ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
            : 'border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200',
        ]"
      />
      <p v-if="nameError" class="mt-1.5 text-xs text-red-600">{{ nameError }}</p>
    </div>

    <!-- Description -->
    <div>
      <label class="mb-1.5 block text-sm font-medium text-slate-700" for="category-description">
        Description
        <span class="ml-1 text-xs font-normal text-slate-400">(optional)</span>
      </label>
      <textarea
        id="category-description"
        v-model="description"
        rows="3"
        placeholder="Describe this category…"
        :class="[
          'w-full resize-none rounded-lg border px-3 py-2.5 text-sm outline-none transition',
          descriptionError
            ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
            : 'border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200',
        ]"
      />
      <p v-if="descriptionError" class="mt-1.5 text-xs text-red-600">{{ descriptionError }}</p>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-3 pt-2">
      <button
        type="submit"
        :disabled="isSubmitting"
        class="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg
          v-if="isSubmitting"
          class="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        {{ isSubmitting ? 'Saving…' : submitLabel }}
      </button>

      <button
        v-if="showCancel"
        type="button"
        class="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        @click="emit('cancel')"
      >
        Cancel
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useField, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import type { CategoryCreateRequest } from '@/shared/types';

interface Props {
  initialValues?: Partial<CategoryCreateRequest>;
  isSubmitting?: boolean;
  serverError?: string | null;
  submitLabel?: string;
  showCancel?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  initialValues: undefined,
  isSubmitting: false,
  serverError: null,
  submitLabel: 'Save category',
  showCancel: false,
});

const emit = defineEmits<{
  submit: [values: CategoryCreateRequest];
  cancel: [];
}>();

const schema = toTypedSchema(
  z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional().nullable(),
  }),
);

const { handleSubmit, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    name: props.initialValues?.name ?? '',
    description: props.initialValues?.description ?? '',
  },
});

const { value: name, errorMessage: nameError } = useField<string>('name');
const { value: description, errorMessage: descriptionError } = useField<string>('description');

// Repopulate when initialValues change (edit mode async fetch)
watch(
  () => props.initialValues,
  (next) => {
    if (next) {
      resetForm({
        values: {
          name: next.name ?? '',
          description: next.description ?? '',
        },
      });
    }
  },
);

const onSubmit = handleSubmit((values) => {
  emit('submit', {
    name: values.name,
    description: values.description ?? null,
  });
});
</script>
