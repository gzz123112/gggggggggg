<template>
  <div class="settings-page">
    <el-row :gutter="20">
      <!-- 主题设置 -->
      <el-col :span="12">
        <el-card class="theme-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3>主题设置</h3>
            </div>
          </template>

          <div class="theme-preview">
            <ThemePreview />
          </div>

          <el-form :model="settings" label-width="100px">
            <el-form-item label="深色模式">
              <el-switch
                v-model="settings.theme.darkMode"
                @change="toggleDarkMode"
              />
            </el-form-item>

            <el-form-item label="字体大小">
              <el-slider
                v-model="settings.theme.fontSize"
                :min="12"
                :max="20"
                :step="1"
                show-input
                @change="setFontSize"
              />
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 通知设置 -->
      <el-col :span="12">
        <el-card class="notification-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3>通知设置</h3>
            </div>
          </template>

          <el-form :model="settings" label-width="100px">
            <el-form-item label="邮件通知">
              <el-switch v-model="settings.notification.email" />
              <div class="setting-desc">接收信件发送成功的邮件通知</div>
            </el-form-item>

            <el-form-item label="浏览器通知">
              <el-switch v-model="settings.notification.browser" />
              <div class="setting-desc">接收浏览器桌面通知</div>
            </el-form-item>

            <el-form-item label="提醒时间">
              <el-select v-model="settings.notification.reminderTime">
                <el-option label="提前1天" value="24" />
                <el-option label="提前3天" value="72" />
                <el-option label="提前1周" value="168" />
              </el-select>
              <div class="setting-desc">信件发送前提醒时间</div>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <!-- 隐私设置 -->
    <el-card class="privacy-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h3>隐私设置</h3>
        </div>
      </template>

      <el-form :model="settings" label-width="100px">
        <el-form-item label="公开信件">
          <el-switch v-model="settings.privacy.publicLetters" />
          <div class="setting-desc">允许其他用户查看我的信件</div>
        </el-form-item>

        <el-form-item label="显示时间线">
          <el-switch v-model="settings.privacy.showTimeline" />
          <div class="setting-desc">在个人主页显示信件时间线</div>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="settings-actions">
      <el-button type="primary" @click="saveSettings" :loading="saving">
        保存设置
      </el-button>
      <el-button @click="resetSettings">恢复默认</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import NotificationBackup from '@/components/NotificationBackup.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { useTheme } from '@/composables/useTheme'

const settingsStore = useSettingsStore()
const saving = ref(false)

const settings = ref({
  theme: {
    darkMode: false,
    fontSize: 14
  },
  notification: {
    email: true,
    browser: true
  },
  privacy: {
    publicLetters: false,
    showTimeline: true
  },
  twoFactorAuth: false
})

const { themes, currentTheme, isDark, setTheme, toggleDark } = useTheme()

const showChangePassword = ref(false)
const passwordFormRef = ref<FormInstance>()
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const predefineColors = [
  '#409EFF',
  '#67C23A',
  '#E6A23C',
  '#F56C6C',
  '#909399'
]

const validatePass = (rule: any, value: string, callback: Function) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    if (passwordForm.value.confirmPassword !== '') {
      if (passwordFormRef.value) {
        passwordFormRef.value.validateField('confirmPassword')
      }
    }
    callback()
  }
}

const validatePass2 = (rule: any, value: string, callback: Function) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== passwordForm.value.newPassword) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { validator: validatePass, trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validatePass2, trigger: 'blur' }
  ]
}

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    // TODO: 调用修改密码 API
    ElMessage.success('密码修改成功')
    showChangePassword.value = false
  } catch (error) {
    console.error(error)
    ElMessage.error('请检查表单内容')
  }
}

const toggleDarkMode = (value: boolean) => {
  document.documentElement.classList.toggle('dark', value)
}

const setFontSize = (value: number) => {
  document.documentElement.style.fontSize = `${value}px`
}

const saveSettings = async () => {
  saving.value = true
  try {
    await settingsStore.updateSettings(settings.value)
    ElMessage.success('设置已保存')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const resetSettings = async () => {
  try {
    await ElMessageBox.confirm('确定要恢复默认设置吗？', '提示', {
      type: 'warning'
    })
    settings.value = settingsStore.getDefaultSettings()
    ElMessage.success('已恢复默认设置')
  } catch {
    // 用户取消操作
  }
}
</script>

<style lang="scss" scoped>
.settings-page {
  padding: $spacing-unit * 3;
  background: linear-gradient(135deg, #f5f7fa 0%, #f8f9fa 100%);
  min-height: calc(100vh - 60px);

  .theme-card,
  .notification-card,
  .privacy-card {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: none;
    margin-bottom: $spacing-unit * 3;
    
    .card-header {
      h3 {
        margin: 0;
        font-size: 1.2rem;
        color: $text-color;
        font-family: $font-family-decorative;
      }
    }
    
    .setting-desc {
      font-size: 0.9rem;
      color: #666;
      margin-top: $spacing-unit;
    }
  }

  .theme-preview {
    margin-bottom: $spacing-unit * 3;
  }

  .settings-actions {
    display: flex;
    justify-content: center;
    gap: $spacing-unit * 2;
    margin-top: $spacing-unit * 4;
  }
}
</style> 