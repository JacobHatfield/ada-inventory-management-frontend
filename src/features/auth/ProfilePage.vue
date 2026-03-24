<template>
  <div class="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-slate-900">Your Profile</h1>
      <p class="mt-1 text-sm text-slate-500">Manage your account information and preferences.</p>
    </header>

    <div class="space-y-6">
      <!-- Profile Card -->
      <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="p-6 sm:p-8">
          <div class="flex flex-col gap-8 sm:flex-row">
            <!-- Left: Avatar / Image -->
            <div class="flex flex-col items-center gap-4">
              <div class="relative h-24 w-24 overflow-hidden rounded-full border-4 border-slate-50 bg-slate-100 shadow-inner">
                <img
                  v-if="userProfile?.profile_image_url"
                  :src="userProfile.profile_image_url"
                  alt="Profile"
                  class="h-full w-full object-cover"
                  @error="onImageError"
                />
                <div v-else class="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                  <svg class="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <p class="text-xs font-medium text-slate-400 uppercase tracking-wider">Avatar</p>
            </div>

            <!-- Right: Details Form -->
            <div class="flex-1">
              <!-- Loading State -->
              <div v-if="authStore.isFetchingProfile" class="space-y-5">
                <div class="h-4 w-1/4 animate-pulse rounded bg-slate-100" />
                <div class="h-10 w-full animate-pulse rounded bg-slate-100" />
                <div class="h-4 w-1/4 animate-pulse rounded bg-slate-100" />
                <div class="h-10 w-full animate-pulse rounded bg-slate-100" />
              </div>

              <!-- Form -->
              <form v-else novalidate class="space-y-5" @submit="onSubmit">
                <!-- Success/Error Banners -->
                <div
                  v-if="authStore.profileError"
                  class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {{ authStore.profileError }}
                </div>

                <div class="grid gap-5 sm:grid-cols-2">
                  <!-- Full Name -->
                  <div class="sm:col-span-2">
                    <label class="mb-1.5 block text-sm font-medium text-slate-700" for="full_name">
                      Full Name
                    </label>
                    <input
                      id="full_name"
                      v-model="full_name"
                      type="text"
                      placeholder="Jane Doe"
                      :class="[
                        'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition',
                        full_nameError
                          ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                          : 'border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200',
                      ]"
                    />
                    <p v-if="full_nameError" class="mt-1.5 text-xs text-red-600">{{ full_nameError }}</p>
                  </div>

                  <!-- Email (Read only in this view or editable if backend supports it) -->
                  <div class="sm:col-span-2">
                    <label class="mb-1.5 block text-sm font-medium text-slate-700" for="email">
                      Email Address
                    </label>
                    <input
                      id="email"
                      v-model="email"
                      type="email"
                      placeholder="jane@example.com"
                      :class="[
                        'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition',
                        emailError
                          ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                          : 'border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200',
                      ]"
                    />
                    <p v-if="emailError" class="mt-1.5 text-xs text-red-600">{{ emailError }}</p>
                  </div>

                  <!-- Profile Image URL -->
                  <div class="sm:col-span-2">
                    <label class="mb-1.5 block text-sm font-medium text-slate-700" for="profile_image_url">
                      Profile Image URL
                    </label>
                    <input
                      id="profile_image_url"
                      v-model="profile_image_url"
                      type="url"
                      placeholder="https://example.com/photo.jpg"
                      :class="[
                        'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition',
                        profile_image_urlError
                          ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                          : 'border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200',
                      ]"
                    />
                    <p v-if="profile_image_urlError" class="mt-1.5 text-xs text-red-600">
                      {{ profile_image_urlError }}
                    </p>
                    <p class="mt-1.5 text-xs text-slate-400">
                      Provide a URL for your avatar image (e.g., from Unsplash or GitHub).
                    </p>
                  </div>
                </div>

                <!-- Submit -->
                <div class="flex items-center justify-end pt-4">
                  <button
                    type="submit"
                    :disabled="authStore.isUpdatingProfile"
                    class="flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <svg
                      v-if="authStore.isUpdatingProfile"
                      class="h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {{ authStore.isUpdatingProfile ? 'Saving Changes...' : 'Save Profile' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <!-- Security / Info Section -->
      <section class="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
        <h3 class="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2">Account Security</h3>
        <p class="text-sm text-slate-600">
          Your account was created on <span class="font-medium text-slate-900">{{ formatDate(userProfile?.created_at) }}</span>.
          Last updated on <span class="font-medium text-slate-900">{{ formatDate(userProfile?.updated_at) }}</span>.
        </p>
        <div class="mt-4">
          <RouterLink to="/forgot-password" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Need to change your password?
          </RouterLink>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useField, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { useAuthStore } from '@/shared/stores/authStore';
import { useNotificationStore } from '@/shared/stores/notificationStore';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const { userProfile } = storeToRefs(authStore);

// Validation Schema
const schema = toTypedSchema(
  z.object({
    full_name: z.string().min(1, 'Full name is required').max(100),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    profile_image_url: z.string().url('Please enter a valid image URL').optional().nullable().or(z.literal('')),
  })
);

const { handleSubmit, resetForm } = useForm({
  validationSchema: schema,
});

const { value: full_name, errorMessage: full_nameError } = useField<string>('full_name');
const { value: email, errorMessage: emailError } = useField<string>('email');
const { value: profile_image_url, errorMessage: profile_image_urlError } = useField<string | null>('profile_image_url');

// Initialize form with store data
const syncFormWithStore = () => {
  if (userProfile.value) {
    resetForm({
      values: {
        full_name: userProfile.value.full_name ?? '',
        email: userProfile.value.email ?? '',
        profile_image_url: userProfile.value.profile_image_url ?? '',
      },
    });
  }
};

onMounted(async () => {
  try {
    await authStore.fetchProfile();
    syncFormWithStore();
  } catch (error) {
    notificationStore.error('Could not load profile information.');
  }
});

// Watch for store updates (e.g. if profile fetches slowly)
watch(userProfile, (newProfile) => {
  if (newProfile && !full_name.value) {
    syncFormWithStore();
  }
});

const onSubmit = handleSubmit(async (values) => {
  try {
    await authStore.updateProfile({
      full_name: values.full_name,
      email: values.email,
      profile_image_url: values.profile_image_url || null,
    });
    notificationStore.success('Profile updated successfully!');
  } catch (error) {
    notificationStore.error('Failed to update profile. Please try again.');
  }
});

const formatDate = (iso?: string) => {
  if (!iso) return 'N/A';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const onImageError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.style.display = 'none';
};
</script>
