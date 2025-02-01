<template>
  <div class="system-monitor">
    <!-- 系统状态卡片 -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="status in systemStatus" :key="status.title">
        <el-card class="status-card" shadow="hover">
          <div class="status-icon" :class="status.status">
            <el-icon><component :is="status.icon" /></el-icon>
          </div>
          <div class="status-content">
            <div class="status-title">{{ status.title }}</div>
            <div class="status-value">{{ status.value }}</div>
            <div class="status-desc">{{ status.description }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 性能监控图表 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3>CPU 使用率</h3>
              <el-tag :type="cpuStatus.type">{{ cpuStatus.text }}</el-tag>
            </div>
          </template>
          <div class="chart-container">
            <div ref="cpuChart" class="chart"></div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3>内存使用率</h3>
              <el-tag :type="memoryStatus.type">{{ memoryStatus.text }}</el-tag>
            </div>
          </template>
          <div class="chart-container">
            <div ref="memoryChart" class="chart"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 系统日志 -->
    <el-card class="log-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h3>系统日志</h3>
          <div class="header-actions">
            <el-select v-model="logLevel" placeholder="日志级别" clearable>
              <el-option label="ERROR" value="error" />
              <el-option label="WARN" value="warn" />
              <el-option label="INFO" value="info" />
              <el-option label="DEBUG" value="debug" />
            </el-select>
            <el-button type="primary" @click="refreshLogs">刷新</el-button>
            <el-button @click="exportLogs">导出日志</el-button>
          </div>
        </div>
      </template>

      <el-table :data="logs" style="width: 100%" v-loading="loading">
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column prop="level" label="级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getLogLevelType(row.level)">{{ row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="module" label="模块" width="150" />
        <el-table-column prop="message" label="内容" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP地址" width="150" />
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Monitor, CPU, Connection, Warning } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const loading = ref(false)
const logLevel = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 系统状态数据
const systemStatus = ref([
  {
    title: '系统状态',
    value: '正常运行',
    description: '运行时间: 15天6小时',
    icon: Monitor,
    status: 'normal'
  },
  {
    title: 'CPU使用率',
    value: '45%',
    description: '8核心 16线程',
    icon: CPU,
    status: 'warning'
  },
  {
    title: '内存使用',
    value: '6.2GB/16GB',
    description: '使用率: 38.75%',
    icon: Connection,
    status: 'normal'
  },
  {
    title: '异常告警',
    value: '2条未处理',
    description: '最后更新: 10分钟前',
    icon: Warning,
    status: 'error'
  }
])

// CPU状态
const cpuStatus = ref({
  type: 'warning',
  text: '负载较高'
})

// 内存状态
const memoryStatus = ref({
  type: 'success',
  text: '运行正常'
})

// 日志数据
const logs = ref([
  {
    time: '2024-03-01 12:00:00',
    level: 'ERROR',
    module: '用户认证',
    message: '登录失败: 密码错误次数过多',
    ip: '192.168.1.100'
  }
  // ... 更多日志数据
])

// 初始化图表
let cpuChart: echarts.ECharts | null = null
let memoryChart: echarts.ECharts | null = null

onMounted(() => {
  initCharts()
  startMonitoring()
})

onUnmounted(() => {
  stopMonitoring()
})

const initCharts = () => {
  // CPU使用率图表
  cpuChart = echarts.init(document.querySelector('.chart') as HTMLElement)
  cpuChart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: Array.from({ length: 20 }, (_, i) => i)
    },
    yAxis: {
      type: 'value',
      max: 100,
      min: 0
    },
    series: [{
      data: Array.from({ length: 20 }, () => Math.floor(Math.random() * 60 + 20)),
      type: 'line',
      smooth: true,
      areaStyle: {}
    }]
  })

  // 内存使用率图表
  memoryChart = echarts.init(document.querySelectorAll('.chart')[1] as HTMLElement)
  memoryChart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: Array.from({ length: 20 }, (_, i) => i)
    },
    yAxis: {
      type: 'value',
      max: 100,
      min: 0
    },
    series: [{
      data: Array.from({ length: 20 }, () => Math.floor(Math.random() * 40 + 30)),
      type: 'line',
      smooth: true,
      areaStyle: {}
    }]
  })
}

let monitoringInterval: number | null = null

const startMonitoring = () => {
  monitoringInterval = window.setInterval(() => {
    updateCharts()
  }, 3000)
}

const stopMonitoring = () => {
  if (monitoringInterval) {
    clearInterval(monitoringInterval)
  }
}

const updateCharts = () => {
  // 更新CPU图表数据
  const cpuData = cpuChart?.getOption().series[0].data as number[]
  cpuData.shift()
  cpuData.push(Math.floor(Math.random() * 60 + 20))
  cpuChart?.setOption({
    series: [{
      data: cpuData
    }]
  })

  // 更新内存图表数据
  const memoryData = memoryChart?.getOption().series[0].data as number[]
  memoryData.shift()
  memoryData.push(Math.floor(Math.random() * 40 + 30))
  memoryChart?.setOption({
    series: [{
      data: memoryData
    }]
  })
}

const getLogLevelType = (level: string) => {
  const types: Record<string, string> = {
    ERROR: 'danger',
    WARN: 'warning',
    INFO: 'info',
    DEBUG: 'success'
  }
  return types[level] || 'info'
}

const refreshLogs = () => {
  // TODO: 实现日志刷新功能
}

const exportLogs = () => {
  // TODO: 实现日志导出功能
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  // TODO: 重新加载数据
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // TODO: 重新加载数据
}
</script>

<style lang="scss" scoped>
.system-monitor {
  .status-card {
    margin-bottom: $spacing-unit * 2;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: none;
    
    .status-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: $spacing-unit;
      
      &.normal {
        background: #67C23A;
      }
      
      &.warning {
        background: #E6A23C;
      }
      
      &.error {
        background: #F56C6C;
      }
      
      .el-icon {
        font-size: 24px;
        color: white;
      }
    }
    
    .status-content {
      .status-title {
        font-size: 14px;
        color: #666;
      }
      
      .status-value {
        font-size: 24px;
        font-weight: bold;
        color: $text-color;
        margin: $spacing-unit 0;
      }
      
      .status-desc {
        font-size: 12px;
        color: #999;
      }
    }
  }
  
  .chart-row {
    margin: $spacing-unit * 2 0;
  }
  
  .chart-card {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: none;
    
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
    
    .chart-container {
      height: 300px;
    }
  }
  
  .log-card {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: none;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h3 {
        margin: 0;
        font-size: 16px;
        color: $text-color;
      }
      
      .header-actions {
        display: flex;
        gap: $spacing-unit;
      }
    }
    
    .pagination {
      margin-top: $spacing-unit * 2;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style> 