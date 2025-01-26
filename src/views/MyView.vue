<template>
  <div class="my-container">
    <el-container>
      <el-header class="my-header">
        <div class="header-content">
          <h2>我的空间</h2>
          <el-button type="danger" @click="logout">退出登录</el-button>
        </div>
      </el-header>
      
      <el-main class="my-main">
        <!-- 功能卡片区域 -->
        <el-row :gutter="20" class="feature-section">
          <el-col :span="6">
            <el-card class="feature-card write" @click="router.push('/write')">
              <el-icon class="feature-icon"><EditPen /></el-icon>
              <h3>写新信件</h3>
              <p>记录此刻的心情，寄给未来的自己</p>
            </el-card>
          </el-col>
          
          <el-col :span="6">
            <el-card class="feature-card drafts" @click="router.push('/drafts')">
              <el-icon class="feature-icon"><Files /></el-icon>
              <h3>我的草稿</h3>
              <p>{{ draftCount }}封未完成的信件</p>
              <p class="sub-text">点击继续编辑您的草稿</p>
            </el-card>
          </el-col>
          
          <el-col :span="6">
            <el-card class="feature-card mailbox" @click="router.push('/mailbox')">
              <el-icon class="feature-icon"><Message /></el-icon>
              <h3>我的信箱</h3>
              <p>{{ unreadCount }}封未读信件</p>
              <p class="sub-text">查看来自过去的信件</p>
            </el-card>
          </el-col>
          
          <el-col :span="6">
            <el-card class="feature-card appeals" @click="showAppealDialog">
              <el-icon class="feature-icon"><Warning /></el-icon>
              <h3>信件申诉</h3>
              <p>{{ appealCount }}个申诉待处理</p>
              <p class="sub-text">点击提交新的申诉</p>
            </el-card>
          </el-col>
        </el-row>

        <!-- 统计信息区域 -->
        <div class="stats-section">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-card class="stats-card">
                <template #header>
                  <div class="stats-header">
                    <el-icon><Timer /></el-icon>
                    <span>已发送</span>
                  </div>
                </template>
                <div class="stats-value">{{ stats.sentCount }}封</div>
                <div class="stats-label">寄出的信件</div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card class="stats-card">
                <template #header>
                  <div class="stats-header">
                    <el-icon><Calendar /></el-icon>
                    <span>等待中</span>
                  </div>
                </template>
                <div class="stats-value">{{ stats.waitingCount }}封</div>
                <div class="stats-label">未到期信件</div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card class="stats-card">
                <template #header>
                  <div class="stats-header">
                    <el-icon><Collection /></el-icon>
                    <span>收到</span>
                  </div>
                </template>
                <div class="stats-value">{{ stats.receivedCount }}封</div>
                <div class="stats-label">已送达信件</div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 最近活动 -->
        <div class="activity-section">
          <el-card>
            <template #header>
              <div class="activity-header">
                <h3>最近活动</h3>
              </div>
            </template>
            <el-timeline>
              <el-timeline-item
                v-for="activity in recentActivities"
                :key="activity.id"
                :timestamp="activity.time"
                :type="activity.type"
              >
                {{ activity.content }}
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </div>
      </el-main>

      <el-footer class="my-footer">
        <p>© 2024 时光邮递. 让每一封信都承载着温暖与期待</p>
      </el-footer>
    </el-container>

    <!-- 添加申诉对话框 -->
    <el-dialog
      v-model="showAppealForm"
      title="提交申诉"
      width="500px"
    >
      <el-form
        ref="appealFormRef"
        :model="appealForm"
        :rules="appealRules"
        label-width="100px"
      >
        <el-form-item label="申诉类型" prop="type">
          <el-select v-model="appealForm.type" placeholder="请选择申诉类型">
            <el-option label="内容审核" value="content" />
            <el-option label="信件问题" value="letter" />
            <el-option label="其他问题" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="申诉内容" prop="content">
          <el-input
            v-model="appealForm.content"
            type="textarea"
            :rows="4"
            placeholder="请详细描述您的问题..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAppealForm = false">取消</el-button>
          <el-button type="primary" @click="submitAppeal">提交申诉</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加申诉列表对话框 -->
    <el-dialog
      v-model="showAppealList"
      title="我的申诉"
      width="700px"
    >
      <el-table :data="myAppeals" style="width: 100%">
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag>{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="申诉内容" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'pending' ? 'warning' : 'success'">
              {{ row.status === 'pending' ? '处理中' : '已处理' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="result" label="处理结果" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  EditPen,
  Files,
  Message,
  Timer,
  Calendar,
  Collection,
  Warning
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const draftCount = ref(0)
const unreadCount = ref(0)

// 统计数据
const stats = ref({
  sentCount: 0,
  waitingCount: 0,
  receivedCount: 0
})

// 最近活动
const recentActivities = ref([
  {
    id: 1,
    content: '写了一封新信《致未来的自己》',
    time: '2024-03-15 14:30',
    type: 'primary'
  },
  {
    id: 2,
    content: '收到一封来自2023年的信',
    time: '2024-03-14 09:15',
    type: 'success'
  },
  {
    id: 3,
    content: '保存了一封草稿',
    time: '2024-03-13 16:45',
    type: 'info'
  }
])

// 申诉相关的响应式变量
const showAppealForm = ref(false)
const showAppealList = ref(false)
const appealCount = ref(0)
const myAppeals = ref([])

const appealForm = ref({
  type: '',
  content: ''
})

const appealRules = {
  type: [{ required: true, message: '请选择申诉类型', trigger: 'change' }],
  content: [{ required: true, message: '请填写申诉内容', trigger: 'blur' }]
}

// 显示申诉对话框
const showAppealDialog = () => {
  showAppealList = true
}

// 提交申诉
const submitAppeal = async () => {
  if (!appealFormRef.value) return
  
  try {
    await appealFormRef.value.validate()
    const appeal = {
      id: Date.now(),
      userId: JSON.parse(localStorage.getItem('user') || '{}').id,
      type: appealForm.value.type,
      content: appealForm.value.content,
      status: 'pending',
      submitTime: new Date().toISOString()
    }

    // 保存申诉
    const appeals = JSON.parse(localStorage.getItem('appeals') || '[]')
    appeals.push(appeal)
    localStorage.setItem('appeals', JSON.stringify(appeals))

    // 更新活动记录
    const activities = JSON.parse(localStorage.getItem('activities') || '[]')
    activities.unshift({
      id: Date.now(),
      userId: appeal.userId,
      content: `提交了一个${appeal.type}类型的申诉`,
      time: new Date().toISOString(),
      type: 'warning'
    })
    localStorage.setItem('activities', JSON.stringify(activities))

    ElMessageBox.success('申诉已提交')
    showAppealForm.value = false
    loadMyAppeals()
  } catch (error) {
    console.error('提交申诉失败:', error)
  }
}

// 加载我的申诉
const loadMyAppeals = () => {
  const userId = JSON.parse(localStorage.getItem('user') || '{}').id
  const appeals = JSON.parse(localStorage.getItem('appeals') || '[]')
  myAppeals.value = appeals.filter((a: any) => a.userId === userId)
  appealCount.value = myAppeals.value.filter((a: any) => a.status === 'pending').length
}

const logout = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    router.push('/')
  })
}

