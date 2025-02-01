import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

export function useGuestMode() {
  const userStore = useUserStore()
  const router = useRouter()

  const isGuest = computed(() => userStore.currentUser?.role === 'guest')

  const checkGuestPermission = (action: string): boolean => {
    if (!isGuest.value) return true

    const guestPermissions = {
      writeLetter: true,
      editLetter: false,
      deleteLetter: false,
      changeSettings: false,
      exportData: false
    }

    return guestPermissions[action as keyof typeof guestPermissions] ?? false
  }

  const requireAuth = (action: string) => {
    if (!checkGuestPermission(action)) {
      ElMessage.warning('访客模式下无法使用此功能，请注册账号')
      router.push('/register')
      return false
    }
    return true
  }

  return {
    isGuest,
    checkGuestPermission,
    requireAuth
  }
} 