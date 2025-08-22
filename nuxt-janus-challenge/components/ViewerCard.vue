<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Viewer</h3>
        <UBadge :color="badgeColor">{{ statusText }}</UBadge>
      </div>
    </template>

    <div class="space-y-4">
      <USelect
        v-model="model"
        :options="options"
        option-attribute="label"
        value-attribute="value"
        placeholder="Select a mountpoint"
      />

      <video
        v-if="remoteStream"
        :key="videoKey"
        ref="videoEl"
        autoplay
        playsinline
        controls
        class="w-full rounded bg-black aspect-video"
      ></video>
      <div v-else class="w-full aspect-video rounded bg-gray-900 flex items-center justify-center text-gray-300">
        Remote player
      </div>

      <div class="flex gap-3">
        <UButton :disabled="!canPlay" @click="onPlay" color="primary">Play</UButton>
        <UButton :disabled="!canStop" @click="onStop" color="red" variant="soft">Stop</UButton>
      </div>

      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  status: string
  error: string | null
  remoteStream: MediaStream | null
  options: Array<{ label: string; value: number }>
  modelValue: number | null
  onPlay: () => void
  onStop: () => void
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: number | null): void
}>()

const videoEl = ref<HTMLVideoElement | null>(null)
const videoKey = computed(() => (props.remoteStream ? props.remoteStream.id || 'remote' : 'no-remote'))

watch(
  () => props.remoteStream,
  (s) => { if (videoEl.value) videoEl.value.srcObject = s ?? null }
)

const model = computed<number | undefined>({
  get: () => props.modelValue ?? undefined, 
  set: (v) => emit('update:modelValue', v ?? null)
})
const statusText = computed(() => {
  const map: Record<string, string> = {
    idle: 'Idle',
    connecting: 'Connecting',
    attached: 'Attached',
    playing: 'Playing',
    stopped: 'Stopped',
    error: 'Error'
  }
  return map[props.status] ?? props.status
})

const badgeColor = computed(() => {
  switch (props.status) {
    case 'attached': return 'green'
    case 'playing': return 'primary'
    case 'stopped': return 'gray'
    case 'error': return 'red'
    default: return 'gray'
  }
})

const canPlay = computed(() => !!props.modelValue && (props.status === 'attached' || props.status === 'stopped'))
const canStop = computed(() => props.status === 'playing')
</script>
