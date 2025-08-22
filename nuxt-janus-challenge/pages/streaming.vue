<template>
  <div class="max-w-3xl mx-auto p-6 space-y-6">
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">Available Mountpoints</h3>
      </template>
      <div class="flex items-center gap-3">
        <UButton @click="loadMountpoints" variant="soft">Refresh</UButton>
        <span class="text-sm text-gray-500">Pick a mountpoint to view</span>
      </div>
      <ul class="mt-4 space-y-1 text-sm">
        <li v-for="m in mountpoints" :key="m.id" class="text-gray-700">
          #{{ m.id }} — {{ m.description }} (room {{ m.roomId ?? '-' }}, stream {{ m.streamId ?? '-' }})
        </li>
      </ul>
    </UCard>

    <ViewerCard
      :status="status"
      :error="error"
      :remoteStream="remoteStream"
      :options="selectOptions"
      :modelValue="selected ?? null"
      @update:modelValue="onSelectChange"
      :onPlay="handlePlay"
      :onStop="handleStop"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { $fetch } from 'ofetch'
import { useJanusStreaming } from '@/composables/useJanusStreaming'

interface Mountpoint {
  id: number
  description: string
  roomId?: number
  streamId?: number
}

const mountpoints = ref<Mountpoint[]>([])
const selected = ref<number | null>(null)

const {
  status,
  error,
  remoteStream,
  selectedMountpoint,
  initJanus,
  play,
  stop,
  destroy
} = useJanusStreaming()

onMounted(async () => {
  await initJanus()
  await loadMountpoints()
})

onBeforeUnmount(() => {
  destroy()
})

async function loadMountpoints() {
  try {
    const res = await $fetch<Mountpoint[]>('/api/mountpoints')
    mountpoints.value = res
  } catch (e) {
    console.error('Failed to load mountpoints:', e)
  }
}

const selectOptions = computed(() =>
  mountpoints.value.map(m => ({
    label: `#${m.id} — ${m.description}`,
    value: m.streamId || m.id
  }))
)
function onSelectChange(v: number | null) {
  selected.value = v
  selectedMountpoint.value = v
}

async function handlePlay() {
  selectedMountpoint.value = selected.value ?? null
  await play()
}
async function handleStop() {
  await stop()
}
</script>
