<template>
  <form novalidate class="space-y-5" @submit="onSubmit">
    <!-- Mutation error banner -->
    <div
      v-if="serverError"
      class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
    >
      {{ serverError }}
    </div>

    <!-- Name -->
    <div>
      <label class="mb-1.5 block text-sm font-medium text-slate-700" for="item-name">
        Name <span class="text-red-500">*</span>
      </label>
      <input
        id="item-name"
        v-model="name"
        type="text"
        placeholder="e.g. Widget A"
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
      <label class="mb-1.5 block text-sm font-medium text-slate-700" for="item-description">
        Description
        <span class="ml-1 text-xs font-normal text-slate-400">(optional)</span>
      </label>
      <textarea
        id="item-description"
        v-model="description"
        rows="3"
        placeholder="Describe this item…"
        :class="[
          'w-full resize-none rounded-lg border px-3 py-2.5 text-sm outline-none transition',
          descriptionError
            ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
            : 'border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200',
        ]"
      />
      <p v-if="descriptionError" class="mt-1.5 text-xs text-red-600">{{ descriptionError }}</p>
    </div>

    <!-- Quantity + Low stock threshold (side by side) -->
    <div class="grid gap-4 sm:grid-cols-2">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-slate-700" for="item-quantity">
          Quantity <span class="text-red-500">*</span>
        </label>
        <input
          id="item-quantity"
          v-model="quantity"
          type="number"
          min="0"
          step="1"
          placeholder="0"
          :class="[
            'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition',
            quantityError
              ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : 'border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200',
          ]"
        />
        <p v-if="quantityError" class="mt-1.5 text-xs text-red-600">{{ quantityError }}</p>
      </div>

      <div>
        <label
          class="mb-1.5 block text-sm font-medium text-slate-700"
          for="item-low-stock-threshold"
        >
          Low stock threshold
        </label>
        <input
          id="item-low-stock-threshold"
          v-model="lowStockThreshold"
          type="number"
          min="0"
          step="1"
          placeholder="0"
          :class="[
            'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition',
            lowStockThresholdError
              ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : 'border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200',
          ]"
        />
        <p v-if="lowStockThresholdError" class="mt-1.5 text-xs text-red-600">
          {{ lowStockThresholdError }}
        </p>
        <p class="mt-1 text-xs text-slate-400">Alert when stock falls below this number</p>
      </div>
    </div>

    <!-- Category selector -->
    <div>
      <label class="mb-1.5 block text-sm font-medium text-slate-700" for="item-category">
        Category
        <span class="ml-1 text-xs font-normal text-slate-400">(optional)</span>
      </label>
      <select
        id="item-category"
        v-model="categoryId"
        :class="[
          'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition',
          categoryIdError
            ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
            : 'border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200',
        ]"
      >
        <option :value="null">— No category —</option>
        <option v-for="cat in categoryStore.categories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>
      <p v-if="categoryIdError" class="mt-1.5 text-xs text-red-600">{{ categoryIdError }}</p>
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
import { watch, onMounted } from 'vue';
import { useField, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { useCategoryStore } from '@/features/categories/categoryStore';
import type { InventoryCreateRequest } from '@/shared/types';

interface Props {
  initialValues?: Partial<InventoryCreateRequest>;
  isSubmitting?: boolean;
  serverError?: string | null;
  submitLabel?: string;
  showCancel?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  initialValues: undefined,
  isSubmitting: false,
  serverError: null,
  submitLabel: 'Save item',
  showCancel: false,
});

const emit = defineEmits<{
  submit: [values: InventoryCreateRequest];
  cancel: [];
}>();

const categoryStore = useCategoryStore();

onMounted(() => {
  if (!categoryStore.hasCategories) {
    categoryStore.fetchCategories();
  }
});



const schema = toTypedSchema(
  z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional().nullable(),
    quantity: z.coerce
      .number({ invalid_type_error: 'Quantity must be a number' })
      .int('Quantity must be a whole number')
      .min(0, 'Quantity cannot be negative'),
    low_stock_threshold: z.coerce
      .number({ invalid_type_error: 'Threshold must be a number' })
      .int('Threshold must be a whole number')
      .min(0, 'Threshold cannot be negative')
      .optional()
      .default(0),
    category_id: z.number().nullable().optional(),
  }),
);

const { handleSubmit, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    name: props.initialValues?.name ?? '',
    description: props.initialValues?.description ?? '',
    quantity: props.initialValues?.quantity ?? 0,
    low_stock_threshold: props.initialValues?.low_stock_threshold ?? 0,
    category_id: props.initialValues?.category_id ?? null,
  },
});

const { value: name, errorMessage: nameError } = useField<string>('name');
const { value: description, errorMessage: descriptionError } = useField<string>('description');
const { value: quantity, errorMessage: quantityError } = useField<number>('quantity');
const { value: lowStockThreshold, errorMessage: lowStockThresholdError } =
  useField<number>('low_stock_threshold');
const { value: categoryId, errorMessage: categoryIdError } = useField<number | null>('category_id');

// Re-populate form when initialValues change (e.g. after async fetch in edit mode)
watch(
  () => props.initialValues,
  (next) => {
    if (next) {
      resetForm({
        values: {
          name: next.name ?? '',
          description: next.description ?? '',
          quantity: next.quantity ?? 0,
          low_stock_threshold: next.low_stock_threshold ?? 0,
          category_id: next.category_id ?? null,
        },
      });
    }
  },
);

const onSubmit = handleSubmit((values) => {
  emit('submit', {
    name: values.name,
    description: values.description ?? null,
    quantity: values.quantity,
    low_stock_threshold: values.low_stock_threshold ?? 0,
    category_id: values.category_id ?? null,
  });
});
</script>
