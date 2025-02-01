import { MockMethod } from 'vite-plugin-mock'
import { User } from '@/types/user'
import { users, letters, reports, activities, statistics } from './data'
import dayjs from 'dayjs'

// 模拟用户数据
const users: User[] = [
  {
    id: '1',
    username: '测试用户',
    email: '2162027102@qq.com',
    password: '123456',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    role: 'user',
    createdAt: '2024-01-01T00:00:00.000Z',
    status: 'active'
  },
  {
    id: '2',
    username: '管理员',
    email: 'admin@example.com',
    password: 'admin123',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00.000Z',
    status: 'active'
  }
]

export default [
  {
    url: '/api/auth/login',
    method: 'post',
    response: ({ body }) => {
      console.log('Mock login request:', body)
      const { email, password } = body
      
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
      
      if (!user) {
        console.log('User not found')
        return {
          code: 401,
          message: '用户不存在'
        }
      }

      if (user.password !== password) {
        console.log('Password incorrect')
        return {
          code: 401,
          message: '密码错误'
        }
      }

      const { password: _, ...userWithoutPassword } = user
      
      console.log('Login successful:', userWithoutPassword)

      return {
        code: 200,
        message: '登录成功',
        data: {
          token: `mock-token-${user.id}`,
          user: userWithoutPassword
        }
      }
    }
  },
  // 管理员登录接口
  {
    url: '/api/admin/login',
    method: 'post',
    response: ({ body }) => {
      const adminAccount = {
        adminId: 'admin',
        password: '123456'
      }

      if (body.adminId === adminAccount.adminId && body.password === adminAccount.password) {
        return {
          code: 200,
          data: {
            token: 'admin-token',
            user: {
              id: 'admin',
              username: '系统管理员',
              email: 'admin@system.com',
              role: 'admin',
              avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
              createdAt: '2024-01-01'
            }
          },
          message: '登录成功'
        }
      }

      return {
        code: 401,
        data: null,
        message: '账号或密码错误'
      }
    }
  },
  // 获取仪表盘数据
  {
    url: '/api/admin/dashboard',
    method: 'get',
    response: ({ headers }) => {
      if (!headers.authorization?.includes('admin-token')) {
        return { code: 403, message: '无权限访问' }
      }

      // 计算今日数据
      const today = dayjs().startOf('day')
      const todayLetters = letters.filter(l => 
        dayjs(l.createdAt).isAfter(today)
      ).length

      return {
        code: 200,
        data: {
          overview: {
            userCount: statistics.userCount,
            todayLetters,
            pendingReports: statistics.reportCount,
            systemScore: statistics.systemScore
          },
          userActivity: statistics.userActivity,
          letterTypes: statistics.letterTypes,
          recentActivities: activities.slice(0, 5)
        }
      }
    }
  },
  // 获取用户列表
  {
    url: '/api/admin/users',
    method: 'get',
    response: ({ headers, query }) => {
      if (!headers.authorization?.includes('admin-token')) {
        return { code: 403, message: '无权限访问' }
      }

      const { page = 1, pageSize = 10, keyword = '' } = query
      let filteredUsers = [...users]
      
      if (keyword) {
        filteredUsers = filteredUsers.filter(user => 
          user.username.includes(keyword) || 
          user.email.includes(keyword)
        )
      }

      const start = (page - 1) * pageSize
      const end = start + pageSize
      const pagedUsers = filteredUsers.slice(start, end)

      return {
        code: 200,
        data: {
          total: filteredUsers.length,
          list: pagedUsers.map(({ password, ...rest }) => rest)
        }
      }
    }
  },
  // 获取待审核内容
  {
    url: '/api/admin/contents/review',
    method: 'get',
    response: ({ headers, query }) => {
      if (!headers.authorization?.includes('admin-token')) {
        return { code: 403, message: '无权限访问' }
      }

      const pendingLetters = letters.filter(l => l.status === 'pending')
      const { page = 1, pageSize = 10 } = query
      const start = (page - 1) * pageSize
      const end = start + pageSize

      return {
        code: 200,
        data: {
          total: pendingLetters.length,
          list: pendingLetters.slice(start, end).map(letter => ({
            id: letter.id,
            type: 'letter',
            content: letter.content,
            user: users.find(u => u.id === letter.userId),
            createdAt: letter.createdAt,
            status: letter.status
          }))
        }
      }
    }
  },
  // 获取举报列表
  {
    url: '/api/admin/reports',
    method: 'get',
    response: ({ headers, query }) => {
      if (!headers.authorization?.includes('admin-token')) {
        return { code: 403, message: '无权限访问' }
      }

      const { page = 1, pageSize = 10, status } = query
      let filteredReports = [...reports]
      
      if (status) {
        filteredReports = filteredReports.filter(r => r.status === status)
      }

      const start = (page - 1) * pageSize
      const end = start + pageSize

      return {
        code: 200,
        data: {
          total: filteredReports.length,
          list: filteredReports.slice(start, end).map(report => ({
            ...report,
            reporter: users.find(u => u.id === report.reporterId),
            target: users.find(u => u.id === report.targetId)
          }))
        }
      }
    }
  },
  // 获取统计数据
  {
    url: '/api/admin/statistics',
    method: 'get',
    response: ({ headers }) => {
      if (!headers.authorization?.includes('admin-token')) {
        return { code: 403, message: '无权限访问' }
      }

      return {
        code: 200,
        data: statistics
      }
    }
  },
  // 添加信件相关接口
  {
    url: '/api/letters/create',
    method: 'post',
    response: ({ headers, body }) => {
      const token = headers.authorization
      if (!token) {
        return { code: 401, message: '未授权' }
      }

      const userId = token.replace('mock-token-', '')
      const newLetter = {
        id: `letter-${letters.length + 1}`,
        userId,
        title: body.title,
        content: body.content,
        createdAt: new Date().toISOString(),
        scheduledAt: body.scheduledAt,
        status: body.status || 'scheduled'
      }

      letters.push(newLetter)

      // 更新用户统计信息
      const user = users.find(u => u.id === userId)
      if (user && user.statistics) {
        const userLetters = letters.filter(l => l.userId === userId)
        user.statistics = {
          totalLetters: userLetters.length,
          scheduledLetters: userLetters.filter(l => l.status === 'scheduled').length,
          sentLetters: userLetters.filter(l => l.status === 'sent').length
        }
      }

      // 添加活动日志
      activities.push({
        id: `activity-${activities.length + 1}`,
        type: 'letter_create',
        userId,
        content: `创建新信件：${newLetter.title}`,
        createdAt: new Date().toISOString()
      })

      return {
        code: 200,
        data: newLetter,
        message: '创建成功'
      }
    }
  },
  // 获取用户信件列表
  {
    url: '/api/letters',
    method: 'get',
    response: ({ headers, query }) => {
      const token = headers.authorization
      if (!token) {
        return { code: 401, message: '未授权' }
      }

      const userId = token.replace('mock-token-', '')
      const { status } = query
      let userLetters = letters.filter(l => l.userId === userId)
      
      if (status) {
        userLetters = userLetters.filter(l => l.status === status)
      }

      return {
        code: 200,
        data: {
          total: userLetters.length,
          list: userLetters.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        }
      }
    }
  },
  // 获取用户信件统计
  {
    url: '/api/users/:id/statistics',
    method: 'get',
    response: ({ headers, query }) => {
      const token = headers.authorization
      if (!token) {
        return { code: 401, message: '未授权' }
      }

      const userId = query.id || token.replace('mock-token-', '')
      const user = users.find(u => u.id === userId)
      
      if (!user) {
        return { code: 404, message: '用户不存在' }
      }

      // 重新计算统计信息
      const userLetters = letters.filter(l => l.userId === userId)
      const statistics = {
        totalLetters: userLetters.length,
        scheduledLetters: userLetters.filter(l => l.status === 'scheduled').length,
        sentLetters: userLetters.filter(l => l.status === 'sent').length
      }

      // 更新用户统计信息
      if (user.statistics) {
        user.statistics = statistics
      }

      return {
        code: 200,
        data: statistics
      }
    }
  }
] as MockMethod[] 