<template>
  <div class="mailbox-container">
    <el-container>
      <el-header class="mailbox-header">
        <div class="header-content">
          <h2>我的信箱</h2>
          <el-button @click="router.push('/my')">返回</el-button>
        </div>
      </el-header>

      <el-main class="mailbox-main">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="收到的信件" name="received">
            <el-table :data="receivedLetters" style="width: 100%">
              <el-table-column prop="title" label="信件标题" />
              <el-table-column prop="sendTime" label="发送时间" width="180" />
              <el-table-column prop="receiveTime" label="接收时间" width="180" />
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.isRead ? 'info' : 'success'">
                    {{ row.isRead ? '已读' : '未读' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200">
                <template #default="{ row }">
                  <el-button-group>
                    <el-button type="primary" size="small" @click="readLetter(row)">
                      {{ row.isRead ? '重读' : '阅读' }}
                    </el-button>
                    <el-button type="danger" size="small" @click="deleteLetter(row)">
                      删除
                    </el-button>
                  </el-button-group>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="等待中的信件" name="waiting">
            <el-table :data="waitingLetters" style="width: 100%">
              <el-table-column prop="title" label="信件标题" />
              <el-table-column prop="sendTime" label="发送时间" width="180" />
              <el-table-column prop="receiveTime" label="预计接收时间" width="180" />
              <el-table-column label="状态" width="100">
                <template #default>
                  <el-tag type="warning">等待中</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>

    <!-- 阅读信件对话框 -->
    <el-dialog
      v-model="showLetterDialog"
      :title="currentLetter?.title"
      width="60%"
    >
      <div class="letter-content">
        <p>{{ currentLetter?.content }}</p>
      </div>
      <div class="letter-info">
        <p>发送时间：{{ currentLetter?.sendTime }}</p>
        <p>接收时间：{{ currentLetter?.receiveTime }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'

const router = useRouter()
const activeTab = ref('received')
const receivedLetters = ref([])
const waitingLetters = ref([])
const showLetterDialog = ref(false)
const currentLetter = ref(null)

const loadLetters = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) return

    const letters = JSON.parse(localStorage.getItem('letters') || '[]')
    const now = new Date()
    
    // 只加载当前用户的信件
    const userLetters = letters.filter((l: any) => l.userId === user.id)
    
    // 收到的信件（已到期的信件）
    receivedLetters.value = userLetters.filter((letter: any) => 
      new Date(letter.receiveTime) <= now
    ).sort((a: any, b: any) => new Date(b.receiveTime).getTime() - new Date(a.receiveTime).getTime())
    
    // 等待中的信件（未到期的信件）
    waitingLetters.value = userLetters.filter((letter: any) => 
      new Date(letter.receiveTime) > now
    ).sort((a: any, b: any) => new Date(a.receiveTime).getTime() - new Date(b.receiveTime).getTime())
  } catch (error) {
    console.error('加载信件失败:', error)
  }
}

const deleteLetter = (letter: any) => {
  ElMessageBox.confirm(
    '确定要删除这封信件吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const letters = JSON.parse(localStorage.getItem('letters') || '[]')
    const index = letters.findIndex((l: any) => l.id === letter.id)
    if (index !== -1) {
      letters.splice(index, 1)
      localStorage.setItem('letters', JSON.stringify(letters))
      
      // 记录删除活动
      const activities = JSON.parse(localStorage.getItem('activities') || '[]')
      activities.unshift({
        id: Date.now(),
        userId: JSON.parse(localStorage.getItem('user') || '{}').id,
        content: `删除了一封信《${letter.title}》`,
        time: new Date().toISOString(),
        type: 'info'
      })
      localStorage.setItem('activities', JSON.stringify(activities))
      
      loadLetters() // 重新加载信件列表
      ElMessage.success('信件已删除')
    }
  })
}

const readLetter = (letter: any) => {
  currentLetter.value = letter
  showLetterDialog.value = true
  if (!letter.isRead) {
    letter.isRead = true
    // 更新本地存储
    const letters = JSON.parse(localStorage.getItem('letters') || '[]')
    const index = letters.findIndex((l: any) => l.id === letter.id)
    if (index !== -1) {
      letters[index].isRead = true
      localStorage.setItem('letters', JSON.stringify(letters))
    }
  }
}

// 定时检查是否有新信件到达
const checkNewLetters = () => {
  const letters = JSON.parse(localStorage.getItem('letters') || '[]')
  const now = new Date()
  
  letters.forEach((letter: any) => {
    if (letter.status === 'sent' && 
        new Date(letter.receiveTime) <= now && 
        !letter.isRead) {
      ElNotification({
        title: '新信件到达',
        message: `您收到了一封新信件：${letter.title}`,
        type: 'success'
      })
    }
  })
}

onMounted(() => {
  loadLetters()
  // 每分钟检查一次新信件
  setInterval(checkNewLetters, 60000)
})
</script>

<style scoped>
.mailbox-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.mailbox-header {
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

.mailbox-main {
  padding: 20px;
}

.letter-content {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
  min-height: 200px;
  line-height: 1.8;
}

.letter-info {
  margin-top: 20px;
  color: #909399;
  font-size: 14px;
}
</style> 