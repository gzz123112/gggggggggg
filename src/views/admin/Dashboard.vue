<template>
  <div class="admin-dashboard">
    <!-- 数据概览卡片 -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="card in dashboardCards" :key="card.title">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" :style="{ background: card.color }">
            <el-icon><component :is="card.icon" /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ card.value }}</div>
            <div class="stat-title">{{ card.title }}</div>
            <div class="stat-trend" :class="card.trend">
              {{ card.trend === 'up' ? '+' : '-' }}{{ card.change }}%
              较上周
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 实时监控 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3>用户活跃度</h3>
              <el-radio-group v-model="timeRange" size="small">
                <el-radio-button label="today">今日</el-radio-button>
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="userActivityChart" class="chart"></div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3>信件类型分布</h3>
            </div>
          </template>
          <div ref="letterTypeChart" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最新动态 -->
    <el-card class="activity-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h3>系统动态</h3>
          <el-button text>查看全部</el-button>
        </div>
      </template>

      <el-timeline>
        <el-timeline-item
          v-for="activity in activities"
          :key="activity.id"
          :timestamp="activity.time"
          :type="activity.type"
        >
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { User, Message, Warning, Star } from '@element-plus/icons-vue'
import * as echarts from 'echarts/core'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import { LineChart, PieChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { ElMessage } from 'element-plus'

// 注册必需的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  LineChart,
  PieChart,
  CanvasRenderer,
  UniversalTransition
])

const timeRange = ref('today')
const userActivityChart = ref<HTMLElement | null>(null)
const letterTypeChart = ref<HTMLElement | null>(null)
let activityChartInstance: echarts.ECharts | null = null
let typeChartInstance: echarts.ECharts | null = null
const loading = ref(false)

// 仪表盘卡片数据
const dashboardCards = ref([
  {
    title: '总用户数',
    value: '1,234',
    change: '15',
    trend: 'up',
    icon: User,
    color: '#409EFF'
  },
  {
    title: '今日信件',
    value: '89',
    change: '12',
    trend: 'up',
    icon: Message,
    color: '#67C23A'
  },
  {
    title: '待处理举报',
    value: '5',
    change: '50',
    trend: 'down',
    icon: Warning,
    color: '#E6A23C'
  },
  {
    title: '系统评分',
    value: '4.9',
    change: '5',
    trend: 'up',
    icon: Star,
    color: '#F56C6C'
  }
])

// 系统动态数据
const activities = ref([
  {
    id: 1,
    content: '新用户注册: 张三',
    time: '10分钟前',
    type: 'success'
  },
  {
    id: 2,
    content: '系统更新完成',
    time: '30分钟前',
    type: 'info'
  },
  {
    id: 3,
    content: '检测到异常登录',
    time: '1小时前',
    type: 'warning'
  }
])

// 在 script setup 中添加数据获取逻辑
const fetchDashboardData = async () => {
  loading.value = true
  try {
    // 这里应该调用后端 API，现在先用模拟数据
    dashboardCards.value = [
      {
        title: '总用户数',
        value: '1,234',
        change: '15',
        trend: 'up',
        icon: User,
        color: '#409EFF'
      },
      {
        title: '今日信件',
        value: '89',
        change: '12',
        trend: 'up',
        icon: Message,
        color: '#67C23A'
      },
      {
        title: '待处理举报',
        value: '5',
        change: '50',
        trend: 'down',
        icon: Warning,
        color: '#E6A23C'
      },
      {
        title: '系统评分',
        value: '4.9',
        change: '5',
        trend: 'up',
        icon: Star,
        color: '#F56C6C'
      }
    ]

    // 更新活动列表
    activities.value = [
      {
        id: 1,
        content: '新用户注册: 张三',
        time: '10分钟前',
        type: 'success'
      },
      {
        id: 2,
        content: '系统更新完成',
        time: '30分钟前',
        type: 'info'
      },
      {
        id: 3,
        content: '检测到异常登录',
        time: '1小时前',
        type: 'warning'
      }
    ]

    // 更新图表数据
    updateCharts()
  } catch (error) {
    console.error('获取仪表盘数据失败:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 初始化图表
const initCharts = () => {
  if (userActivityChart.value && letterTypeChart.value) {
    activityChartInstance = echarts.init(userActivityChart.value)
    typeChartInstance = echarts.init(letterTypeChart.value)
    
    // 用户活跃度图表配置
    activityChartInstance.setOption({
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00']
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        data: [30, 25, 40, 85, 70, 90, 45],
        type: 'line',
        smooth: true,
        areaStyle: {}
      }]
    })

    // 信件类型分布图表配置
    typeChartInstance.setOption({
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [{
        type: 'pie',
        radius: '50%',
        data: [
          { value: 235, name: '时光信件' },
          { value: 274, name: '回忆信件' },
          { value: 310, name: '祝福信件' },
          { value: 335, name: '纪念信件' },
          { value: 400, name: '其他' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    })
  }
}

// 监听窗口大小变化
const handleResize = () => {
  activityChartInstance?.resize()
  typeChartInstance?.resize()
}

// 在 onMounted 中调用
onMounted(() => {
  fetchDashboardData()
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  activityChartInstance?.dispose()
  typeChartInstance?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
.admin-dashboard {
  padding: $spacing-unit * 2;

  .stat-card {
    margin-bottom: $spacing-unit * 2;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    
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
    
    .chart {
      height: 300px;
    }
  }

  .activity-card {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    
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
}
</style> 