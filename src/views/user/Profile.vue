<template>
  <div class="profile-page">
    <el-row :gutter="20">
      <!-- 左侧个人信息卡片 -->
      <el-col :span="8">
        <el-card class="profile-card" shadow="hover">
          <div class="profile-header">
            <el-upload
              class="avatar-uploader"
              action="/api/upload"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
            >
              <div class="avatar-wrapper">
                <el-avatar 
                  :size="120" 
                  :src="profileForm.avatar"
                  class="user-avatar"
                />
                <div class="avatar-mask">
                  <el-icon><Camera /></el-icon>
                  <span>更换头像</span>
                </div>
              </div>
            </el-upload>
            <h2>{{ profileForm.username }}</h2>
            <p class="user-email">{{ profileForm.email }}</p>
          </div>
          
          <div class="profile-stats">
            <div class="stat-item">
              <div class="stat-value">{{ stats.totalLetters }}</div>
              <div class="stat-label">总信件</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ stats.scheduledLetters }}</div>
              <div class="stat-label">待发送</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ stats.sentLetters }}</div>
              <div class="stat-label">已发送</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧表单 -->
      <el-col :span="16">
        <el-card class="form-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3>个人资料设置</h3>
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

            <el-form-item label="个性签名" prop="bio">
              <el-input 
                v-model="profileForm.bio" 
                type="textarea" 
                :rows="3"
                placeholder="写点什么来介绍自己吧..."
              />
            </el-form-item>

            <el-form-item label="所在地" prop="location">
              <el-cascader
                v-model="profileForm.location"
                :options="locationOptions"
                :props="{
                  expandTrigger: 'hover',
                  value: 'value',
                  label: 'label',
                  children: 'children'
                }"
                placeholder="请选择所在地"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleSubmit">保存修改</el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Camera } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { formatDate } from '@/utils/date'
import type { FormInstance } from 'element-plus'
import { provinces } from '@/data/regions'

const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const profileForm = ref({
  username: userStore.currentUser?.username || '',
  email: userStore.currentUser?.email || '',
  avatar: userStore.currentUser?.avatar || '',
  bio: userStore.currentUser?.bio || '',
  location: userStore.currentUser?.location || []
})

const stats = ref({
  totalLetters: 0,
  scheduledLetters: 0,
  sentLetters: 0
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ]
}

const locationOptions = provinces

const handleAvatarSuccess = (res: any) => {
  profileForm.value.avatar = res.url
}

const beforeAvatarUpload = (file: File) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('头像只能是 JPG 或 PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
  }
  return isJPG && isLt2M
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

const resetForm = () => {
  // TODO: 重置表单
  ElMessage.success('表单已重置')
}

const fetchUserStatistics = async () => {
  try {
    const response = await fetch(`/api/users/${userStore.currentUser?.id}/statistics`, {
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })
    const data = await response.json()
    if (data.code === 200) {
      stats.value = data.data
    }
  } catch (error) {
    console.error('获取用户统计信息失败:', error)
  }
}

onMounted(() => {
  fetchUserStatistics()
})
</script>

<style lang="scss" scoped>
.profile-page {
  padding: $spacing-unit * 3;
  background: linear-gradient(135deg, #f5f7fa 0%, #f8f9fa 100%);
  min-height: calc(100vh - 60px);

  .profile-card {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: none;
    
    .profile-header {
      text-align: center;
      padding: $spacing-unit * 2;
      
      .avatar-wrapper {
        position: relative;
        width: 120px;
        height: 120px;
        margin: 0 auto;
        border-radius: 50%;
        overflow: hidden;
        cursor: pointer;
        
        .user-avatar {
          width: 100%;
          height: 100%;
          transition: transform 0.3s;
        }
        
        .avatar-mask {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          opacity: 0;
          transition: opacity 0.3s;
          
          .el-icon {
            font-size: 24px;
            margin-bottom: 8px;
          }
        }
        
        &:hover {
          .user-avatar {
            transform: scale(1.1);
          }
          
          .avatar-mask {
            opacity: 1;
          }
        }
      }
      
      h2 {
        margin: $spacing-unit * 2 0 $spacing-unit;
        font-family: $font-family-decorative;
        color: $text-color;
      }
      
      .user-email {
        color: #666;
      }
    }
    
    .profile-stats {
      display: flex;
      justify-content: space-around;
      padding: $spacing-unit * 2;
      border-top: 1px solid #eee;
      
      .stat-item {
        text-align: center;
        
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: $primary-color;
        }
        
        .stat-label {
          color: #666;
          margin-top: 4px;
        }
      }
    }
  }

  .form-card {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: none;
    
    .card-header {
      h3 {
        margin: 0;
        font-size: 1.2rem;
        color: $text-color;
      }
    }
  }
}
</style> 