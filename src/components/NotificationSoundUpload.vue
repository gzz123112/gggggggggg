<template>
  <div class="sound-upload">
    <el-upload
      class="sound-uploader"
      accept="audio/*"
      :auto-upload="false"
      :show-file-list="false"
      :on-change="handleFileChange"
    >
      <template #trigger>
        <el-button type="primary">
          <el-icon><Upload /></el-icon>
          上传声音文件
        </el-button>
      </template>
    </el-upload>

    <div class="sound-list">
      <div
        v-for="(sound, type) in sounds"
        :key="type"
        class="sound-item"
      >
        <div class="sound-info">
          <span class="sound-type">{{ getSoundTypeName(type) }}</span>
          <span class="sound-name">{{ getFileName(sound) }}</span>
        </div>
        <div class="sound-actions">
          <el-button 
            circle 
            text
            @click="playSound(type)"
          >
            <el-icon><VideoPlay /></el-icon>
          </el-button>
          <el-button 
            circle 
            text
            type="danger"
            @click="resetSound(type)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Upload, VideoPlay, Delete } from '@element-plus/icons-vue'
import { useNotificationSound } from '@/composables/useNotificationSound'

const { sounds, playSound } = useNotificationSound()

const soundTypeNames = {
  default: '默认提示音',
  success: '成功提示音',
  warning: '警告提示音',
  error: '错误提示音'
}

const getSoundTypeName = (type: string) => {
  return soundTypeNames[type as keyof typeof soundTypeNames] || type
}

const getFileName = (path: string) => {
  return path.split('/').pop() || path
}

const handleFileChange = async (file: File) => {
  if (!file) return
  
  // 检查文件大小（最大 1MB）
  if (file.size > 1024 * 1024) {
    ElMessage.error('音频文件不能超过1MB')
    return
  }

  // 检查文件类型
  if (!file.type.startsWith('audio/')) {
    ElMessage.error('请上传音频文件')
    return
  }

  try {
    // 实际项目中这里应该上传到服务器
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      // 保存到本地存储或发送到服务器
      ElMessage.success('上传成功')
    }
  } catch (error) {
    ElMessage.error('上传失败')
  }
}

const resetSound = (type: string) => {
  // 重置为默认声音
}
</script>

<style lang="scss" scoped>
.sound-upload {
  .sound-list {
    margin-top: $spacing-unit * 2;
  }

  .sound-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-unit;
    border-bottom: 1px solid var(--el-border-color-light);

    .sound-info {
      .sound-type {
        font-weight: bold;
        margin-right: $spacing-unit;
      }

      .sound-name {
        color: var(--el-text-color-secondary);
        font-size: 0.9em;
      }
    }

    .sound-actions {
      display: flex;
      gap: $spacing-unit;
    }
  }
}
</style> 