import { ref, onMounted, computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'

interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'warning' | 'info' | 'error'
  timestamp: number
  group?: string
  read: boolean
}

interface NotificationGroup {
  id: string
  title: string
  notifications: Notification[]
  unreadCount: number
}

export function useNotification() {
  const settingsStore = useSettingsStore()
  const notifications = ref<Notification[]>([])
  const hasPermission = ref(false)

  const checkPermission = async () => {
    if (!('Notification' in window)) {
      return false
    }

    if (Notification.permission === 'granted') {
      hasPermission.value = true
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      hasPermission.value = permission === 'granted'
      return hasPermission.value
    }

    return false
  }

  const sendNotification = async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const { notifications: notificationSettings } = settingsStore.settings

    if (!notificationSettings.browser) return

    const hasPermissionNow = await checkPermission()
    if (!hasPermissionNow) return

    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: Date.now(),
      read: false
    }

    // 浏览器通知
    new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico'
    })

    // 存储通知历史
    notifications.value.unshift(newNotification)
    if (notifications.value.length > 50) {
      notifications.value.pop()
    }
  }

  const sendEmailNotification = async (to: string, subject: string, content: string) => {
    const { notifications: notificationSettings } = settingsStore.settings
    
    if (!notificationSettings.email) return

    // 实际项目中这里应该调用后端 API 发送邮件
    console.log('Sending email notification:', { to, subject, content })
  }

  const clearNotifications = () => {
    notifications.value = []
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const notificationGroups = computed(() => {
    const groups: Record<string, NotificationGroup> = {
      system: {
        id: 'system',
        title: '系统通知',
        notifications: [],
        unreadCount: 0
      },
      letter: {
        id: 'letter',
        title: '信件通知',
        notifications: [],
        unreadCount: 0
      },
      activity: {
        id: 'activity',
        title: '活动通知',
        notifications: [],
        unreadCount: 0
      }
    }

    notifications.value.forEach(notification => {
      const group = notification.group || 'system'
      if (groups[group]) {
        groups[group].notifications.push(notification)
        if (!notification.read) {
          groups[group].unreadCount++
        }
      }
    })

    return groups
  })

  const markAsRead = (notificationId: string) => {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
    }
  }

  const markGroupAsRead = (groupId: string) => {
    notifications.value.forEach(notification => {
      if (notification.group === groupId) {
        notification.read = true
      }
    })
  }

  onMounted(() => {
    checkPermission()
  })

  return {
    notifications,
    hasPermission,
    sendNotification,
    sendEmailNotification,
    clearNotifications,
    removeNotification,
    notificationGroups,
    markAsRead,
    markGroupAsRead
  }
} 