<template>
  <div class="monitor-dashboard">
    <el-row :gutter="20">
      <!-- 实时监控 -->
      <el-col :span="16">
        <el-card class="monitor-card">
          <template #header>
            <div class="card-header">
              <h3>实时系统监控</h3>
              <el-tag type="success">在线</el-tag>
            </div>
          </template>
          
          <div class="monitor-stats">
            <div class="stat-item">
              <h4>CPU使用率</h4>
              <el-progress 
                type="dashboard" 
                :percentage="systemStats.cpu" 
                :color="getCpuColor"
              />
            </div>
            <div class="stat-item">
              <h4>内存使用率</h4>
              <el-progress 
                type="dashboard" 
                :percentage="systemStats.memory" 
                :color="getMemoryColor"
              />
            </div>
            <div class="stat-item">
              <h4>磁盘使用率</h4>
              <el-progress 
                type="dashboard" 
                :percentage="systemStats.disk" 
                :color="getDiskColor"
              />
            </div>
          </div>

          <div class="monitor-chart">
            <!-- 系统负载图表 -->
          </div>
        </el-card>
      </el-col>

      <!-- 告警信息 -->
      <el-col :span="8">
        <el-card class="alert-card">
          <template #header>
            <div class="card-header">
              <h3>系统告警</h3>
              <el-button type="primary" @click="handleClearAlerts">清除所有</el-button>
            </div>
          </template>

          <el-timeline>
            <el-timeline-item
              v-for="alert in alerts"
              :key="alert.id"
              :type="alert.level"
              :timestamp="alert.time"
            >
              <h4>{{ alert.title }}</h4>
              <p>{{ alert.message }}</p>
              <div class="alert-actions">
                <el-button type="primary" link @click="handleProcessAlert(alert)">
                  处理
                </el-button>
                <el-button type="danger" link @click="handleIgnoreAlert(alert)">
                  忽略
                </el-button>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>

    <!-- 用户行为监控 -->
    <el-card class="behavior-card">
      <template #header>
        <div class="card-header">
          <h3>用户行为监控</h3>
          <div class="header-actions">
            <el-select v-model="monitorFilter" placeholder="监控类型">
              <el-option label="登录行为" value="login" />
              <el-option label="敏感操作" value="sensitive" />
              <el-option label="异常行为" value="abnormal" />
            </el-select>
            <el-button type="warning" @click="handleExportLogs">导出日志</el-button>
          </div>
        </div>
      </template>

      <el-table :data="userBehaviors" style="width: 100%" v-loading="loading">
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="ip" label="IP地址" width="140" />
        <el-table-column prop="action" label="操作" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
              {{ row.status === 'success' ? '正常' : '异常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button 
                type="primary" 
                link
                @click="handleViewDetail(row)"
              >
                详情
              </el-button>
              <el-button 
                type="danger" 
                link
                v-if="row.status === 'abnormal'"
                @click="handleBlock(row)"
              >
                封禁
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 封禁用户对话框 -->
    <el-dialog
      v-model="blockDialogVisible"
      title="封禁用户"
      width="500px"
    >
      <el-form :model="blockForm" label-width="100px">
        <el-form-item label="封禁时长">
          <el-select v-model="blockForm.duration">
            <el-option label="24小时" value="24h" />
            <el-option label="7天" value="7d" />
            <el-option label="30天" value="30d" />
            <el-option label="永久" value="permanent" />
          </el-select>
        </el-form-item>
        <el-form-item label="封禁原因">
          <el-input
            v-model="blockForm.reason"
            type="textarea"
            rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="blockDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmBlock">
            确认封禁
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 系统状态数据
const systemStats = ref({
  cpu: 45,
  memory: 68,
  disk: 72
})

// 告警数据
const alerts = ref([
  {
    id: 1,
    level: 'warning',
    time: '2024-01-20 14:30:00',
    title: '系统负载过高',
    message: 'CPU使用率超过80%'
  },
  // ... 更多告警数据
])

// 用户行为数据
const userBehaviors = ref([
  {
    time: '2024-01-20 14:35:22',
    username: '张三',
    ip: '192.168.1.100',
    action: '尝试访问管理员页面',
    status: 'abnormal'
  },
  // ... 更多行为数据
])

const loading = ref(false)
const monitorFilter = ref('all')
const blockDialogVisible = ref(false)
const blockForm = ref({
  duration: '24h',
  reason: ''
})

// 处理告警
const handleProcessAlert = (alert: any) => {
  ElMessage.success('已处理告警')
}

// 忽略告警
const handleIgnoreAlert = (alert: any) => {
  ElMessage.success('已忽略告警')
}

// 清除所有告警
const handleClearAlerts = () => {
  ElMessageBox.confirm('确定要清除所有告警吗？', '提示', {
    type: 'warning'
  }).then(() => {
    alerts.value = []
    ElMessage.success('已清除所有告警')
  })
}

// 导出日志
const handleExportLogs = () => {
  // TODO: 实现日志导出功能
  ElMessage.success('日志导出成功')
}

// 查看详情
const handleViewDetail = (row: any) => {
  // TODO: 实现查看详情功能
}

// 封禁用户
const handleBlock = (row: any) => {
  blockDialogVisible.value = true
}

// 确认封禁
const confirmBlock = () => {
  // TODO: 实现封禁功能
  ElMessage.success('用户已被封禁')
  blockDialogVisible.value = false
}

// 计算CPU颜色
const getCpuColor = (percentage: number) => {
  if (percentage < 60) return '#67C23A'
  if (percentage < 80) return '#E6A23C'
  return '#F56C6C'
}

// 计算内存颜色
const getMemoryColor = (percentage: number) => {
  if (percentage < 70) return '#67C23A'
  if (percentage < 85) return '#E6A23C'
  return '#F56C6C'
}

// 计算磁盘颜色
const getDiskColor = (percentage: number) => {
  if (percentage < 75) return '#67C23A'
  if (percentage < 90) return '#E6A23C'
  return '#F56C6C'
}
</script>

<style lang="scss" scoped>
.monitor-dashboard {
  .monitor-card {
    .monitor-stats {
      display: flex;
      justify-content: space-around;
      margin-bottom: $spacing-unit * 3;
      
      .stat-item {
        text-align: center;
        
        h4 {
          margin-bottom: $spacing-unit;
          color: $text-color;
        }
      }
    }
    
    .monitor-chart {
      height: 300px;
    }
  }
  
  .alert-card {
    .alert-actions {
      margin-top: $spacing-unit;
    }
  }
  
  .behavior-card {
    margin-top: $spacing-unit * 3;
    
    .header-actions {
      display: flex;
      gap: $spacing-unit * 2;
    }
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h3 {
      margin: 0;
      font-size: 16px;
      color: $text-color;
    }
  }
}
</style> 