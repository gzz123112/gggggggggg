<template>
  <div class="admin-profile">
    <el-card class="profile-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h2>管理员资料</h2>
        </div>
      </template>

      <el-form 
        :model="profileForm" 
        :rules="rules"
        ref="formRef"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="profileForm.username" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="profileForm.email" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit">保存修改</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'

const userStore = useUserStore()
const formRef = ref<FormInstance>()

const profileForm = ref({
  username: userStore.currentUser?.username || '',
  email: userStore.currentUser?.email || ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    // TODO: 调用 API 更新用户信息
    ElMessage.success('个人资料已更新')
  } catch (error) {
    console.error(error)
    ElMessage.error('请检查表单内容')
  }
}
</script>

<style lang="scss" scoped>
.admin-profile {
  .profile-card {
    max-width: 600px;
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: none;
    
    .card-header {
      h2 {
        margin: 0;
        font-size: 1.2rem;
        color: $text-color;
        font-family: $font-family-decorative;
      }
    }
  }
}
</style> 