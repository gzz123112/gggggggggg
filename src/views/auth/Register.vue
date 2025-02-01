<template>
  <div class="auth-page">
    <div class="auth-container animate__animated animate__fadeIn">
      <div class="auth-form-container">
        <div class="auth-header">
          <h2>创建账号</h2>
          <p>加入时光信笺，开始您的写信之旅</p>
        </div>

        <el-form 
          ref="formRef"
          :model="form"
          :rules="rules"
          class="auth-form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="用户名"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="email">
            <el-input
              v-model="form.email"
              placeholder="邮箱"
              :prefix-icon="Message"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="密码"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="确认密码"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="form.agreement">
              我已阅读并同意
              <el-link type="primary" @click="showAgreement">用户协议</el-link>
              和
              <el-link type="primary" @click="showPrivacy">隐私政策</el-link>
            </el-checkbox>
          </el-form-item>

          <el-button 
            type="primary" 
            class="submit-btn"
            :loading="loading"
            :disabled="!form.agreement"
            @click="handleRegister"
          >
            注册
          </el-button>
        </el-form>

        <div class="auth-footer">
          <p>已有账号？<el-link type="primary" @click="router.push('/login')">立即登录</el-link></p>
        </div>
      </div>

      <div class="auth-decoration">
        <div class="decoration-content">
          <h1>时光信笺</h1>
          <p>写给未来的自己，一封穿越时空的信</p>
          <div class="decoration-image">
            <img src="@/assets/images/auth-decoration.svg" alt="decoration" />
          </div>
        </div>
      </div>
    </div>

    <!-- 用户协议对话框 -->
    <el-dialog
      v-model="agreementVisible"
      title="用户协议"
      width="50%"
    >
      <div class="agreement-content">
        <!-- 这里放用户协议内容 -->
      </div>
    </el-dialog>

    <!-- 隐私政策对话框 -->
    <el-dialog
      v-model="privacyVisible"
      title="隐私政策"
      width="50%"
    >
      <div class="privacy-content">
        <!-- 这里放隐私政策内容 -->
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, Message, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreement: false
})

const validatePass = (rule: any, value: string, callback: Function) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    if (form.value.confirmPassword !== '') {
      if (formRef.value) {
        formRef.value.validateField('confirmPassword')
      }
    }
    callback()
  }
}

const validatePass2 = (rule: any, value: string, callback: Function) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.value.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { validator: validatePass, trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validatePass2, trigger: 'blur' }
  ]
}

const agreementVisible = ref(false)
const privacyVisible = ref(false)

const showAgreement = () => {
  agreementVisible.value = true
}

const showPrivacy = () => {
  privacyVisible.value = true
}

const handleRegister = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    await userStore.register({
      username: form.value.username,
      email: form.value.email,
      password: form.value.password,
      confirmPassword: form.value.confirmPassword
    })
    
    ElMessage.success('注册成功')
    router.push('/login')
  } catch (error) {
    console.error(error)
    ElMessage.error(error instanceof Error ? error.message : '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $background-color 0%, lighten($secondary-color, 10%) 100%);
  padding: $spacing-unit * 2;
  
  .auth-container {
    display: flex;
    width: 1000px;
    min-height: 600px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    
    .auth-form-container {
      flex: 1;
      padding: $spacing-unit * 6;
      display: flex;
      flex-direction: column;
      
      .auth-header {
        text-align: center;
        margin-bottom: $spacing-unit * 4;
        
        h2 {
          font-family: $font-family-decorative;
          font-size: 2rem;
          color: $text-color;
          margin-bottom: $spacing-unit;
        }
        
        p {
          color: #666;
        }
      }
      
      .auth-form {
        flex: 1;
        
        .submit-btn {
          width: 100%;
          height: 44px;
          font-size: 1.1rem;
          margin-top: $spacing-unit * 2;
        }
      }
      
      .auth-footer {
        text-align: center;
        margin-top: $spacing-unit * 3;
      }
    }
    
    .auth-decoration {
      flex: 1;
      background: linear-gradient(135deg, $primary-color 0%, darken($primary-color, 10%) 100%);
      padding: $spacing-unit * 6;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      
      .decoration-content {
        text-align: center;
        
        h1 {
          font-family: $font-family-decorative;
          font-size: 3rem;
          margin-bottom: $spacing-unit * 2;
        }
        
        p {
          font-size: 1.2rem;
          opacity: 0.9;
          margin-bottom: $spacing-unit * 4;
        }
        
        .decoration-image {
          max-width: 300px;
          margin: 0 auto;
          
          img {
            width: 100%;
            height: auto;
          }
        }
      }
    }
  }
}

.agreement-content,
.privacy-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: $spacing-unit * 2;
  line-height: 1.6;
}
</style> 