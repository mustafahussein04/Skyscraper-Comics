<template>
  <div class="space-y-8">
    <section class="rounded-2xl bg-gradient-to-r from-blue-900 to-violet-700 p-6 text-white sm:p-8">
      <p class="mb-2 text-sm font-semibold uppercase tracking-widest text-violet-200">
        Dashboard home
      </p>
      <h2 class="text-3xl font-bold">Welcome to the admin dashboard</h2>
      <p class="mt-3 max-w-2xl text-blue-100">
        Use the sidebar to move between management areas. Admin actions and live reporting will be
        connected in future work.
      </p>
    </section>

    <section aria-labelledby="overview-heading">
      <div class="mb-4 flex items-center justify-between">
        <h2 id="overview-heading" class="text-xl font-bold text-gray-900">At a glance</h2>
        <span class="text-sm text-gray-500">UI preview</span>
      </div>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="item in overviewItems"
          :key="item.label"
          class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <p class="text-sm font-medium text-gray-500">{{ item.label }}</p>
          <p class="mt-2 text-lg font-bold text-gray-900">{{ item.status }}</p>
          <p class="mt-1 text-sm text-gray-500">{{ item.description }}</p>
        </article>
      </div>
    </section>

    <section aria-labelledby="quick-links-heading">
      <h2 id="quick-links-heading" class="mb-4 text-xl font-bold text-gray-900">Quick links</h2>
      <div class="grid gap-4 md:grid-cols-2">
        <RouterLink
          v-for="link in quickLinks"
          :key="link.path"
          :to="link.path"
          class="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-violet-300 hover:shadow-md"
        >
          <div class="flex items-center justify-between gap-4">
            <div>
              <h3 class="font-bold text-gray-900 group-hover:text-violet-700">{{ link.label }}</h3>
              <p class="mt-1 text-sm text-gray-500">{{ link.description }}</p>
            </div>
            <span class="text-xl text-violet-600" aria-hidden="true">&rarr;</span>
          </div>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const overviewItems = [
  { label: 'Products', status: 'Ready for setup', description: 'Catalog management area' },
  { label: 'Orders', status: 'Ready for setup', description: 'Order management area' },
  { label: 'Events', status: 'Ready for setup', description: 'Event management area' },
  { label: 'Customers', status: 'Ready for setup', description: 'Customer management area' },
]

const quickLinks = [
  { label: 'Manage products', path: '/admin/products', description: 'Open the product workspace' },
  { label: 'Review orders', path: '/admin/orders', description: 'Open the order workspace' },
  { label: 'Manage events', path: '/admin/events', description: 'Open the event workspace' },
  { label: 'View customers', path: '/admin/customers', description: 'Open the customer workspace' },
]
</script>
