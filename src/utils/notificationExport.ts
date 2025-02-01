import type { Notification } from '@/types/notification'

interface NotificationBackup {
  version: string
  timestamp: number
  notifications: Notification[]
}

export function exportNotifications(notifications: Notification[]): string {
  const backup: NotificationBackup = {
    version: '1.0',
    timestamp: Date.now(),
    notifications
  }

  return JSON.stringify(backup, null, 2)
}

export const downloadNotifications = (notifications: Notification[]) => {
  const data = JSON.stringify(notifications, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `notifications_${new Date().toISOString()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const importNotifications = async (file: File): Promise<Notification[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        resolve(data)
      } catch (error) {
        reject(new Error('文件格式错误'))
      }
    }
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsText(file)
  })
} 