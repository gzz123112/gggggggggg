<template>
  <div class="auth-page">
    <div class="auth-container animate__animated animate__fadeIn">
      <div class="auth-form-container">
        <div class="auth-header">
          <h2>欢迎回来</h2>
          <p>登录您的时光信笺账号</p>
        </div>

        <el-form 
          ref="formRef"
          :model="form"
          :rules="rules"
          class="auth-form"
        >
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

          <div class="form-options">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <el-link type="primary">忘记密码？</el-link>
          </div>

          <el-button 
            type="primary" 
            class="submit-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>

          <div class="auth-divider">
            <span>或</span>
          </div>

          <div class="auth-actions">
            <el-button
              type="primary"
              class="admin-btn"
              @click="goToAdminLogin"
            >
              管理员登录
            </el-button>
            
            <el-button
              class="guest-btn"
              @click="handleGuestLogin"
            >
              访客体验
            </el-button>
          </div>
        </el-form>

        <div class="auth-footer">
          <p>还没有账号？<el-link type="primary" @click="router.push('/register')">立即注册</el-link></p>
        </div>
      </div>

      <div class="auth-decoration">
        <div class="decoration-content">
          <h1>时光信笺</h1>
          <p>写给未来的自己，一封穿越时空的信</p>
          <div class="decoration-image">
            <!-- 可以先注释掉图片，或者确保文件存在 -->
            <!-- <img src="@/assets/images/auth-decoration.svg" alt="decoration" /> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const rememberMe = ref(false)

const form = ref({
  email: '',
  password: ''
})

const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    const loginData = {
      email: form.value.email,
      password: form.value.password
    }
    
    await userStore.login(loginData)
    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    console.error('登录错误:', error)
    ElMessage.error(error instanceof Error ? error.message : '登录失败')
  } finally {
    loading.value = false
  }
}

const handleGuestLogin = async () => {
  try {
    const success = await userStore.guestLogin()
    if (success) {
      ElMessage.success('欢迎体验时光信笺')
      router.push('/guest')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('访客登录失败')
  }
}

const goToAdminLogin = () => {
  router.push('/admin-login')
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
        
        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: $spacing-unit * 2;
        }
        
        .submit-btn {
          width: 100%;
          height: 44px;
          font-size: 1.1rem;
        }
        
        .auth-divider {
          display: flex;
          align-items: center;
          margin: $spacing-unit * 3 0;
          
          &::before,
          &::after {
            content: '';
            flex: 1;
            height: 1px;
            background: #ddd;
          }
          
          span {
            padding: 0 $spacing-unit * 2;
            color: #666;
          }
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
          max-width: 80%;
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

@media (max-width: $breakpoint-tablet) {
  .auth-container {
    flex-direction: column;
    width: 100%;
    
    .auth-decoration {
      display: none;
    }
  }
}

.auth-actions {
  margin-top: $spacing-unit * 3;
  display: flex;
  flex-direction: column;
  gap: $spacing-unit;
  
  .admin-btn {
    width: 100%;
    height: 44px;
    background: $primary-color;
    border-color: $primary-color;
    
    &:hover {
      background: darken($primary-color, 10%);
      border-color: darken($primary-color, 10%);
    }
  }
  
  .guest-btn {
    width: 100%;
    height: 44px;
  }
}
</style> 