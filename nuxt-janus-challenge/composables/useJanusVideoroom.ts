import { ref } from 'vue'
import { useRuntimeConfig } from '#app'
import { Janus } from 'typed_janus_js'

type Status = 'idle' | 'connecting' | 'connected' | 'joined' | 'publishing' | 'published' | 'leaving' | 'error'

export function useJanusVideoroom() {
  const config = useRuntimeConfig()
  const janus = ref<any>(null)
  const pluginHandle = ref<any>(null)
  const status = ref<Status>('idle')
  const error = ref<string | null>(null)
  const localStream = ref<MediaStream | null>(null)
  const roomId = ref<number | null>(1234)
  const publisherId = ref<number | null>(null)

  async function initJanus() {
    if (janus.value) return
    status.value = 'connecting'
    await Janus.init({ debug: true })
    janus.value = new Janus({
      server: config.public.janusWs,
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      success: () => { status.value = 'connected' },
      error: (err: any) => { status.value = 'error'; error.value = String(err) },
      destroyed: () => {}
    })
  }

  function attachVideoroom() {
    return new Promise<void>((resolve, reject) => {
      janus.value?.attach({
        plugin: 'janus.plugin.videoroom',
        success: (handle: any) => { pluginHandle.value = handle; resolve() },
        error: (err: any) => reject(err),
        onmessage: (msg: any, jsep: any) => {
          if (msg?.videoroom === 'joined') {
            publisherId.value = msg.id
            status.value = 'joined'
            if (jsep) pluginHandle.value?.handleRemoteJsep({ jsep })
          }
          if (msg?.videoroom === 'event' && msg.publishing === 'ok') status.value = 'published'
          if (jsep) pluginHandle.value?.handleRemoteJsep({ jsep })
        },
        onlocalstream: (stream: MediaStream) => { localStream.value = stream },
        oncleanup: () => {}
      })
    })
  }

  async function joinRoom() {
    if (!pluginHandle.value) await attachVideoroom()
    pluginHandle.value.send({ message: { request: 'join', ptype: 'publisher', room: roomId.value } })
  }

  async function publish() {
    status.value = 'publishing'
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    localStream.value = stream
    const offer = await pluginHandle.value.createOffer({ media: { audio: true, video: true, data: false }, stream })
    pluginHandle.value.send({ message: { request: 'publish', audio: true, video: true }, jsep: offer })
  }

  async function leave() {
    status.value = 'leaving'
    try {
      pluginHandle.value?.send({ message: { request: 'leave' } })
      pluginHandle.value?.hangup()
      pluginHandle.value?.detach()
    } finally {
      pluginHandle.value = null
      janus.value?.destroy()
      janus.value = null
      localStream.value?.getTracks().forEach(t => t.stop())
      localStream.value = null
      status.value = 'idle'
    }
  }

  return { status, error, localStream, roomId, publisherId, initJanus, joinRoom, publish, leave }
}
