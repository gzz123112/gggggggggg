<template>
  <div class="user-behavior">
    <el-card class="filter-card">
      <div class="filter-header">
        <h3>用户行为分析</h3>
        <div class="filter-actions">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :shortcuts="dateShortcuts"
          />
          <el-select v-model="behaviorType" placeholder="行为类型" clearable>
            <el-option label="登录" value="login" />
            <el-option label="写信" value="write" />
            <el-option label="修改资料" value="profile" />
            <el-option label="敏感操作" value="sensitive" />
          </el-select>
          <el-select v-model="riskLevel" placeholder="风险等级" clearable>
            <el-option label="低风险" value="low" />
            <el-option label="中风险" value="medium" />
            <el-option label="高风险" value="high" />
          </el-select>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </div>
      </div>
    </el-card>

    <!-- 行为统计 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6" v-for="stat in behaviorStats" :key="stat.title">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-title">{{ stat.title }}</div>
            <div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
              {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%
              较上周
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 行为列表 -->
    <el-card class="behavior-list">
      <template #header>
        <div class="list-header">
          <h3>行为记录</h3>
          <div class="header-actions">
            <el-button type="warning" @click="handleExport">导出记录</el-button>
          </div>
        </div>
      </template>

      <el-table :data="behaviors" style="width: 100%" v-loading="loading">
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column label="用户" width="200">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :src="row.avatar" :size="32" />
              <div class="user-details">
                <div class="username">{{ row.username }}</div>
                <div class="ip">{{ row.ip }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="行为类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getBehaviorTagType(row.type)">
              {{ getBehaviorText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="action" label="具体操作" />
        <el-table-column prop="risk" label="风险等级" width="100">
          <template #default="{ row }">
            <el-tag :type="getRiskTagType(row.risk)">
              {{ getRiskText(row.risk) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button 
                type="primary" 
                link
                @click="handleDetail(row)"
              >
                详情
              </el-button>
              <el-button 
                type="warning" 
                link
                @click="handleWarn(row)"
              >
                警告
              </el-button>
              <el-button 
                type="danger" 
                link
                @click="handleBlock(row)"
              >
                封禁
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="行为详情"
      width="600px"
    >
      <div v-if="selectedBehavior" class="behavior-detail">
        <div class="detail-item">
          <label>用户：</label>
          <span>{{ selectedBehavior.username }}</span>
        </div>
        <div class="detail-item">
          <label>IP地址：</label>
          <span>{{ selectedBehavior.ip }}</span>
        </div>
        <div class="detail-item">
          <label>设备信息：</label>
          <span>{{ selectedBehavior.device }}</span>
        </div>
        <div class="detail-item">
          <label>操作时间：</label>
          <span>{{ selectedBehavior.time }}</span>
        </div>
        <div class="detail-item">
          <label>行为类型：</label>
          <span>{{ getBehaviorText(selectedBehavior.type) }}</span>
        </div>
        <div class="detail-item">
          <label>具体操作：</label>
          <span>{{ selectedBehavior.action }}</span>
        </div>
        <div class="detail-item">
          <label>风险等级：</label>
          <span>{{ getRiskText(selectedBehavior.risk) }}</span>
        </div>
        <div class="detail-item">
          <label>操作结果：</label>
          <span>{{ selectedBehavior.result }}</span>
        </div>
      </div>
    </el-dialog>

    <!-- 警告对话框 -->
    <el-dialog
      v-model="warnVisible"
      title="发送警告"
      width="500px"
    >
      <el-form :model="warnForm" label-width="100px">
        <el-form-item label="警告类型">
          <el-select v-model="warnForm.type">
            <el-option label="行为异常" value="abnormal" />
            <el-option label="违规操作" value="violation" />
            <el-option label="安全风险" value="security" />
          </el-select>
        </el-form-item>
        <el-form-item label="警告内容">
          <el-input
            v-model="warnForm.content"
            type="textarea"
            rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="warnVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmWarn">
            发送警告
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  }
]

// 统计数据
const behaviorStats = [
  {
    title: '今日行为数',
    value: '1,234',
    trend: 12.5
  },
  {
    title: '异常行为',
    value: '45',
    trend: -5.2
  },
  {
    title: '高风险操作',
    value: '13',
    trend: 8.7
  },
  {
    title: '警告次数',
    value: '24',
    trend: 15.3
  }
]

// 表格数据
const behaviors = ref([
  {
    time: '2024-01-20 15:30:22',
    username: '张三',
    avatar: 'https://example.com/avatar1.jpg',
    ip: '192.168.1.100',
    type: 'login',
    action: '尝试多次登录失败',
    risk: 'high',
    device: 'Chrome 120.0.0 / Windows 10',
    result: '登录失败，IP已被临时封禁'
  },
  // ... 更多数据
])

// 状态变量
const loading = ref(false)
const dateRange = ref([])
const behaviorType = ref('')
const riskLevel = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(100)
const detailVisible = ref(false)
const warnVisible = ref(false)
const selectedBehavior = ref(null)
const warnForm = ref({
  type: 'abnormal',
  content: ''
})

// 处理函数
const handleSearch = () => {
  loading.value = true
  // TODO: 实现搜索功能
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

const handleExport = () => {
  ElMessage.success('导出成功')
}

const handleDetail = (row: any) => {
  selectedBehavior.value = row
  detailVisible.value = true
}

const handleWarn = (row: any) => {
  warnVisible.value = true
}

const handleBlock = (row: any) => {
  ElMessage.success('用户已被封禁')
}

const confirmWarn = () => {
  ElMessage.success('警告已发送')
  warnVisible.value = false
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  handleSearch()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  handleSearch()
}

// 辅助函数
const getBehaviorTagType = (type: string) => {
  const types: Record<string, string> = {
    login: 'info',
    write: 'success',
    profile: 'warning',
    sensitive: 'danger'
  }
  return types[type] || 'info'
}

const getBehaviorText = (type: string) => {
  const texts: Record<string, string> = {
    login: '登录',
    write: '写信',
    profile: '修改资料',
    sensitive: '敏感操作'
  }
  return texts[type] || type
}

const getRiskTagType = (risk: string) => {
  const types: Record<string, string> = {
    low: 'info',
    medium: 'warning',
    high: 'danger'
  }
  return types[risk] || 'info'
}

const getRiskText = (risk: string) => {
  const texts: Record<string, string> = {
    low: '低风险',
    medium: '中风险',
    high: '高风险'
  }
  return texts[risk] || risk
}
</script>

<style lang="scss" scoped>
.user-behavior {
  .filter-card {
    margin-bottom: $spacing-unit * 3;
    
    .filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h3 {
        margin: 0;
        font-size: 1.2rem;
        color: $text-color;
      }
      
      .filter-actions {
        display: flex;
        gap: $spacing-unit * 2;
      }
    }
  }
  
  .stat-row {
    margin-bottom: $spacing-unit * 3;
    
    .stat-card {
      .stat-content {
        text-align: center;
        
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: $text-color;
          margin-bottom: 4px;
        }
        
        .stat-title {
          color: #666;
          margin-bottom: 8px;
        }
        
        .stat-trend {
          font-size: 14px;
          
          &.up {
            color: #67C23A;
          }
          
          &.down {
            color: #F56C6C;
          }
        }
      }
    }
  }
  
  .behavior-list {
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h3 {
        margin: 0;
        font-size: 1.2rem;
        color: $text-color;
      }
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: $spacing-unit;
      
      .user-details {
        .username {
          font-weight: bold;
        }
        
        .ip {
          font-size: 0.9rem;
          color: #666;
        }
      }
    }
  }
  
  .pagination-container {
    margin-top: $spacing-unit * 2;
    display: flex;
    justify-content: flex-end;
  }
  
  .behavior-detail {
    .detail-item {
      margin-bottom: $spacing-unit * 2;
      
      label {
        font-weight: bold;
        margin-right: $spacing-unit;
        color: #666;
      }
    }
  }
}
</style> 