<template>
  <div class="min-h-screen bg-slate-100 text-slate-900">
    <ErrorBoundary>
      <header class="border-b border-slate-200 bg-white">
        <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              ADA Inventory
            </p>
            <h1 class="text-lg font-bold">Inventory Management</h1>
          </div>
          <button
            type="button"
            class="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </header>

      <div class="mx-auto grid max-w-7xl gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[16rem_1fr] lg:px-8">
        <aside class="rounded-xl border border-slate-200 bg-white p-4">
          <p class="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Navigation
          </p>
          <nav class="space-y-2">
            <RouterLink
              to="/"
              class="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              active-class="bg-slate-900 text-white hover:bg-slate-900"
            >
              Dashboard
            </RouterLink>
            <RouterLink
              to="/login"
              class="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              active-class="bg-slate-900 text-white hover:bg-slate-900"
            >
              Login
            </RouterLink>
          </nav>
        </aside>

        <main class="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <RouterView />
        </main>
      </div>
      <GlobalLoading />
    </ErrorBoundary>
  </div>
</template>

<script setup lang="ts">
import GlobalLoading from '../../shared/components/GlobalLoading.vue';
import ErrorBoundary from '../../shared/components/ErrorBoundary.vue';
</script>
