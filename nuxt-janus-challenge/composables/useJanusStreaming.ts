import { ref } from 'vue'
import { useRuntimeConfig } from '#app'
import { Janus } from 'typed_janus_js'

type StreamStatus = 'idle' | 'connecting' | 'attached' | 'playing' | 'stopped' | 'error'

export function useJanusStreaming() {
  const config = useRuntimeConfig()
  const janus = ref<any>(null)
  const pluginHandle = ref<any>(null)
  const status = ref<StreamStatus>('idle')
  const error = ref<string | null>(null)
  const remoteStream = ref<MediaStream | null>(null)
  const selectedMountpoint = ref<number | null>(null)

  async function initJanus() {
    if (janus.value) return
    status.value = 'connecting'
    await Janus.init({ debug: true })
    janus.value = new Janus({
      server: config.public.janusWs,
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      success: () => {
        janus.value?.attach({
          plugin: 'janus.plugin.streaming',
          success: (handle: any) => { pluginHandle.value = handle; status.value = 'attached' },
          error: (err: any) => { status.value = 'error'; error.value = String(err) },
          onmessage: (msg: any, jsep: any) => {
            if (jsep) pluginHandle.value?.handleRemoteJsep({ jsep })
            if (msg?.result === 'ok') status.value = 'playing'
          },
          onremotestream: (stream: MediaStream) => { remoteStream.value = stream },
          oncleanup: () => { remoteStream.value = null }
        })
      },
      error: (err: any) => { status.value = 'error'; error.value = String(err) }
    })
  }

  async function play() {
    if (!pluginHandle.value || !selectedMountpoint.value) return
    pluginHandle.value.send({ message: { request: 'watch', id: selectedMountpoint.value } })
  }

  async function stop() {
    if (!pluginHandle.value) return
    pluginHandle.value.send({ message: { request: 'stop' } })
    pluginHandle.value.hangup()
    remoteStream.value = null
    status.value = 'stopped'
  }

  function destroy() {
    try {
      pluginHandle.value?.detach()
      janus.value?.destroy()
    } catch {}
    pluginHandle.value = null
    janus.value = null
    remoteStream.value = null
    status.value = 'idle'
  }

  return { status, error, remoteStream, selectedMountpoint, initJanus, play, stop, destroy }
}
