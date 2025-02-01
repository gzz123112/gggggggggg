import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ThemeSettings {
  primary: string
  darkMode: boolean
  fontSize: number
}

export interface NotificationSettings {
  email: boolean
  browser: boolean
  reminderTime: string
}

export interface PrivacySettings {
  publicLetters: boolean
  showTimeline: boolean
}

export interface Settings {
  theme: ThemeSettings
  notifications: NotificationSettings
  privacy: PrivacySettings
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<Settings>({
    theme: {
      primary: '#f5b682',
      darkMode: false,
      fontSize: 14
    },
    notifications: {
      email: true,
      browser: true,
      reminderTime: '24'
    },
    privacy: {
      publicLetters: false,
      showTimeline: true
    }
  })

  const updateSettings = async (newSettings: Settings) => {
    // 实际项目中这里应该调用 API
    settings.value = newSettings
    applyTheme(newSettings.theme)
  }

  const getDefaultSettings = (): Settings => ({
    theme: {
      primary: '#f5b682',
      darkMode: false,
      fontSize: 14
    },
    notifications: {
      email: true,
      browser: true,
      reminderTime: '24'
    },
    privacy: {
      publicLetters: false,
      showTimeline: true
    }
  })

  const applyTheme = (theme: ThemeSettings) => {
    document.documentElement.style.setProperty('--el-color-primary', theme.primary)
    document.documentElement.classList.toggle('dark', theme.darkMode)
    document.documentElement.style.fontSize = `${theme.fontSize}px`
  }

  return {
    settings,
    updateSettings,
    getDefaultSettings
  }
}) 