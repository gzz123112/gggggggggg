<template>
  <div class="about-container">
    <el-container>
      <el-header class="about-header">
        <div class="header-content">
          <h2>关于我们</h2>
          <el-button @click="router.push('/my')">返回</el-button>
        </div>
      </el-header>

      <el-main class="about-main">
        <el-row :gutter="20">
          <el-col :span="16" :offset="4">
            <!-- 产品概述 -->
            <el-card class="section-card">
              <template #header>
                <h3>产品概述</h3>
              </template>
              <div class="section-content">
                <p>时光邮递是一款创新的数字信件服务，让用户能够跨越时间与空间，传递真挚情感。我们致力于为用户提供安全、私密的信件存储和投递服务。</p>
              </div>
            </el-card>

            <!-- 提出建议 -->
            <el-card class="section-card">
              <template #header>
                <h3>提出建议</h3>
              </template>
              <div class="section-content">
                <el-form
                  ref="suggestionFormRef"
                  :model="suggestionForm"
                  :rules="suggestionRules"
                  label-position="top"
                >
                  <el-form-item label="建议类型" prop="type">
                    <el-select v-model="suggestionForm.type" placeholder="请选择建议类型">
                      <el-option label="功能建议" value="feature" />
                      <el-option label="界面优化" value="ui" />
                      <el-option label="使用体验" value="experience" />
                      <el-option label="其他" value="other" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="建议内容" prop="content">
                    <el-input
                      v-model="suggestionForm.content"
                      type="textarea"
                      :rows="4"
                      placeholder="请详细描述您的建议..."
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="submitSuggestion">
                      提交建议
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>
            </el-card>

            <!-- 联系我们 -->
            <el-card class="section-card">
              <template #header>
                <h3>联系我们</h3>
              </template>
              <div class="section-content contact-info">
                <p><el-icon><Message /></el-icon> 邮箱：support@timeletters.com</p>
                <p><el-icon><Phone /></el-icon> 电话：400-123-4567</p>
                <p><el-icon><Location /></el-icon> 地址：广东省广州市番禺区大学城</p>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Message, Phone, Location } from '@element-plus/icons-vue'

const router = useRouter()

const suggestionForm = ref({
  type: '',
  content: ''
})

const suggestionRules = {
  type: [{ required: true, message: '请选择建议类型', trigger: 'change' }],
  content: [{ required: true, message: '请填写建议内容', trigger: 'blur' }]
}

const submitSuggestion = async () => {
  if (!suggestionFormRef.value) return
  
  try {
    await suggestionFormRef.value.validate()
    // 保存建议
    const suggestions = JSON.parse(localStorage.getItem('suggestions') || '[]')
    suggestions.push({
      id: Date.now(),
      userId: JSON.parse(localStorage.getItem('user') || '{}').id,
      ...suggestionForm.value,
      time: new Date().toISOString()
    })
    localStorage.setItem('suggestions', JSON.stringify(suggestions))
    
    ElMessage.success('感谢您的建议！')
    suggestionForm.value = { type: '', content: '' }
  } catch (error) {
    console.error('提交建议失败:', error)
  }
}
</script>

<style scoped>
.about-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.about-header {
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.about-main {
  padding: 40px 20px;
}

.section-card {
  margin-bottom: 30px;
}

.section-card h3 {
  margin: 0;
  color: #303133;
}

.section-content {
  line-height: 1.8;
  color: #606266;
}

.section-content ul {
  padding-left: 20px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.contact-info p {
  display: flex;
  align-items: center;
  gap: 10px;
}

:deep(.el-icon) {
  color: #409eff;
}
</style> 