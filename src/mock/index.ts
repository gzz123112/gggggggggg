import Mock from 'mockjs'

declare module 'mockjs' {
  interface MockjsConfig {
    [key: string]: any
  }
}

interface AdminData {
  adminList: Array<{
    username: string
    password: string
    role: string
  }>
}

interface CaptchaResponse {
  code: number
  data: string
}

interface StatisticsData {
  userCount: number
  newUsers: number
  pendingAppeals: number
  storageUsage: number
}

interface UserData {
  id: number
  username: string
  password: string
  email: string
  phone: string
}

interface LetterData {
  id: number
  userId: number
  title: string
  content: string
  sendTime: string
  receiveTime: string
  status: 'draft' | 'sent' | 'received'
  isRead: boolean
}

// 管理员数据
Mock.mock<AdminData>('/api/admin', 'get', {
  adminList: [
    {
      username: 'admin',
      password: '123456',
      role: 'admin'
    }
  ]
})

// 生成随机验证码
Mock.mock<CaptchaResponse>('/api/captcha', 'get', () => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let captcha = ''
  for (let i = 0; i < 4; i++) {
    captcha += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return {
    code: 200,
    data: captcha
  }
})

// 系统统计数据
Mock.mock<StatisticsData>('/api/statistics', 'get', {
  'userCount|100-1000': 100,
  'newUsers|1-50': 30,
  'pendingAppeals|0-10': 5,
  'storageUsage|1-100.1': 45.8
})

// 用户数据
Mock.mock('/api/users', 'get', {
  users: [
    {
      id: 1,
      username: 'GYX123',
      password: '123456',
      email: 'test123@example.com',
      phone: '15816734077'
    },
    {
      id: 2,
      username: 'CJH321',
      password: '123456',
      email: 'demo@example.com',
      phone: '15119983200'
    }
  ]
})

// 用户登录验证
Mock.mock('/api/login', 'post', (options: any) => {
  const { username, password } = JSON.parse(options.body)
  // 使用完整的用户数据进行验证
  const users = [
    {
      id: 1,
      username: 'GYX123',
      password: '123456',
      email: 'test123@example.com',
      phone: '15816734077'
    },
    {
      id: 2,
      username: 'CJH321',
      password: '123456',
      email: 'demo@example.com',
      phone: '15119983200'
    }
  ]
  
  const user = users.find(u => u.username === username && u.password === password)
  
  if (user) {
    return {
      code: 200,
      message: '登录成功',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone
      }
    }
  } else {
    return {
      code: 401,
      message: '用户名或密码错误',
      data: null
    }
  }
})

// 信件数据
Mock.mock('/api/letters', 'get', {
  'letters|10-20': [{
    'id|+1': 1,
    'userId': 1,
    'title': '@ctitle(5, 10)',
    'content': '@cparagraph(2, 4)',
    'sendTime': '@datetime',
    'receiveTime': '@datetime',
    'status|1': ['draft', 'sent', 'received'],
    'isRead': false
  }]
})

// 用户活动记录
Mock.mock('/api/activities', 'get', {
  'activities|5-10': [{
    'id|+1': 1,
    'userId': 1,
    'content': '@csentence',
    'time': '@datetime',
    'type|1': ['primary', 'success', 'info']
  }]
})

export {} 