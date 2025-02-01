import { MockMethod } from 'vite-plugin-mock'
import type { User } from '@/types/user'

// 模拟用户数据
const users: User[] = [
  {
    id: '1',
    username: 'test',
    email: 'test@example.com',
    password: '123456',
    role: 'user',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    createdAt: '2024-01-01',
    status: 'active'
  }
]

// Mock API 接口
export default [
  // 用户登录接口
  {
    url: '/api/auth/login',
    method: 'post',
    response: ({ body }) => {
      const { email, password } = body
      const user = users.find(u => u.email === email && u.password === password)

      if (user) {
        const { password: _, ...userWithoutPassword } = user
        return {
          code: 200,
          data: {
            token: `mock-token-${user.id}`,
            user: userWithoutPassword
          }
        }
      }

      return {
        code: 401,
        message: '邮箱或密码错误'
      }
    }
  },

  {
    url: '/api/auth/admin/login',
    method: 'post',
    response: ({ body }) => {
      const { email, password } = body
      const user = users.find(u => u.email === email && u.role === 'admin')

      if (!user) {
        return {
          code: 401,
          message: '管理员账号不存在'
        }
      }

      if (user.password !== password) {
        return {
          code: 401,
          message: '密码错误'
        }
      }

      const { password: _, ...userWithoutPassword } = user

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

  {
    url: '/api/auth/register',
    method: 'post',
    response: ({ body }) => {
      const { email } = body
      const existingUser = users.find(u => u.email === email)

      if (existingUser) {
        return {
          code: 400,
          message: '邮箱已被注册'
        }
      }

      const newUser: User = {
        id: String(users.length + 1),
        ...body,
        role: 'user',
        avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
        createdAt: new Date().toISOString(),
        status: 'active'
      }

      users.push(newUser)
      const { password: _, ...userWithoutPassword } = newUser

      return {
        code: 200,
        message: '注册成功',
        data: {
          token: `mock-token-${newUser.id}`,
          user: userWithoutPassword
        }
      }
    }
  },

  {
    url: '/api/users',
    method: 'get',
    response: ({ headers }) => {
      // 检查是否是管理员token
      const token = headers.authorization
      if (!token || !token.includes('mock-token-2')) {
        return {
          code: 403,
          message: '无权限访问'
        }
      }

      // 返回用户列表（不包含密码）
      const userList = users.map(user => {
        const { password: _, ...userWithoutPassword } = user
        return userWithoutPassword
      })

      return {
        code: 200,
        data: {
          total: userList.length,
          list: userList
        }
      }
    }
  },

  {
    url: '/api/user/profile',
    method: 'get',
    response: ({ headers }) => {
      const token = headers.authorization
      if (!token) {
        return {
          code: 401,
          message: '未登录'
        }
      }

      const userId = token.split('-').pop()
      const user = users.find(u => u.id === userId)

      if (!user) {
        return {
          code: 404,
          message: '用户不存在'
        }
      }

      const { password: _, ...userWithoutPassword } = user

      return {
        code: 200,
        data: userWithoutPassword
      }
    }
  },

  // 管理员登录接口
  {
    url: '/api/admin/login',
    method: 'post',
    response: ({ body }) => {
      console.log('Mock admin login request:', body)
      
      const adminAccount = {
        adminId: 'admin',
        password: '123456'
      }

      if (body.adminId === adminAccount.adminId && body.password === adminAccount.password) {
        const response = {
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
        console.log('Mock admin login response:', response)
        return response
      }

      return {
        code: 401,
        data: null,
        message: '账号或密码错误'
      }
    }
  }
] as MockMethod[] 