<template>
  <div class="statistics">
    <!-- 数据概览卡片 -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="stat in statistics" :key="stat.title">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" :style="{ background: stat.color }">
            <el-icon><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-title">{{ stat.title }}</div>
            <div class="stat-trend" :class="stat.trend">
              {{ stat.trend === 'up' ? '+' : '-' }}{{ stat.change }}%
              较上周
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 趋势图表 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3>用户增长趋势</h3>
              <el-radio-group v-model="timeRange" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="year">全年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container">
            <!-- 用户增长折线图 -->
            <el-empty v-if="loading" description="加载中..." />
            <div v-else ref="userGrowthChart" class="chart"></div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3>用户分布</h3>
            </div>
          </template>
          <div class="chart-container">
            <!-- 用户分布饼图 -->
            <el-empty v-if="loading" description="加载中..." />
            <div v-else ref="userDistributionChart" class="chart"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细数据表格 -->
    <el-card class="data-table" shadow="hover">
      <template #header>
        <div class="card-header">
          <h3>数据明细</h3>
          <div class="header-actions">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :shortcuts="dateShortcuts"
            />
            <el-button type="primary" @click="exportData">
              导出数据
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="date" label="日期" width="180" />
        <el-table-column prop="newUsers" label="新增用户" />
        <el-table-column prop="activeUsers" label="活跃用户" />
        <el-table-column prop="letters" label="信件数量" />
        <el-table-column prop="retention" label="留存率">
          <template #default="{ row }">
            {{ row.retention }}%
          </template>
        </el-table-column>
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
import { ref, onMounted } from 'vue'
import { User, Timer, Message, Star } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const loading = ref(false)
const timeRange = ref('week')
const dateRange = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 统计卡片数据
const statistics = ref([
  {
    title: '总用户数',
    value: '1,234',
    icon: User,
    color: '#409EFF',
    trend: 'up',
    change: '12.5'
  },
  {
    title: '活跃用户',
    value: '856',
    icon: Star,
    color: '#67C23A',
    trend: 'up',
    change: '8.3'
  },
  {
    title: '信件总数',
    value: '3,567',
    icon: Message,
    color: '#E6A23C',
    trend: 'up',
    change: '15.2'
  },
  {
    title: '平均停留时长',
    value: '12:30',
    icon: Timer,
    color: '#F56C6C',
    trend: 'down',
    change: '5.1'
  }
])

// 表格数据
const tableData = ref([
  {
    date: '2024-03-01',
    newUsers: 120,
    activeUsers: 856,
    letters: 234,
    retention: 85.6
  },
  // ... 更多数据
])

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

// 初始化图表
let userGrowthChart: echarts.ECharts | null = null
let userDistributionChart: echarts.ECharts | null = null

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

const initCharts = () => {
  // 用户增长趋势图
  const growthChart = echarts.init(document.querySelector('.chart') as HTMLElement)
  growthChart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: [150, 230, 224, 218, 135, 147, 260],
      type: 'line',
      smooth: true
    }]
  })

  // 用户分布饼图
  const distributionChart = echarts.init(document.querySelectorAll('.chart')[1] as HTMLElement)
  distributionChart.setOption({
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: [
          { value: 1048, name: '活跃用户' },
          { value: 735, name: '一般用户' },
          { value: 580, name: '沉睡用户' },
          { value: 484, name: '新用户' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  })

  userGrowthChart = growthChart
  userDistributionChart = distributionChart
}

const handleResize = () => {
  userGrowthChart?.resize()
  userDistributionChart?.resize()
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  // TODO: 重新加载数据
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // TODO: 重新加载数据
}

const exportData = () => {
  // TODO: 实现数据导出功能
}
</script>

<style lang="scss" scoped>
.statistics {
  .stat-card {
    margin-bottom: $spacing-unit * 2;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: none;
    
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: $spacing-unit;
      
      .el-icon {
        font-size: 24px;
        color: white;
      }
    }
    
    .stat-content {
      .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: $text-color;
      }
      
      .stat-title {
        font-size: 14px;
        color: #666;
        margin: $spacing-unit 0;
      }
      
      .stat-trend {
        font-size: 12px;
        
        &.up {
          color: #67C23A;
        }
        
        &.down {
          color: #F56C6C;
        }
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
  
  .data-table {
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