const loadStatistics = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) return

    // 加载草稿数量
    const drafts = JSON.parse(localStorage.getItem('letterDrafts') || '[]')
    const userDrafts = drafts.filter((d: any) => d.userId === user.id)
    draftCount.value = userDrafts.length

    // 加载信件统计
    const letters = JSON.parse(localStorage.getItem('letters') || '[]')
    const now = new Date()
    
    // 只统计当前用户的信件
    const userLetters = letters.filter((l: any) => l.userId === user.id)
    
    stats.value = {
      sentCount: userLetters.length, // 总发送数
      waitingCount: userLetters.filter((l: any) => 
        new Date(l.receiveTime) > now
      ).length,
      receivedCount: userLetters.filter((l: any) => 
        new Date(l.receiveTime) <= now
      ).length
    }

    // 更新未读信件数量
    unreadCount.value = userLetters.filter((l: any) => 
      new Date(l.receiveTime) <= now && !l.isRead
    ).length

    // 加载活动记录
    const activities = JSON.parse(localStorage.getItem('activities') || '[]')
    recentActivities.value = activities
      .filter((a: any) => a.userId === user.id)
      .sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5)
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

// 在 onMounted 中添加
onMounted(() => {
  loadStatistics()
  // 每分钟刷新一次数据
  setInterval(loadStatistics, 60000)
  loadMyAppeals()
})
</script>

<style scoped>
.my-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.my-header {
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

.my-main {
  padding: 40px 20px;
}

.feature-section {
  margin-bottom: 40px;
}

.feature-card {
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  padding: 20px;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 40px;
  margin-bottom: 15px;
  color: #409eff;
}

.feature-card h3 {
  margin: 10px 0;
  color: #303133;
}

.feature-card p {
  color: #606266;
  margin: 5px 0;
}

.sub-text {
  font-size: 12px;
  color: #909399;
}

.stats-section {
  margin-bottom: 40px;
}

.stats-card {
  text-align: center;
}

.stats-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #606266;
}

.stats-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin: 10px 0;
}

.stats-label {
  color: #909399;
  font-size: 14px;
}

.activity-section {
  max-width: 800px;
  margin: 0 auto;
}

.activity-header h3 {
  margin: 0;
  color: #303133;
}

.my-footer {
  text-align: center;
  padding: 20px;
  background-color: white;
  color: #909399;
}

/* 为不同功能卡片设置不同的悬停效果 */
.write:hover {
  border-color: #67c23a;
  .feature-icon {
    color: #67c23a;
  }
}

.drafts:hover {
  border-color: #e6a23c;
  .feature-icon {
    color: #e6a23c;
  }
}

.mailbox:hover {
  border-color: #f56c6c;
  .feature-icon {
    color: #f56c6c;
  }
}
</style> 