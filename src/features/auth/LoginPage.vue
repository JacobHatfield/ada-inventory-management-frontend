<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <div class="w-full max-w-sm">
      <!-- Header -->
      <div class="mb-8 text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          ADA Inventory
        </p>
        <h1 class="mt-1 text-2xl font-bold text-slate-900">Sign in to your account</h1>
      </div>

      <!-- Card -->
      <div class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <!-- Server error -->
        <div
          v-if="authStore.loginError"
          class="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {{ authStore.loginError }}
        </div>

        <form novalidate @submit="onSubmit">
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
          <div class="mb-6">
            <label class="mb-1.5 block text-sm font-medium text-slate-700" for="password">
              Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="current-password"
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

          <!-- Submit -->
          <button
            type="submit"
            :disabled="authStore.isLoggingIn"
            class="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              v-if="authStore.isLoggingIn"
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
            {{ authStore.isLoggingIn ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>
      </div>

      <!-- Register link -->
      <p class="mt-6 text-center text-sm text-slate-500">
        Don't have an account?
        <RouterLink to="/register" class="font-medium text-slate-900 hover:underline">
          Create one
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
  z.object({
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters'),
  }),
);

const { handleSubmit } = useForm({ validationSchema: schema });
const { value: email, errorMessage: emailError } = useField<string>('email');
const { value: password, errorMessage: passwordError } = useField<string>('password');

const onSubmit = handleSubmit(async (values) => {
  try {
    await authStore.login({ email: values.email, password: values.password });
    await router.push({ name: 'dashboard' });
  } catch {
    // loginError is set in the store — displayed in the template above
  }
});
</script>
