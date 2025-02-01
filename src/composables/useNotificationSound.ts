import { ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'

export function useNotificationSound() {
  const settingsStore = useSettingsStore()
  const audio = ref<HTMLAudioElement | null>(null)

  const sounds = {
    default: '/sounds/notification.mp3',
    success: '/sounds/success.mp3',
    warning: '/sounds/warning.mp3',
    error: '/sounds/error.mp3'
  }

  const initSound = () => {
    if (!audio.value) {
      audio.value = new Audio()
    }
  }

  const playSound = (type: keyof typeof sounds = 'default') => {
    const { notifications } = settingsStore.settings
    if (!notifications.sound) return

    initSound()
    if (audio.value) {
      audio.value.src = sounds[type]
      audio.value.play().catch(() => {
        // 忽略自动播放限制错误
      })
    }
  }

  return {
    playSound
  }
} 