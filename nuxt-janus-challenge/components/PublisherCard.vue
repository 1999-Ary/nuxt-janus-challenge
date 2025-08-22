<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Publisher</h3>
        <UBadge :color="badgeColor">{{ statusText }}</UBadge>
      </div>
    </template>

    <div class="space-y-4">
      <video
        v-if="localStream"
        ref="videoEl"
        autoplay
        playsinline
        muted
        class="w-full rounded bg-black aspect-video"
      ></video>
      <div v-else class="w-full aspect-video rounded bg-gray-900 flex items-center justify-center text-gray-300">
        Local preview
      </div>

      <div class="flex gap-3">
        <UButton :disabled="connecting" @click="onJoin" color="primary">Join Room</UButton>
        <UButton :disabled="!canPublish" @click="onPublish" color="primary" variant="solid">Publish</UButton>
        <UButton :disabled="!canLeave" @click="onLeave" color="red" variant="soft">Leave</UButton>
      </div>

      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
      <p class="text-sm text-gray-500">Room: {{ roomId ?? '-' }} | Publisher ID: {{ publisherId ?? '-' }}</p>
    </div>
  </UCard>
</template>
<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  status: string
  error: string | null
  localStream: MediaStream | null
  roomId: number | null
  publisherId: number | null
  onJoin: () => void
  onPublish: () => void
  onLeave: () => void
}>()

const videoEl = ref<HTMLVideoElement | null>(null)

watch(() => props.localStream, (s) => {
  if (videoEl.value && s) {
    videoEl.value.srcObject = s
  }
})

const statusText = computed(() => {
  const map: Record<string, string> = {
    idle: 'Idle',
    connecting: 'Connecting',
    connected: 'Connected',
    joined: 'Joined',
    publishing: 'Publishing',
    published: 'Published',
    leaving: 'Leaving',
    error: 'Error'
  }
  return map[props.status] ?? props.status
})

const badgeColor = computed(() => {
  switch (props.status) {
    case 'connected': return 'green'
    case 'joined': return 'green'
    case 'publishing': return 'yellow'
    case 'published': return 'primary'
    case 'error': return 'red'
    default: return 'gray'
  }
})

const connecting = computed(() => props.status === 'connecting')
const canPublish = computed(() => props.status === 'joined' || props.status === 'connected')
const canLeave = computed(() => ['connected', 'joined', 'publishing', 'published'].includes(props.status))
</script>
