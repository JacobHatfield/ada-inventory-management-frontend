<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <div class="w-full max-w-sm">
      <!-- Header -->
      <div class="mb-8 text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">ADA Inventory</p>
        <h1 class="mt-1 text-2xl font-bold text-slate-900">Set new password</h1>
        <p class="mt-2 text-sm text-slate-500">
          Almost there! Please choose a strong new password for your account.
        </p>
      </div>

      <!-- Card -->
      <div class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <!-- Success state -->
        <div v-if="isReset" class="text-center">
          <div
            class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 class="text-lg font-semibold text-slate-900">Password reset</h2>
          <p class="mt-2 text-sm text-slate-600">
            Your password has been successfully updated. You can now sign in with your new
            credentials.
          </p>
          <div class="mt-8">
            <RouterLink
              to="/login"
              class="flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Sign in now
            </RouterLink>
          </div>
        </div>

        <!-- Token missing error -->
        <div v-else-if="!token" class="text-center">
          <div
            class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 class="text-lg font-semibold text-slate-900">Invalid reset link</h2>
          <p class="mt-2 text-sm text-slate-600">
            The reset link is missing or invalid. Please request a new one.
          </p>
          <div class="mt-8">
            <RouterLink
              to="/forgot-password"
              class="text-sm font-semibold text-slate-900 hover:underline"
            >
              Back to reset request
            </RouterLink>
          </div>
        </div>

        <!-- Form state -->
        <template v-else>
          <!-- Server error -->
          <div
            v-if="authStore.resetError"
            class="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {{ authStore.resetError }}
          </div>

          <form novalidate @submit="onSubmit">
            <!-- New Password -->
            <div class="mb-4">
              <label class="mb-1.5 block text-sm font-medium text-slate-700" for="new_password">
                New password
              </label>
              <input
                id="new_password"
                v-model="new_password"
                type="password"
                autocomplete="new-password"
                placeholder="••••••••"
                :class="[
                  'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition',
                  new_passwordError
                    ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200',
                ]"
              />
              <p v-if="new_passwordError" class="mt-1.5 text-xs text-red-600">
                {{ new_passwordError }}
              </p>
            </div>

            <!-- Confirm Password -->
            <div class="mb-6">
              <label class="mb-1.5 block text-sm font-medium text-slate-700" for="confirm_password">
                Confirm new password
              </label>
              <input
                id="confirm_password"
                v-model="confirm_password"
                type="password"
                autocomplete="new-password"
                placeholder="••••••••"
                :class="[
                  'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition',
                  confirm_passwordError
                    ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200',
                ]"
              />
              <p v-if="confirm_passwordError" class="mt-1.5 text-xs text-red-600">
                {{ confirm_passwordError }}
              </p>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              :disabled="authStore.isResettingPassword"
              class="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg
                v-if="authStore.isResettingPassword"
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
              {{ authStore.isResettingPassword ? 'Updating…' : 'Update password' }}
            </button>
          </form>
        </template>
      </div>

      <!-- Links -->
      <p v-if="!isReset && token" class="mt-6 text-center text-sm text-slate-500">
        Already have access?
        <RouterLink to="/login" class="font-medium text-slate-900 hover:underline">
          Sign in
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useField, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { useAuthStore } from '@/shared/stores/authStore';
import { useNotificationStore } from '@/shared/stores/notificationStore';

const route = useRoute();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const isReset = ref(false);
const token = ref<string | null>(null);

onMounted(() => {
  // Capture token from query param (e.g. ?token=XYZ)
  token.value = (route.query.token as string) || null;
});

const schema = toTypedSchema(
  z
    .object({
      new_password: z
        .string()
        .min(1, 'Password is required')
        .min(8, 'Password must be at least 8 characters'),
      confirm_password: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.new_password === data.confirm_password, {
      message: "Passwords don't match",
      path: ['confirm_password'],
    }),
);

const { handleSubmit } = useForm({ validationSchema: schema });
const { value: new_password, errorMessage: new_passwordError } = useField<string>('new_password');
const { value: confirm_password, errorMessage: confirm_passwordError } =
  useField<string>('confirm_password');

const onSubmit = handleSubmit(async (values) => {
  if (!token.value) return;

  try {
    await authStore.resetPassword({
      token: token.value,
      new_password: values.new_password,
    });
    isReset.value = true;
    notificationStore.success('Password updated successfully. Please sign in.');
  } catch (error) {
    notificationStore.handleEmailError(error);
  }
});
</script>
