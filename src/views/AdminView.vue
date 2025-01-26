<template>
  <div class="admin-container">
    <el-container>
      <el-aside width="200px">
        <el-menu
          :default-active="activeMenu"
          class="admin-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="dashboard">
            <el-icon><DataLine /></el-icon>
            <span>数据概览</span>
          </el-menu-item>
          <el-menu-item index="users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="appeals">
            <el-icon><Warning /></el-icon>
            <span>申诉处理</span>
            <el-badge v-if="appealCount > 0" :value="appealCount" class="appeal-badge" />
          </el-menu-item>
          <el-menu-item index="backup">
            <el-icon><Files /></el-icon>
            <span>草稿备份</span>
          </el-menu-item>
          <el-menu-item index="settings">
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </el-menu-item>
          <el-menu-item index="letters">
            <el-icon><Document /></el-icon>
            <span>信件审核</span>
            <el-badge v-if="pendingLetterCount > 0" :value="pendingLetterCount" class="letter-badge" />
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header class="admin-header">
          <div class="header-left">
            <h2>管理员控制台</h2>
          </div>
          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <span class="admin-info">
                <div class="admin-avatar">
                  {{ JSON.parse(localStorage.getItem('admin') || '{}').avatar || '👨‍💼' }}
                </div>
                <span>{{ JSON.parse(localStorage.getItem('admin') || '{}').username || '管理员' }}</span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <el-main class="admin-main">
          <!-- 数据概览面板 -->
          <template v-if="activeMenu === 'dashboard'">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-card class="data-card">
                  <template #header>总用户数</template>
                  <div class="data-value">{{ statistics.userCount }}</div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card class="data-card">
                  <template #header>今日新增用户</template>
                  <div class="data-value">{{ statistics.newUsers }}</div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card class="data-card">
                  <template #header>待处理申诉</template>
                  <div class="data-value">{{ statistics.pendingAppeals }}</div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card class="data-card">
                  <template #header>系统存储使用</template>
                  <div class="data-value">{{ statistics.storageUsage }}</div>
                </el-card>
              </el-col>
            </el-row>
          </template>

          <!-- 用户管理面板 -->
          <template v-if="activeMenu === 'users'">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>用户列表</span>
                  <el-input
                    v-model="searchQuery"
                    placeholder="搜索用户..."
                    style="width: 200px"
                  />
                </div>
              </template>
              <el-table :data="filteredUserList" style="width: 100%">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="username" label="用户名" />
                <el-table-column prop="registerTime" label="注册时间" />
                <el-table-column prop="status" label="状态">
                  <template #default="{ row }">
                    <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
                      {{ row.status === 'active' ? '正常' : '禁用' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                  <template #default="{ row }">
                    <el-button-group>
                      <el-button size="small" @click="editUser(row)">编辑</el-button>
                      <el-button 
                        size="small" 
                        :type="row.status === 'active' ? 'danger' : 'success'"
                        @click="toggleUserStatus(row)"
                      >
                        {{ row.status === 'active' ? '禁用' : '启用' }}
                      </el-button>
                    </el-button-group>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </template>

          <!-- 申诉处理面板 -->
          <template v-if="activeMenu === 'appeals'">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>申诉列表</span>
                  <el-radio-group v-model="appealFilter" size="small">
                    <el-radio-button label="all">全部</el-radio-button>
                    <el-radio-button label="pending">待处理</el-radio-button>
                    <el-radio-button label="processed">已处理</el-radio-button>
                  </el-radio-group>
                </div>
              </template>
              <el-table :data="appealList" style="width: 100%">
                <el-table-column prop="id" label="申诉ID" width="80" />
                <el-table-column prop="userId" label="用户ID" width="80" />
                <el-table-column prop="type" label="类型" width="100">
                  <template #default="{ row }">
                    <el-tag>{{ row.type }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="content" label="申诉内容" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.status === 'pending' ? 'warning' : 'success'">
                      {{ row.status === 'pending' ? '待处理' : '已处理' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="150">
                  <template #default="{ row }">
                    <el-button 
                      v-if="row.status === 'pending'"
                      type="primary" 
                      size="small"
                      @click="handleAppeal(row)"
                    >
                      处理
                    </el-button>
                    <el-button 
                      v-else
                      type="info" 
                      size="small"
                      @click="viewAppealDetail(row)"
                    >
                      查看
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </template>

          <!-- 添加草稿备份和系统设置面板 -->
          <template v-if="activeMenu === 'backup'">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>草稿备份</span>
                  <el-button type="primary" @click="backupDrafts">
                    立即备份
                  </el-button>
                </div>
              </template>
              <el-table :data="backupHistory" style="width: 100%">
                <el-table-column prop="time" label="备份时间" />
                <el-table-column prop="count" label="草稿数量" />
                <el-table-column prop="size" label="备份大小" />
                <el-table-column label="操作">
                  <template #default="{ row }">
                    <el-button type="primary" size="small" @click="downloadBackup(row)">
                      下载
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </template>

          <template v-if="activeMenu === 'settings'">
            <el-card>
              <template #header>系统设置</template>
              <el-form label-width="120px">
                <el-form-item label="系统名称">
                  <el-input v-model="settings.systemName" />
                </el-form-item>
                <el-form-item label="备份周期">
                  <el-select v-model="settings.backupInterval">
                    <el-option label="每天" value="daily" />
                    <el-option label="每周" value="weekly" />
                    <el-option label="每月" value="monthly" />
                  </el-select>
                </el-form-item>
                <el-form-item label="存储限制">
                  <el-input-number v-model="settings.storageLimit" :min="1" :max="100" />
                  <span class="unit">GB</span>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="saveSettings">
                    保存设置
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </template>

          <!-- 信件审核面板 -->
          <template v-if="activeMenu === 'letters'">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>待审核信件</span>
                </div>
              </template>
              <el-table :data="pendingLetters" style="width: 100%">
                <el-table-column prop="title" label="信件标题" />
                <el-table-column prop="sendTime" label="发送时间" />
                <el-table-column prop="content" label="内容预览">
                  <template #default="{ row }">
                    {{ row.content.substring(0, 50) }}...
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                  <template #default="{ row }">
                    <el-button-group>
                      <el-button type="success" size="small" @click="approveLetter(row)">
                        通过
                      </el-button>
                      <el-button type="danger" size="small" @click="rejectLetter(row)">
                        拒绝
                      </el-button>
                    </el-button-group>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </template>
        </el-main>
      </el-container>
    </el-container>

    <!-- 添加个人信息对话框 -->
    <el-dialog
      v-model="showProfileDialog"
      title="管理员信息"
      width="400px"
    >
      <div class="profile-info">
        <p><strong>管理员账号：</strong>{{ adminInfo.username }}</p>
        <p><strong>上次登录：</strong>{{ adminInfo.lastLoginTime }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  DataLine,
  User,
  Warning,
  Files,
  Setting,
  UserFilled,
  Document
} from '@element-plus/icons-vue'
import request, { createWebSocket } from '@/utils/request'

const router = useRouter()
const activeMenu = ref('dashboard')
const appealCount = ref(0)
const searchQuery = ref('')
const appealFilter = ref('all')

// 实时统计数据
const statistics = ref({
  userCount: 0,
  newUsers: 0,
  pendingAppeals: 0,
  storageUsage: '0MB'
})

// 用户列表
const userList = ref([])

// 申诉列表
const appealList = ref([])

// 系统设置
const settings = ref({
  systemName: '时光邮递管理系统',
  backupInterval: 'daily',
  storageLimit: 10
})

const backupHistory = ref([])

// 在 script setup 中添加
const adminInfo = ref(JSON.parse(localStorage.getItem('admin') || '{}'))

// 添加个人信息对话框
const showProfileDialog = ref(false)

// 添加信件审核相关功能
const pendingLetters = ref([])
const pendingLetterCount = ref(0)

// 加载实时统计数据
const loadStatistics = () => {
  // 获取所有用户
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  // 获取所有信件
  const letters = JSON.parse(localStorage.getItem('letters') || '[]')
  // 获取所有申诉
  const appeals = JSON.parse(localStorage.getItem('appeals') || '[]')
  
  // 计算存储使用量
  const storageSize = new Blob([
    JSON.stringify(users),
    JSON.stringify(letters),
    JSON.stringify(appeals)
  ]).size

  statistics.value = {
    userCount: users.length,
    newUsers: users.filter((u: any) => {
      const registerDate = new Date(u.registerTime)
      const today = new Date()
      return registerDate.toDateString() === today.toDateString()
    }).length,
    pendingAppeals: appeals.filter((a: any) => a.status === 'pending').length,
    storageUsage: `${(storageSize / 1024 / 1024).toFixed(2)}MB`
  }
}

// 加载用户列表
const loadUsers = () => {
  const users = [
    {
      id: 1,
      username: 'GYX123',
      registerTime: '2024-03-15',
      status: 'active',
      email: 'test123@example.com',
      phone: '15816734077'
    },
    {
      id: 2,
      username: 'CJH321',
      registerTime: '2024-03-15',
      status: 'active',
      email: 'demo@example.com',
      phone: '15119983200'
    }
  ]
  userList.value = users
}

// 编辑用户
const editUser = (user: any) => {
  ElMessageBox.prompt('请输入新的用户名', '编辑用户', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: user.username
  }).then(({ value }) => {
    user.username = value
    ElMessage.success('用户信息已更新')
  })
}

// 切换用户状态
const toggleUserStatus = (user: any) => {
  const action = user.status === 'active' ? '禁用' : '启用'
  ElMessageBox.confirm(
    `确定要${action}该用户吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    user.status = user.status === 'active' ? 'disabled' : 'active'
    // 更新本地存储
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const index = users.findIndex((u: any) => u.id === user.id)
    if (index !== -1) {
      users[index].status = user.status
      localStorage.setItem('users', JSON.stringify(users))
    }
    ElMessage.success(`用户已${action}`)
  })
}

// 处理申诉
const handleAppeal = (appeal: any) => {
  ElMessageBox.prompt('请输入处理结果', '处理申诉', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputType: 'textarea'
  }).then(({ value }) => {
    appeal.status = 'processed'
    appeal.result = value
    appeal.processTime = new Date().toISOString()
    
    // 更新本地存储
    const appeals = JSON.parse(localStorage.getItem('appeals') || '[]')
    const index = appeals.findIndex((a: any) => a.id === appeal.id)
    if (index !== -1) {
      appeals[index] = appeal
      localStorage.setItem('appeals', JSON.stringify(appeals))
    }
    
    ElMessage.success('申诉已处理')
    loadAppeals() // 重新加载申诉列表
  })
}

// 查看申诉详情
const viewAppealDetail = (appeal: any) => {
  ElMessageBox.alert(
    `申诉内容：${appeal.content}\n申诉时间：${appeal.time}\n处理结果：${appeal.result || '未处理'}\n处理时间：${appeal.processTime || '未处理'}`,
    '申诉详情',
    {
      confirmButtonText: '确定',
      customClass: 'appeal-detail-box'
    }
  )
}

// 显示个人信息
const showProfile = () => {
  showProfileDialog.value = true
}

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  if (command === 'profile') {
    showProfile()
  } else if (command === 'logout') {
    ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      localStorage.removeItem('admin')
      router.push('/')
    })
  }
}

// 加载申诉列表
const loadAppeals = () => {
  const appeals = JSON.parse(localStorage.getItem('appeals') || '[]')
  if (appealFilter.value === 'pending') {
    appealList.value = appeals.filter((a: any) => a.status === 'pending')
  } else if (appealFilter.value === 'processed') {
    appealList.value = appeals.filter((a: any) => a.status === 'processed')
  } else {
    appealList.value = appeals
  }
  appealCount.value = appeals.filter((a: any) => a.status === 'pending').length
}

// 监听申诉过滤器变化
watch(appealFilter, () => {
  loadAppeals()
})

// 备份草稿
const backupDrafts = () => {
  const drafts = JSON.parse(localStorage.getItem('letterDrafts') || '[]')
  const backup = {
    id: Date.now(),
    time: new Date().toLocaleString(),
    count: drafts.length,
    size: `${(JSON.stringify(drafts).length / 1024).toFixed(2)}KB`
  }
  backupHistory.value.push(backup)
  ElMessage.success('备份成功')
}

// 下载备份
const downloadBackup = (backup: any) => {
  const drafts = JSON.parse(localStorage.getItem('letterDrafts') || '[]')
  const blob = new Blob([JSON.stringify(drafts, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `drafts-backup-${backup.time}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 保存设置
const saveSettings = () => {
  localStorage.setItem('adminSettings', JSON.stringify(settings.value))
  ElMessage.success('设置已保存')
}

// 修改 handleMenuSelect 函数
const handleMenuSelect = (index: string) => {
  activeMenu.value = index
}

// 修改登录时保存管理员信息
const saveAdminInfo = () => {
  const adminInfo = {
    username: 'admin',
    lastLoginTime: new Date().toLocaleString(),
    avatar: '👨‍💼' // 使用 emoji 作为默认头像
  }
  localStorage.setItem('admin', JSON.stringify(adminInfo))
}

// 修改用户搜索功能
const filteredUserList = computed(() => {
  if (!searchQuery.value) return userList.value
  return userList.value.filter((user: any) => 
    user.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 加载待审核信件
const loadPendingLetters = () => {
  const letters = JSON.parse(localStorage.getItem('pendingLetters') || '[]')
  pendingLetters.value = letters
  pendingLetterCount.value = letters.length
}

// 审核通过
const approveLetter = (letter: any) => {
  ElMessageBox.confirm(
    '确定通过这封信件吗？',
    '审核确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    }
  ).then(() => {
    // 移动到正式信件列表
    const letters = JSON.parse(localStorage.getItem('letters') || '[]')
    letter.status = 'sent'
    letters.push(letter)
    localStorage.setItem('letters', JSON.stringify(letters))

    // 从待审核列表移除
    const pendingLetters = JSON.parse(localStorage.getItem('pendingLetters') || '[]')
    const updatedPending = pendingLetters.filter((l: any) => l.id !== letter.id)
    localStorage.setItem('pendingLetters', JSON.stringify(updatedPending))

    loadPendingLetters()
    ElMessage.success('信件已通过审核')
  })
}

// 审核拒绝
const rejectLetter = (letter: any) => {
  ElMessageBox.prompt('请输入拒绝原因', '审核拒绝', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputType: 'textarea',
    inputPlaceholder: '请输入拒绝原因...'
  }).then(({ value }) => {
    // 记录拒绝原因
    const activities = JSON.parse(localStorage.getItem('activities') || '[]')
    activities.unshift({
      id: Date.now(),
      userId: letter.userId,
      content: `您的信件《${letter.title}》未通过审核，原因：${value}`,
      time: new Date().toISOString(),
      type: 'danger'
    })
    localStorage.setItem('activities', JSON.stringify(activities))

    // 从待审核列表移除
    const pendingLetters = JSON.parse(localStorage.getItem('pendingLetters') || '[]')
    const updatedPending = pendingLetters.filter((l: any) => l.id !== letter.id)
    localStorage.setItem('pendingLetters', JSON.stringify(updatedPending))

    loadPendingLetters()
    ElMessage.success('已拒绝该信件')
  })
}

let socket = null

onMounted(() => {
  loadStatistics()
  loadUsers()
  loadAppeals()
  // 如果没有管理员信息，初始化它
  if (!localStorage.getItem('admin')) {
    saveAdminInfo()
  }
  // 加载设置
  const savedSettings = localStorage.getItem('adminSettings')
  if (savedSettings) {
    settings.value = JSON.parse(savedSettings)
  }
  // 定时刷新数据
  setInterval(loadStatistics, 60000)
  loadPendingLetters()

  // 初始化WebSocket连接
  socket = createWebSocket('ws://your-backend-url/ws/admin')

  // 监听新信件
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data)
    if (message.type === 'NEW_LETTER') {
      pendingLetters.value.unshift(message.data)
      ElMessage.success('收到新信件提醒')
    }
  }
})

onUnmounted(() => {
  // 组件卸载时关闭WebSocket连接
  if (socket) {
    socket.close()
  }
})
</script>

<style scoped>
.admin-container {
  min-height: 100vh;
}

.admin-menu {
  height: 100vh;
  border-right: solid 1px #e6e6e6;
}

.admin-header {
  background-color: white;
  border-bottom: solid 1px #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.admin-main {
  background-color: #f5f7fa;
  padding: 20px;
}

.data-card {
  text-align: center;
}

.data-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.appeal-badge {
  margin-top: -10px;
}

/* 自定义滚动条 */
.admin-menu::-webkit-scrollbar {
  width: 6px;
}

.admin-menu::-webkit-scrollbar-thumb {
  background-color: rgba(144, 147, 153, 0.3);
  border-radius: 3px;
}

.admin-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.unit {
  margin-left: 10px;
  color: #909399;
}

.letter-badge {
  margin-top: -10px;
}
</style> 