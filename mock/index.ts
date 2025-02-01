import { MockMethod } from 'vite-plugin-mock'

export default [
  {
    url: '/api/admin/login',
    method: 'post',
    rawResponse: async (req, res) => {
      // 设置响应头
      res.setHeader('Content-Type', 'application/json')
      
      // 获取请求体
      let body = ''
      await new Promise((resolve) => {
        req.on('data', (chunk) => {
          body += chunk
        })
        req.on('end', () => {
          resolve(body)
        })
      })
      
      const { adminId, password } = JSON.parse(body)
      
      // 验证管理员账号
      if (adminId === 'admin' && password === '123456') {
        res.statusCode = 200
        res.end(JSON.stringify({
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
        }))
      } else {
        res.statusCode = 200
        res.end(JSON.stringify({
          code: 401,
          data: null,
          message: '账号或密码错误'
        }))
      }
    }
  }
] as MockMethod[] 