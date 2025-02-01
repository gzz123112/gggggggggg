<template>
  <div class="auth-page">
    <div class="auth-container animate__animated animate__fadeIn">
      <div class="auth-form-container">
        <div class="auth-header">
          <h2>重置密码</h2>
          <p>我们将向您的邮箱发送重置密码的链接</p>
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

          <el-button 
            type="primary" 
            class="submit-btn"
            :loading="loading"
            @click="handleSubmit"
          >
            发送重置链接
          </el-button>
        </el-form>

        <div class="auth-footer">
          <p>
            <el-link type="primary" @click="router.push('/login')">返回登录</el-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = ref({
  email: ''
})

const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    // TODO: 调用重置密码 API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('重置链接已发送到您的邮箱')
    router.push('/login')
  } catch (error) {
    console.error(error)
    ElMessage.error('发送失败，请稍后重试')
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
    width: 100%;
    max-width: 400px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    padding: $spacing-unit * 4;
    
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
      .submit-btn {
        width: 100%;
        height: 44px;
        font-size: 1.1rem;
      }
    }
    
    .auth-footer {
      text-align: center;
      margin-top: $spacing-unit * 3;
    }
  }
}
</style> 