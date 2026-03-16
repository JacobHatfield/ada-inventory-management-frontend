<template>
  <section class="mx-auto max-w-md">
    <h2 class="text-2xl font-bold text-slate-900">Login</h2>
    <p class="mt-2 text-slate-600">Authentication form will be implemented in Phase 2.1.</p>

    <form class="mt-6 space-y-4">
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700" for="email">Email</label>
        <input
          id="email"
          type="email"
          class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          placeholder="you@example.com"
          disabled
        />
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700" for="password">Password</label>
        <input
          id="password"
          type="password"
          class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          placeholder="********"
          disabled
        />
      </div>

      <button
        type="button"
        class="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        disabled
      >
        Coming in Phase 2.1
      </button>
    </form>
  </section>
</template>
