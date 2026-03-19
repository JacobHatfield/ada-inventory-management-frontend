<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <div class="w-full max-w-sm">
      <!-- Header -->
      <div class="mb-8 text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">ADA Inventory</p>
        <h1 class="mt-1 text-2xl font-bold text-slate-900">Create your account</h1>
      </div>

      <!-- Card -->
      <div class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <!-- Server error -->
        <div
          v-if="authStore.registerError"
          class="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {{ authStore.registerError }}
        </div>

        <form novalidate @submit="onSubmit">
          <!-- Full name -->
          <div class="mb-4">
            <label class="mb-1.5 block text-sm font-medium text-slate-700" for="full_name">
              Full name
              <span class="ml-1 text-xs font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="full_name"
              v-model="fullName"
              type="text"
              autocomplete="name"
              placeholder="Jane Smith"
              :class="[
                'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition',
                fullNameError
                  ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                  : 'border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200',
              ]"
            />
            <p v-if="fullNameError" class="mt-1.5 text-xs text-red-600">{{ fullNameError }}</p>
          </div>

          <!-- Email -->
          <div class="mb-4">
            <label class="mb-1.5 block text-sm font-medium text-slate-700" for="email">
              Email address
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="you@example.com"
              :class="[
                'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition',
                emailError
                  ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                  : 'border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200',
              ]"
            />
            <p v-if="emailError" class="mt-1.5 text-xs text-red-600">{{ emailError }}</p>
          </div>

          <!-- Password -->
          <div class="mb-4">
            <label class="mb-1.5 block text-sm font-medium text-slate-700" for="password">
              Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="new-password"
              placeholder="••••••••"
              :class="[
                'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition',
                passwordError
                  ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                  : 'border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200',
              ]"
            />
            <p v-if="passwordError" class="mt-1.5 text-xs text-red-600">{{ passwordError }}</p>
          </div>

          <!-- Confirm password -->
          <div class="mb-6">
            <label class="mb-1.5 block text-sm font-medium text-slate-700" for="confirm_password">
              Confirm password
            </label>
            <input
              id="confirm_password"
              v-model="confirmPassword"
              type="password"
              autocomplete="new-password"
              placeholder="••••••••"
              :class="[
                'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition',
                confirmPasswordError
                  ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                  : 'border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200',
              ]"
            />
            <p v-if="confirmPasswordError" class="mt-1.5 text-xs text-red-600">
              {{ confirmPasswordError }}
            </p>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="authStore.isRegistering"
            class="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              v-if="authStore.isRegistering"
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
            {{ authStore.isRegistering ? 'Creating account…' : 'Create account' }}
          </button>
        </form>
      </div>

      <!-- Login link -->
      <p class="mt-6 text-center text-sm text-slate-500">
        Already have an account?
        <RouterLink to="/login" class="font-medium text-slate-900 hover:underline">
          Sign in
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useField, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/shared/stores/authStore';

const authStore = useAuthStore();
const router = useRouter();

const schema = toTypedSchema(
  z
    .object({
      full_name: z.string().optional(),
      email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
      password: z
        .string()
        .min(1, 'Password is required')
        .min(8, 'Password must be at least 8 characters'),
      confirm_password: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.password === data.confirm_password, {
      message: 'Passwords do not match',
      path: ['confirm_password'],
    }),
);

const { handleSubmit } = useForm({ validationSchema: schema });
const { value: fullName, errorMessage: fullNameError } = useField<string>('full_name');
const { value: email, errorMessage: emailError } = useField<string>('email');
const { value: password, errorMessage: passwordError } = useField<string>('password');
const { value: confirmPassword, errorMessage: confirmPasswordError } =
  useField<string>('confirm_password');

const onSubmit = handleSubmit(async (values) => {
  try {
    await authStore.register({
      email: values.email,
      password: values.password,
      full_name: values.full_name || undefined,
    });
    await router.push({ name: 'dashboard' });
  } catch {
    // registerError is set in the store — displayed in the template above
  }
});
</script>
