import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User, RegisterForm, LoginForm } from '@/types/user'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isAdmin = ref(false)

  const register = async (form: RegisterForm) => {
    // 模拟注册请求
    const user: User = {
      id: Date.now().toString(),
      username: form.username,
      email: form.email,
      role: 'user',
      createdAt: new Date().toISOString(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.email}`
    }
    // 实际项目中这里应该调用后端 API
    return user
  }

  const login = async (loginForm: LoginForm) => {
    try {
      console.log('Sending login request:', loginForm) // 添加日志
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginForm)
      })

      console.log('Login response:', response) // 添加日志

      if (!response.ok) {
        throw new Error('网络请求失败')
      }

      const data = await response.json()
      console.log('Login data:', data) // 添加日志
      
      if (data.code !== 200) {
        throw new Error(data.message || '登录失败')
      }

      currentUser.value = data.data.user
      token.value = data.data.token
      isAdmin.value = false
      
      // 保存到本地存储
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))
      
      return data.data
    } catch (error) {
      console.error('Login error:', error) // 添加详细错误日志
      throw error instanceof Error ? error : new Error('登录失败')
    }
  }

  const guestLogin = async () => {
    try {
      const guestUser = {
        id: `guest_${Date.now()}`,
        username: '访客用户',
        email: 'guest@example.com',
        role: 'guest',
        avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
        createdAt: new Date().toISOString(),
        status: 'active'
      }
      
      currentUser.value = guestUser
      token.value = `guest-token-${guestUser.id}`
      isAdmin.value = false
      
      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(guestUser))
      
      return true
    } catch (error) {
      console.error('访客登录失败:', error)
      return false
    }
  }

  const adminLogin = async (adminId: string, password: string) => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminId, password })
      })

      const data = await response.json()
      
      if (data.code === 200 && data.data) {
        currentUser.value = data.data.user
        token.value = data.data.token
        isAdmin.value = true
        
        // 保存到本地存储
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('user', JSON.stringify(data.data.user))
        localStorage.setItem('isAdmin', 'true')
        
        return true
      }
      
      return false
    } catch (error) {
      console.error('管理员登录失败:', error)
      return false
    }
  }

  const logout = () => {
    currentUser.value = null
    token.value = null
    isAdmin.value = false
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('isAdmin')
  }

  // 初始化状态
  const init = () => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    const savedIsAdmin = localStorage.getItem('isAdmin')
    
    if (savedToken && savedUser) {
      token.value = savedToken
      currentUser.value = JSON.parse(savedUser)
      isAdmin.value = savedIsAdmin === 'true'
    }
  }

  return {
    currentUser,
    token,
    isAdmin,
    register,
    login,
    guestLogin,
    adminLogin,
    logout,
    init
  }
}) 