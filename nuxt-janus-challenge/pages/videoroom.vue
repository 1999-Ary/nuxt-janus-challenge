<template>
  <div class="max-w-3xl mx-auto p-6 space-y-6">
    <PublisherCard
      :status="status"
      :error="error"
      :localStream="localStream"
      :roomId="roomId"
      :publisherId="publisherId"
      :onJoin="handleJoin"
      :onPublish="handlePublish"
      :onLeave="handleLeave"
    />

    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">Mountpoint Registration</h3>
      </template>
      <div class="flex items-center gap-3">
        <UButton :disabled="!canRegister" @click="registerMountpoint" color="primary">
          Register Mountpoint
        </UButton>
        <span class="text-sm text-gray-600">After publishing, register your stream so viewers can see it.</span>
      </div>
      <p v-if="registerMsg" class="text-green-600 text-sm mt-2">{{ registerMsg }}</p>
      <p v-if="registerErr" class="text-red-600 text-sm mt-2">{{ registerErr }}</p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, type Ref } from 'vue'
import { $fetch } from 'ofetch';
import { useJanusVideoroom } from '@/composables/useJanusVideoroom';
interface JanusVideoroom {
  status: Ref<string>;
  error: Ref<string | null>;
  localStream: Ref<MediaStream | null>;
  roomId: Ref<number | null>;
  publisherId: Ref<number | null>;
  initJanus: () => Promise<void>;
  joinRoom: () => Promise<void>;
  publish: () => Promise<void>;
  leave: () => Promise<void>;
}

const {
  status,
  error,
  localStream,
  roomId,
  publisherId,
  initJanus,
  joinRoom,
  publish,
  leave,
} = useJanusVideoroom() as JanusVideoroom;

onMounted(() => {
  initJanus().catch((e) => console.error('Failed to initialize Janus:', e));
});
onBeforeUnmount(() => {
  leave().catch((e) => console.error('Failed to leave room:', e));
});

async function handleJoin() {
  try {
    await joinRoom();
  } catch (e) {
    console.error('Join failed:', e);
  }
}

async function handlePublish() {
  try {
    await publish();
  } catch (e) {
    console.error('Publish failed:', e);
  }
}

async function handleLeave() {
  try {
    await leave();
  } catch (e) {
    console.error('Leave failed:', e);
  }
}

const canRegister = computed(() => status.value === 'published');

const registerMsg = ref<string>('');
const registerErr = ref<string>('');

async function registerMountpoint() {
  registerMsg.value = '';
  registerErr.value = '';
  try {
    if (!roomId.value || !publisherId.value) {
      throw new Error('Room ID or Publisher ID is missing');
    }
    const body = {
      description: `Publisher ${publisherId.value} in room ${roomId.value}`,
      roomId: roomId.value,
      streamId: publisherId.value,
    };
    const res = await $fetch<{ id: number; description: string }>('/api/mountpoints', {
      method: 'POST',
      body,
    });
    registerMsg.value = `Registered mountpoint #${res.id} - "${res.description}"`;
  } catch (e: any) {
    registerErr.value = e.message || String(e);
  }
}
</script>