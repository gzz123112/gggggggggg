<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="header-wrapper">
          <h2 class="card-header">时光邮递</h2>
          <el-radio-group v-model="loginType" size="small">
            <el-radio-button label="user">用户登录</el-radio-button>
            <el-radio-button label="admin">管理员登录</el-radio-button>
            <el-radio-button label="guest">访客模式</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      
      <!-- 用户登录/注册表单 -->
      <template v-if="loginType === 'user'">
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="rules"
          label-position="top"
          class="login-form"
        >
          <el-tabs v-model="activeTab">
            <el-tab-pane label="登录" name="login">
              <el-form-item label="用户账号" prop="username">
                <el-input v-model="loginForm.username" />
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  show-password
                />
              </el-form-item>
            </el-tab-pane>
            
            <el-tab-pane label="注册" name="register">
              <el-form-item label="用户账号" prop="username">
                <el-input v-model="loginForm.username" />
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  show-password
                />
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input
                  v-model="loginForm.confirmPassword"
                  type="password"
                  show-password
                />
              </el-form-item>
              <el-form-item label="姓名" prop="fullName">
                <el-input v-model="loginForm.fullName" />
              </el-form-item>
              <el-form-item label="性别" prop="gender">
                <el-radio-group v-model="loginForm.gender">
                  <el-radio-button value="male">男</el-radio-button>
                  <el-radio-button value="female">女</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="生日" prop="birthday">
                <el-date-picker
                  v-model="loginForm.birthday"
                  type="date"
                  placeholder="选择日期"
                  :locale="zhCn"
                  format="YYYY年MM月DD日"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
              <el-form-item label="电话号码" prop="phone">
                <el-input v-model="loginForm.phone" />
              </el-form-item>
              <el-form-item label="邮箱地址" prop="email">
                <el-input v-model="loginForm.email" />
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
          
          <div class="form-footer">
            <div class="button-group">
              <el-button type="primary" @click="handleSubmit">
                {{ activeTab === 'login' ? '登录' : '注册' }}
              </el-button>
              <el-button @click="handleReset">取消</el-button>
            </div>
            <el-link 
              type="primary" 
              class="forget-password"
              @click="router.push('/forget-password')"
            >
              忘记密码?
            </el-link>
          </div>
        </el-form>
      </template>

      <!-- 管理员登录表单 -->
      <template v-else-if="loginType === 'admin'">
        <el-form
          ref="adminFormRef"
          :model="adminForm"
          :rules="adminRules"
          label-position="top"
        >
          <el-form-item label="管理员账号" prop="username">
            <el-input v-model="adminForm.username" />
          </el-form-item>
          <el-form-item label="管理员密码" prop="password">
            <el-input
              v-model="adminForm.password"
              type="password"
              show-password
            />
          </el-form-item>
          <el-form-item label="验证码" prop="verifyCode">
            <div class="verify-code-wrapper">
              <el-input v-model="adminForm.verifyCode" maxlength="4" />
              <div 
                class="captcha-display"
                @click="refreshCaptcha"
              >
                {{ captcha }}
              </div>
            </div>
          </el-form-item>
          <div class="button-group">
            <el-button type="primary" @click="handleAdminLogin">
              管理员登录
            </el-button>
            <el-button @click="handleReset">取消</el-button>
          </div>
        </el-form>
      </template>

      <!-- 访客模式提示 -->
      <template v-else>
        <div class="guest-info">
          <el-result
            icon="info"
            title="访客模式"
            sub-title="您正在以访客身份浏览，部分功能将受限"
          >
            <template #extra>
              <el-button type="primary" @click="enterGuestMode">
                进入访客模式
              </el-button>
              <el-button @click="loginType = 'user'">
                返回登录
              </el-button>
            </template>
          </el-result>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import request from '@/utils/request'

const router = useRouter()
const loginType = ref('user')
const activeTab = ref('login')
const loginFormRef = ref<FormInstance>()
const adminFormRef = ref<FormInstance>()

// 用户登录表单数据
const loginForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  fullName: '',
  gender: '',
  birthday: '',
  phone: '',
  email: ''
})

// 管理员登录表单数据
const adminForm = reactive({
  username: '',
  password: '',
  verifyCode: ''
})

// 验证码相关
const verifyCodeUrl = ref('')
const refreshVerifyCode = () => {
  // 这里实现刷新验证码的逻辑
  verifyCodeUrl.value = `/api/verify-code?t=${Date.now()}`
}

// 管理员表单验证规则
const adminRules = {
  username: [
    { required: true, message: '请输入管理员账号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入管理员密码', trigger: 'blur' }
  ],
  verifyCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 4, message: '验证码长度为4位', trigger: 'blur' }
  ]
}

const captcha = ref('')

