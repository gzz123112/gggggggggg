import { ref, watch } from 'vue'
import { useStorage } from '@vueuse/core'

export interface ThemeSettings {
  primary: string
  fontSize: number
  darkMode: boolean
}

export function useTheme() {
  const themeSettings = useStorage<ThemeSettings>('theme-settings', {
    primary: '#8B4513',
    fontSize: 14,
    darkMode: false
  })

  const setPrimaryColor = (color: string) => {
    themeSettings.value.primary = color
    document.documentElement.style.setProperty('--el-color-primary', color)
    // 更新其他相关颜色
    const darkFactor = themeSettings.value.darkMode ? 0.8 : 1
    document.documentElement.style.setProperty('--el-color-primary-light-3', lightenColor(color, 0.2 * darkFactor))
    document.documentElement.style.setProperty('--el-color-primary-light-5', lightenColor(color, 0.4 * darkFactor))
    document.documentElement.style.setProperty('--el-color-primary-light-7', lightenColor(color, 0.6 * darkFactor))
    document.documentElement.style.setProperty('--el-color-primary-light-9', lightenColor(color, 0.8 * darkFactor))
    document.documentElement.style.setProperty('--el-color-primary-dark-2', darkenColor(color, 0.2))
  }

  const setFontSize = (size: number) => {
    themeSettings.value.fontSize = size
    document.documentElement.style.fontSize = `${size}px`
  }

  const toggleDarkMode = (isDark: boolean) => {
    themeSettings.value.darkMode = isDark
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    // 触发重新渲染
    document.body.style.display = 'none'
    document.body.offsetHeight
    document.body.style.display = ''
  }

  // 辅助函数：调亮颜色
  const lightenColor = (color: string, amount: number): string => {
    const hex = color.replace('#', '')
    const rgb = parseInt(hex, 16)
    const r = Math.min(255, ((rgb >> 16) & 0xff) + Math.round(255 * amount))
    const g = Math.min(255, ((rgb >> 8) & 0xff) + Math.round(255 * amount))
    const b = Math.min(255, (rgb & 0xff) + Math.round(255 * amount))
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
  }

  // 辅助函数：调暗颜色
  const darkenColor = (color: string, amount: number): string => {
    const hex = color.replace('#', '')
    const rgb = parseInt(hex, 16)
    const r = Math.max(0, ((rgb >> 16) & 0xff) - Math.round(255 * amount))
    const g = Math.max(0, ((rgb >> 8) & 0xff) - Math.round(255 * amount))
    const b = Math.max(0, (rgb & 0xff) - Math.round(255 * amount))
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
  }

  // 监听主题设置变化
  watch(() => themeSettings.value, (newSettings) => {
    setPrimaryColor(newSettings.primary)
    setFontSize(newSettings.fontSize)
    toggleDarkMode(newSettings.darkMode)
  }, { deep: true, immediate: true })

  return {
    themeSettings,
    setPrimaryColor,
    setFontSize,
    toggleDarkMode
  }
} 