<template>
  <div class="auth-page">
    <div class="auth-container animate__animated animate__fadeIn">
      <div class="auth-form-container">
        <div class="auth-header">
          <h2>管理员登录</h2>
          <p>请输入管理员账号和密码</p>
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
              placeholder="管理员账号"
              :prefix-icon="User"
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

          <el-button 
            type="primary" 
            class="submit-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form>

        <div class="auth-footer">
          <el-link type="primary" @click="router.push('/login')">返回用户登录</el-link>
        </div>
      </div>

      <div class="auth-decoration">
        <div class="decoration-content">
          <h1>管理后台</h1>
          <p>时光信笺管理系统</p>
          <div class="decoration-image">
            <img src="@/assets/images/admin-decoration.svg" alt="decoration" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import type { FormInstance } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = ref({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入管理员账号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 这里应该调用管理员登录接口
        await userStore.adminLogin(form.value.username, form.value.password)
        ElMessage.success('登录成功')
        router.push('/admin/dashboard')
      } catch (error) {
        ElMessage.error('登录失败')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped>
// 使用与普通登录页面相同的样式
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
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
      background: linear-gradient(135deg, darken($primary-color, 10%) 0%, darken($primary-color, 20%) 100%);
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
</style> 