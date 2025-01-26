<template>
  <div class="forget-password-container">
    <el-card class="forget-password-card">
      <template #header>
        <div class="card-header">
          <h2>找回密码</h2>
          <el-steps :active="currentStep" finish-status="success" simple>
            <el-step title="验证身份" />
            <el-step title="重置密码" />
            <el-step title="完成" />
          </el-steps>
        </div>
      </template>

      <!-- 步骤1：身份验证 -->
      <template v-if="currentStep === 0">
        <el-form
          ref="verifyFormRef"
          :model="verifyForm"
          :rules="verifyRules"
          label-position="top"
        >
          <el-form-item label="用户账号" prop="username">
            <el-input v-model="verifyForm.username" />
          </el-form-item>
          
          <el-form-item label="验证方式">
            <el-radio-group v-model="verifyMethod">
              <el-radio label="phone">手机验证</el-radio>
              <el-radio label="email">邮箱验证</el-radio>
            </el-radio-group>
          </el-form-item>

          <template v-if="verifyMethod === 'phone'">
            <el-form-item label="手机号码" prop="phone">
              <el-input v-model="verifyForm.phone" disabled />
            </el-form-item>
            <el-form-item label="验证码" prop="phoneCode">
              <div class="verify-code-input">
                <el-input v-model="verifyForm.phoneCode" />
                <el-button 
                  type="primary" 
                  :disabled="!!countdown"
                  @click="sendPhoneCode"
                >
                  {{ countdown ? `${countdown}s后重新发送` : '发送验证码' }}
                </el-button>
              </div>
            </el-form-item>
          </template>

          <template v-else>
            <el-form-item label="邮箱地址" prop="email">
              <el-input v-model="verifyForm.email" disabled />
            </el-form-item>
            <el-form-item label="验证码" prop="emailCode">
              <div class="verify-code-input">
                <el-input v-model="verifyForm.emailCode" />
                <el-button 
                  type="primary" 
                  :disabled="!!countdown"
                  @click="sendEmailCode"
                >
                  {{ countdown ? `${countdown}s后重新发送` : '发送验证码' }}
                </el-button>
              </div>
            </el-form-item>
          </template>
        </el-form>
      </template>

      <!-- 步骤2：重置密码 -->
      <template v-if="currentStep === 1">
        <el-form
          ref="resetFormRef"
          :model="resetForm"
          :rules="resetRules"
          label-position="top"
        >
          <el-form-item label="新密码" prop="password">
            <el-input
              v-model="resetForm.password"
              type="password"
              show-password
            />
          </el-form-item>
          <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input
              v-model="resetForm.confirmPassword"
              type="password"
              show-password
            />
          </el-form-item>
        </el-form>
      </template>

      <!-- 步骤3：完成 -->
      <template v-if="currentStep === 2">
        <el-result
          icon="success"
          title="密码重置成功"
          sub-title="您的密码已经重置成功，请使用新密码登录"
        >
          <template #extra>
            <el-button type="primary" @click="router.push('/')">
              返回登录
            </el-button>
          </template>
        </el-result>
      </template>

      <!-- 底部按钮 -->
      <div class="button-group" v-if="currentStep < 2">
        <el-button @click="router.push('/')">返回登录</el-button>
        <el-button 
          type="primary" 
          @click="handleNext"
          :loading="loading"
        >
          {{ currentStep === 1 ? '确认重置' : '下一步' }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'

const router = useRouter()
const currentStep = ref(0)
const verifyMethod = ref('phone')
const countdown = ref(0)
const loading = ref(false)

// 验证表单
const verifyFormRef = ref<FormInstance>()
const verifyForm = reactive({
  username: '',
  phone: '',
  phoneCode: '',
  email: '',
  emailCode: ''
})

// 重置密码表单
const resetFormRef = ref<FormInstance>()
const resetForm = reactive({
  password: '',
  confirmPassword: ''
})

// 验证规则
const verifyRules = {
  username: [
    { required: true, message: '请输入用户账号', trigger: 'blur' }
  ],
  phoneCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度为6位', trigger: 'blur' }
  ],
  emailCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度为6位', trigger: 'blur' }
  ]
}

// 重置密码验证规则
const validatePass = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请输入新密码'))
  } else {
    if (resetForm.confirmPassword !== '') {
      if (resetFormRef.value) {
        resetFormRef.value.validateField('confirmPassword')
      }
    }
    callback()
  }
}

const validatePass2 = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'))
  } else if (value !== resetForm.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const resetRules = {
  password: [
    { required: true, validator: validatePass, trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass2, trigger: 'blur' }
  ]
}

// 发送验证码
const startCountdown = () => {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const sendPhoneCode = () => {
  ElMessage.success('验证码已发送至手机')
  startCountdown()
}

const sendEmailCode = () => {
  ElMessage.success('验证码已发送至邮箱')
  startCountdown()
}

// 处理下一步
const handleNext = async () => {
  if (currentStep.value === 0) {
    if (!verifyFormRef.value) return
    try {
      await verifyFormRef.value.validate()
      loading.value = true
      // 模拟验证过程
      setTimeout(() => {
        loading.value = false
        currentStep.value++
      }, 1000)
    } catch (error) {
      console.error('验证失败:', error)
    }
  } else if (currentStep.value === 1) {
    if (!resetFormRef.value) return
    try {
      await resetFormRef.value.validate()
      loading.value = true
      // 模拟重置密码过程
      setTimeout(() => {
        loading.value = false
        currentStep.value++
      }, 1000)
    } catch (error) {
      console.error('重置密码失败:', error)
    }
  }
}
</script>

<style scoped>
.forget-password-container {
  height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.forget-password-card {
  width: 500px;
  max-width: 100%;
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin-bottom: 20px;
}

.verify-code-input {
  display: flex;
  gap: 10px;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

:deep(.el-steps) {
  margin: 20px 0;
}
</style> 