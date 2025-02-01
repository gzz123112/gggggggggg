<template>
  <div class="admin-login">
    <div class="login-container">
      <div class="login-header">
        <h2>管理员登录</h2>
        <p>请使用管理员账号登录系统</p>
      </div>

      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        label-width="0"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="adminId">
          <el-input
            v-model="loginForm.adminId"
            placeholder="管理员ID"
            prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item prop="verifyCode">
          <div class="verify-code">
            <el-input
              v-model="loginForm.verifyCode"
              placeholder="验证码"
              prefix-icon="Key"
            />
            <img 
              :src="verifyCodeUrl" 
              @click="refreshVerifyCode" 
              alt="验证码"
              class="verify-code-img"
            />
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import Captcha from '@/utils/captcha'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const captcha = new Captcha()
const verifyCode = ref('')

const loginForm = ref({
  adminId: '',
  password: '',
  verifyCode: ''
})

const rules = {
  adminId: [
    { required: true, message: '请输入管理员ID', trigger: 'blur' },
    { min: 4, message: '管理员ID长度不能小于4位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  verifyCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9]{4}$/, message: '验证码格式不正确', trigger: 'blur' }
  ]
}

const verifyCodeUrl = ref('')

const refreshVerifyCode = () => {
  const { code, dataURL } = captcha.draw()
  verifyCode.value = code
  verifyCodeUrl.value = dataURL
}

onMounted(() => {
  refreshVerifyCode()
})

const handleLogin = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    // 验证验证码
    if (loginForm.value.verifyCode.toLowerCase() !== verifyCode.value.toLowerCase()) {
      ElMessage.error('验证码错误')
      refreshVerifyCode()
      return
    }
    
    loading.value = true
    
    // 调用管理员登录API
    const success = await userStore.adminLogin(loginForm.value.adminId, loginForm.value.password)
    
    if (success) {
      ElMessage.success('登录成功')
      // 确保路由跳转到管理员仪表盘
      await router.push({
        name: 'AdminDashboard'
      })
    } else {
      ElMessage.error('账号或密码错误')
      refreshVerifyCode()
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('登录失败，请检查输入')
    refreshVerifyCode()
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1f4037 0%, #99f2c8 100%);

  .login-container {
    width: 400px;
    padding: $spacing-unit * 4;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    
    .login-header {
      text-align: center;
      margin-bottom: $spacing-unit * 4;
      
      h2 {
        font-size: 24px;
        color: $text-color;
        margin-bottom: $spacing-unit;
      }
      
      p {
        color: #666;
        font-size: 14px;
      }
    }
    
    .verify-code {
      display: flex;
      gap: $spacing-unit;
      
      .el-input {
        flex: 1;
      }
      
      .verify-code-img {
        height: 40px;
        border-radius: 4px;
        cursor: pointer;
      }
    }
    
    .login-button {
      width: 100%;
    }
  }
}
</style> 