<template>
  <div class="admin-settings">
    <!-- 系统设置 -->
    <el-card class="settings-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h2>系统设置</h2>
        </div>
      </template>

      <el-form :model="systemSettings" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="网站名称">
              <el-input v-model="systemSettings.siteName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="网站描述">
              <el-input
                v-model="systemSettings.siteDescription"
                type="textarea"
                :rows="3"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="维护模式">
              <el-switch v-model="systemSettings.maintenanceMode" />
              <div class="setting-desc">开启后网站将进入维护状态，仅管理员可访问</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="注册开关">
              <el-switch v-model="systemSettings.allowRegistration" />
              <div class="setting-desc">是否允许新用户注册</div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 邮件设置 -->
    <el-card class="settings-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h2>邮件设置</h2>
        </div>
      </template>

      <el-form :model="mailSettings" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="SMTP 服务器">
              <el-input v-model="mailSettings.smtpHost" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="SMTP 端口">
              <el-input v-model="mailSettings.smtpPort" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发件邮箱">
              <el-input v-model="mailSettings.fromEmail" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱密码">
              <el-input v-model="mailSettings.password" type="password" show-password />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item>
          <el-button type="primary" @click="testMailSettings">测试邮件设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 安全设置 -->
    <el-card class="settings-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h2>安全设置</h2>
        </div>
      </template>

      <el-form :model="securitySettings" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="密码最小长度">
              <el-input-number v-model="securitySettings.minPasswordLength" :min="6" :max="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="登录尝试次数">
              <el-input-number v-model="securitySettings.maxLoginAttempts" :min="3" :max="10" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="锁定时间(分钟)">
              <el-input-number v-model="securitySettings.lockoutDuration" :min="15" :max="120" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密码复杂度">
              <el-switch v-model="securitySettings.requireComplexPassword" />
              <div class="setting-desc">要求密码包含大小写字母、数字和特殊字符</div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 操作按钮 -->
    <div class="settings-actions">
      <el-button @click="resetSettings">恢复默认</el-button>
      <el-button type="primary" @click="saveSettings" :loading="saving">保存设置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const saving = ref(false)

const systemSettings = ref({
  siteName: '时光信笺',
  siteDescription: '写给未来的一封信',
  maintenanceMode: false,
  allowRegistration: true
})

const mailSettings = ref({
  smtpHost: '',
  smtpPort: '',
  fromEmail: '',
  password: ''
})

const securitySettings = ref({
  minPasswordLength: 8,
  maxLoginAttempts: 5,
  lockoutDuration: 30,
  requireComplexPassword: true
})

const testMailSettings = async () => {
  try {
    await ElMessageBox.confirm('确定要发送测试邮件吗？', '提示', {
      type: 'warning'
    })
    // TODO: 调用测试邮件 API
    ElMessage.success('测试邮件已发送')
  } catch {
    // 用户取消操作
  }
}

const saveSettings = async () => {
  saving.value = true
  try {
    // TODO: 调用保存设置 API
    await new Promise(resolve => setTimeout(resolve, 1000))
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
    // TODO: 调用重置设置 API
    ElMessage.success('已恢复默认设置')
  } catch {
    // 用户取消操作
  }
}
</script>

<style lang="scss" scoped>
.admin-settings {
  .settings-card {
    margin-bottom: $spacing-unit * 3;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: none;
    transition: transform 0.3s;
    
    &:hover {
      transform: translateY(-2px);
    }
    
    .card-header {
      h2 {
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
  
  .settings-actions {
    display: flex;
    justify-content: center;
    gap: $spacing-unit * 2;
    margin-top: $spacing-unit * 4;
  }
}
</style> 