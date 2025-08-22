<template>
  <div class="p-6">
    <UCard>
      <template #header>
        <h1 class="text-xl font-semibold">Nuxt is running</h1>
      </template>
      <p class="text-gray-600">If you see this page, macros and types are set correctly.</p>
      <div class="mt-4 flex gap-3">
        <UButton to="/videoroom" color="primary">Go to Publisher</UButton>
        <UButton to="/streaming" variant="soft">Go to Viewer</UButton>
      </div>
    </UCard>
  </div>
</template>