// 刷新验证码
const refreshCaptcha = async () => {
  try {
    const response = await request.get('/api/captcha')
    captcha.value = response.data.data
  } catch (error) {
    console.error('获取验证码失败:', error)
  }
}

// 处理管理员登录
const handleAdminLogin = async () => {
  if (!adminFormRef.value) return
  try {
    await adminFormRef.value.validate()
    if (adminForm.verifyCode.toLowerCase() !== captcha.value.toLowerCase()) {
      ElMessage.error('验证码错误')
      refreshCaptcha()
      return
    }

    // 验证管理员账号密码
    const response = await request.get('/api/admin')
    const admin = response.data.adminList[0]
    
    if (adminForm.username === admin.username && 
        adminForm.password === admin.password) {
      ElMessage.success('管理员登录成功')
      router.push('/admin')
    } else {
      ElMessage.error('账号或密码错误')
      refreshCaptcha()
    }
  } catch (error) {
    console.error('管理员登录失败:', error)
    ElMessage.error('登录失败，请重试')
    refreshCaptcha()
  }
}

onMounted(() => {
  refreshCaptcha()
})

// 密码验证规则
const validatePass = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    if (loginForm.confirmPassword !== '') {
      if (loginFormRef.value) {
        loginFormRef.value.validateField('confirmPassword')
      }
    }
    callback()
  }
}

const validatePass2 = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== loginForm.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户账号', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePass, trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: activeTab.value === 'register', validator: validatePass2, trigger: 'blur' }
  ],
  fullName: [{ required: activeTab.value === 'register', message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: activeTab.value === 'register', message: '请选择性别', trigger: 'change' }],
  birthday: [{ required: activeTab.value === 'register', message: '请选择生日', trigger: 'change' }],
  phone: [
    { required: activeTab.value === 'register', message: '请输入电话号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!loginFormRef.value) return
  try {
    if (activeTab.value === 'login') {
      // 登录模式
      await loginFormRef.value.validateField(['username', 'password'])
      if (loginForm.username && loginForm.password) {
        try {
          const { code, data, message } = await request.post('/login', {
            username: loginForm.username,
            password: loginForm.password
          })
          
          if (code === 200) {
            ElMessage.success(message || '登录成功')
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
            router.push('/mailbox')
          }
        } catch (error) {
          console.error('登录请求失败:', error)
          ElMessage.error('登录失败，请重试')
        }
      }
    } else {
      // 注册模式保持不变
      // ...
    }
  } catch (error) {
    console.error('操作失败:', error)
  }
}

const handleReset = () => {
  if (loginFormRef.value) {
    loginFormRef.value.resetFields()
  }
}

// 监听标签页切换，更新验证规则
watch(activeTab, (newValue) => {
  handleReset()
  // 更新验证规则的required属性
  Object.keys(rules).forEach(key => {
    if (key !== 'username' && key !== 'password') {
      rules[key][0].required = newValue === 'register'
    }
  })
})

// 监听登录类型变化
watch(loginType, () => {
  handleReset()
  if (loginType.value === 'admin') {
    refreshVerifyCode()
  }
})

// 访客模式
const enterGuestMode = () => {
  router.push('/guest')
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  background-image: url('@/assets/text4.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  transform-origin: center center;
}

.login-card {
  width: 400px;
  max-height: 600px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  position: absolute;
  right: 15%;
  top: 50%;
  transform: translateY(-50%);
}

.login-form {
  padding: 0 20px;
}

.card-header {
  text-align: center;
  margin: 0;
  color: #333;
  font-size: 24px;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 20px 0;
}

/* 自定义滚动条样式 */
.login-card::-webkit-scrollbar {
  width: 6px;
}

.login-card::-webkit-scrollbar-thumb {
  background-color: rgba(144, 147, 153, 0.3);
  border-radius: 3px;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .login-card {
    width: 90%;
    right: 50%;
    transform: translate(50%, -50%);
    margin: 0 auto;
  }
}

/* 禁用页面缩放 */
@media (pointer: fine) {
  html {
    zoom: 1 !important;
  }
}

/* 添加这些样式来优化消息提示的显示 */
:deep(.el-message) {
  min-width: 300px;
  padding: 15px 20px;
  border-radius: 8px;
}

:deep(.el-message__content) {
  font-size: 16px;
  color: #333;
}

.header-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.verify-code-wrapper {
  display: flex;
  gap: 10px;
}

.verify-code-image {
  width: 100px;
  height: 40px;
  cursor: pointer;
}

.form-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.forget-password {
  margin-top: 10px;
}

.guest-info {
  padding: 20px;
  text-align: center;
}

.captcha-display {
  width: 100px;
  height: 40px;
  background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Courier New', monospace;
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 4px;
  cursor: pointer;
  user-select: none;
  color: #666;
  border-radius: 4px;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
}

.captcha-display:hover {
  background: linear-gradient(45deg, #e8e8e8, #d8d8d8);
}
</style>
