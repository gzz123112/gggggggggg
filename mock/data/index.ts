// 基础用户数据
const baseUsers = [
  {
    id: '1',
    username: '测试用户',
    email: '2162027102@qq.com',
    password: '123456',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    role: 'user',
    createdAt: '2024-01-01T00:00:00.000Z',
    status: 'active',
    statistics: {
      totalLetters: 0,
      scheduledLetters: 0,
      sentLetters: 0
    },
    location: {
      province: '44',
      city: '4403'
    }
  },
  {
    id: '2',
    username: '管理员',
    email: 'admin@example.com',
    password: 'admin123',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00.000Z',
    status: 'active',
    statistics: {
      totalLetters: 0,
      scheduledLetters: 0,
      sentLetters: 0
    }
  }
]

// 生成模拟用户
export const users = [
  ...baseUsers,
  ...Array(20).fill(null).map((_, index) => ({
    id: `user-${index + 3}`,
    username: `用户${index + 3}`,
    email: `user${index + 3}@example.com`,
    password: '123456',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${index}`,
    role: 'user',
    createdAt: new Date(2024, 0, Math.floor(Math.random() * 20) + 1).toISOString(),
    status: Math.random() > 0.9 ? 'blocked' : 'active',
    statistics: {
      totalLetters: 0,
      scheduledLetters: 0,
      sentLetters: 0
    }
  }))
]

// 生成信件数据
export const letters = [
  {
    id: '1',
    userId: '1',
    title: '给未来的自己',
    content: '希望未来的自己能够...',
    createdAt: '2024-01-20T10:30:00.000Z',
    scheduledAt: '2024-06-20T10:30:00.000Z',
    status: 'scheduled'
  },
  ...Array(50).fill(null).map((_, index) => ({
    id: `letter-${index + 2}`,
    userId: users[Math.floor(Math.random() * users.length)].id,
    title: `测试信件 ${index + 2}`,
    content: `这是第 ${index + 2} 封测试信件的内容...`,
    createdAt: new Date(2024, 0, Math.floor(Math.random() * 20) + 1).toISOString(),
    scheduledAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
    status: ['draft', 'scheduled', 'sent', 'pending'][Math.floor(Math.random() * 4)]
  }))
]

// 更新用户统计信息
users.forEach(user => {
  if (user.statistics) {
    const userLetters = letters.filter(l => l.userId === user.id)
    user.statistics.totalLetters = userLetters.length
    user.statistics.scheduledLetters = userLetters.filter(l => l.status === 'scheduled').length
    user.statistics.sentLetters = userLetters.filter(l => l.status === 'sent').length
  }
})

// 举报数据
export const reports = [
  {
    id: '1',
    reporterId: '1',
    targetId: '2',
    type: 'inappropriate',
    reason: '不当内容',
    content: '这是被举报的内容...',
    createdAt: '2024-01-20T15:30:22.000Z',
    status: 'pending',
    evidence: ['evidence1.jpg', 'evidence2.jpg']
  },
  // 添加更多模拟举报
  ...Array(20).fill(null).map((_, index) => {
    const reporterId = users[Math.floor(Math.random() * users.length)].id
    let targetId
    do {
      targetId = users[Math.floor(Math.random() * users.length)].id
    } while (targetId === reporterId)

    return {
      id: `report-${index + 2}`,
      reporterId,
      targetId,
      type: ['spam', 'inappropriate', 'copyright', 'other'][Math.floor(Math.random() * 4)],
      reason: ['垃圾信息', '不当内容', '侵权投诉', '其他原因'][Math.floor(Math.random() * 4)],
      content: `这是第 ${index + 2} 个举报的内容...`,
      createdAt: new Date(2024, 0, Math.floor(Math.random() * 20) + 1).toISOString(),
      status: ['pending', 'processed', 'ignored'][Math.floor(Math.random() * 3)],
      evidence: Array(Math.floor(Math.random() * 3)).fill(null).map((_, i) => `evidence${index + 2}_${i + 1}.jpg`)
    }
  })
]

// 系统活动日志
export const activities = [
  {
    id: '1',
    type: 'user_register',
    userId: '1',
    content: '新用户注册',
    createdAt: '2024-01-20T08:30:00.000Z'
  },
  // 添加更多模拟活动日志
  ...Array(100).fill(null).map((_, index) => ({
    id: `activity-${index + 2}`,
    type: ['user_register', 'user_login', 'letter_create', 'letter_send', 'report_create', 'system_update'][Math.floor(Math.random() * 6)],
    userId: users[Math.floor(Math.random() * users.length)].id,
    content: [
      '新用户注册',
      '用户登录',
      '创建新信件',
      '信件发送',
      '提交举报',
      '系统更新'
    ][Math.floor(Math.random() * 6)],
    createdAt: new Date(2024, 0, Math.floor(Math.random() * 20) + 1, Math.floor(Math.random() * 24)).toISOString()
  }))
]

// 系统统计数据
export const statistics = {
  userCount: users.length,
  letterCount: letters.length,
  reportCount: reports.filter(r => r.status === 'pending').length,
  systemScore: 4.9,
  userActivity: {
    today: Array(24).fill(null).map((_, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      count: Math.floor(Math.random() * 20)
    })),
    week: Array(7).fill(null).map((_, day) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - day))
      return {
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 200 + 100)
      }
    }),
    month: Array(30).fill(null).map((_, day) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - day))
      return {
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 500 + 2500)
      }
    })
  },
  letterTypes: [
    { type: 'future', name: '未来信件', value: 60 },
    { type: 'memory', name: '回忆录', value: 25 },
    { type: 'diary', name: '日记', value: 15 }
  ],
  // 添加更多统计数据
  systemStatus: {
    cpu: Math.floor(Math.random() * 30 + 20),
    memory: Math.floor(Math.random() * 40 + 30),
    disk: Math.floor(Math.random() * 20 + 60),
    network: {
      in: Math.floor(Math.random() * 100),
      out: Math.floor(Math.random() * 100)
    }
  }
}

// 修改信件创建逻辑
export const createLetter = (userId: string, letterData: any) => {
  const newLetter = {
    id: `letter-${letters.length + 1}`,
    userId,
    ...letterData,
    createdAt: new Date().toISOString()
  }
  letters.push(newLetter)
  
  // 更新用户统计信息
  updateUserStatistics(userId)
  
  // 添加活动日志
  activities.push({
    id: `activity-${activities.length + 1}`,
    type: 'letter_create',
    userId,
    content: '创建新信件',
    createdAt: new Date().toISOString()
  })
  
  return newLetter
}

// 更新用户统计信息的函数
export const updateUserStatistics = (userId: string) => {
  const user = users.find(u => u.id === userId)
  if (user && user.statistics) {
    const userLetters = letters.filter(l => l.userId === userId)
    user.statistics = {
      totalLetters: userLetters.length,
      scheduledLetters: userLetters.filter(l => l.status === 'scheduled').length,
      sentLetters: userLetters.filter(l => l.status === 'sent').length
    }
  }
}

// 在 mock 接口中添加统计信息更新的处理
export const mockApi = [
  {
    url: '/api/letters',
    method: 'post',
    response: ({ headers, body }) => {
      const userId = getUserIdFromToken(headers.authorization)
      if (!userId) {
        return { code: 401, message: '未授权' }
      }

      const newLetter = createLetter(userId, body)
      updateUserStatistics(userId)

      return {
        code: 200,
        data: newLetter,
        message: '创建成功'
      }
    }
  }
] 