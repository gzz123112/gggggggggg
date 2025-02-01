<template>
  <div class="reports">
    <!-- 筛选栏 -->
    <el-card class="filter-card" shadow="hover">
      <div class="filter-header">
        <h3>举报处理</h3>
        <div class="filter-actions">
          <el-select v-model="filterStatus" placeholder="处理状态" clearable>
            <el-option label="待处理" value="pending" />
            <el-option label="已处理" value="processed" />
            <el-option label="已忽略" value="ignored" />
          </el-select>
          <el-select v-model="reportType" placeholder="举报类型" clearable>
            <el-option label="垃圾信息" value="spam" />
            <el-option label="不当内容" value="inappropriate" />
            <el-option label="侵权" value="copyright" />
            <el-option label="其他" value="other" />
          </el-select>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </div>
      </div>
    </el-card>

    <!-- 举报列表 -->
    <el-card class="reports-list" shadow="hover">
      <el-table :data="reports" style="width: 100%" v-loading="loading">
        <el-table-column prop="time" label="举报时间" width="180" />
        <el-table-column label="举报人" width="180">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :src="row.reporter.avatar" :size="32" />
              <span>{{ row.reporter.username }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="被举报人" width="180">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :src="row.reported.avatar" :size="32" />
              <span>{{ row.reported.username }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="举报类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getReportTypeTag(row.type)">
              {{ getReportTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="举报原因" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button 
                type="primary" 
                link
                @click="handleView(row)"
              >
                查看
              </el-button>
              <el-button 
                type="success" 
                link
                @click="handleProcess(row)"
                v-if="row.status === 'pending'"
              >
                处理
              </el-button>
              <el-button 
                type="info" 
                link
                @click="handleIgnore(row)"
                v-if="row.status === 'pending'"
              >
                忽略
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="举报详情"
      width="600px"
    >
      <div v-if="selectedReport" class="report-detail">
        <div class="detail-item">
          <label>举报时间：</label>
          <span>{{ selectedReport.time }}</span>
        </div>
        <div class="detail-item">
          <label>举报人：</label>
          <span>{{ selectedReport.reporter.username }}</span>
        </div>
        <div class="detail-item">
          <label>被举报人：</label>
          <span>{{ selectedReport.reported.username }}</span>
        </div>
        <div class="detail-item">
          <label>举报类型：</label>
          <span>{{ getReportTypeText(selectedReport.type) }}</span>
        </div>
        <div class="detail-item">
          <label>举报原因：</label>
          <div class="reason-text">{{ selectedReport.reason }}</div>
        </div>
        <div class="detail-item">
          <label>相关内容：</label>
          <div class="content-preview" v-html="selectedReport.content"></div>
        </div>
        <div class="detail-item">
          <label>证据截图：</label>
          <div class="evidence-images">
            <el-image
              v-for="(img, index) in selectedReport.evidence"
              :key="index"
              :src="img"
              :preview-src-list="selectedReport.evidence"
              fit="cover"
              class="evidence-image"
            />
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 处理对话框 -->
    <el-dialog
      v-model="processDialogVisible"
      title="处理举报"
      width="500px"
    >
      <el-form :model="processForm" label-width="80px">
        <el-form-item label="处理方式">
          <el-select v-model="processForm.action" style="width: 100%">
            <el-option label="警告用户" value="warn" />
            <el-option label="删除内容" value="delete" />
            <el-option label="封禁账号" value="ban" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理说明">
          <el-input
            v-model="processForm.comment"
            type="textarea"
            :rows="3"
            placeholder="请输入处理说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="processDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmProcess">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const userStore = useUserStore()
const loading = ref(false)
const filterStatus = ref('')
const reportType = ref('')
const reports = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const viewDialogVisible = ref(false)
const processDialogVisible = ref(false)
const selectedReport = ref(null)
const processForm = ref({
  action: '',
  comment: ''
})

// 获取举报列表
const fetchReports = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/admin/reports', {
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })
    const data = await response.json()
    
    if (data.code === 200) {
      reports.value = data.data.list
      total.value = data.data.total
    } else {
      throw new Error(data.message)
    }
  } catch (error) {
    console.error('获取举报列表失败:', error)
    ElMessage.error('获取举报列表失败')
  } finally {
    loading.value = false
  }
}

// 处理举报
const handleReport = async (row: any, action: 'process' | 'ignore') => {
  try {
    await ElMessageBox.confirm(
      `确定要${action === 'process' ? '处理' : '忽略'}该举报吗？`,
      '提示'
    )
    
    const response = await fetch(`/api/admin/reports/${row.id}/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token}`
      }
    })
    
    const data = await response.json()
    if (data.code === 200) {
      ElMessage.success('操作成功')
      fetchReports()
    } else {
      throw new Error(data.message)
    }
  } catch (error) {
    if (error instanceof Error) {
      ElMessage.error(error.message)
    }
  }
}

// 查看详情
const handleViewDetail = (row: any) => {
  // 实现查看详情逻辑
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchReports()
}

// 分页
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchReports()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchReports()
}

onMounted(() => {
  fetchReports()
})

// 工具函数
const getReportTypeTag = (type: string) => {
  const types: Record<string, string> = {
    spam: 'warning',
    inappropriate: 'danger',
    copyright: 'info',
    other: ''
  }
  return types[type] || ''
}

const getReportTypeText = (type: string) => {
  const texts: Record<string, string> = {
    spam: '垃圾信息',
    inappropriate: '不当内容',
    copyright: '侵权',
    other: '其他'
  }
  return texts[type] || type
}

const getStatusTag = (status: string) => {
  const types: Record<string, string> = {
    pending: 'warning',
    processed: 'success',
    ignored: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待处理',
    processed: '已处理',
    ignored: '已忽略'
  }
  return texts[status] || status
}

// 处理函数
const handleView = (row: any) => {
  selectedReport.value = row
  viewDialogVisible.value = true
}

const handleProcess = (row: any) => {
  selectedReport.value = row
  processDialogVisible.value = true
}

const handleIgnore = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定忽略该举报吗？', '提示', {
      type: 'warning'
    })
    // TODO: 调用忽略 API
    ElMessage.success('已忽略该举报')
  } catch {
    // 用户取消操作
  }
}

const confirmProcess = async () => {
  if (!processForm.value.action) {
    ElMessage.warning('请选择处理方式')
    return
  }
  // TODO: 调用处理 API
  ElMessage.success('处理成功')
  processDialogVisible.value = false
}
</script>

<style lang="scss" scoped>
.reports {
  .filter-card {
    margin-bottom: $spacing-unit * 3;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: none;
    
    .filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h3 {
        margin: 0;
        font-size: 1.2rem;
        color: $text-color;
        font-family: $font-family-decorative;
      }
      
      .filter-actions {
        display: flex;
        gap: $spacing-unit * 2;
      }
    }
  }
  
  .reports-list {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: none;
    
    .user-info {
      display: flex;
      align-items: center;
      gap: $spacing-unit;
    }
  }
  
  .pagination-container {
    margin-top: $spacing-unit * 2;
    display: flex;
    justify-content: flex-end;
  }
  
  .report-detail {
    .detail-item {
      margin-bottom: $spacing-unit * 2;
      
      label {
        font-weight: bold;
        color: #666;
        margin-right: $spacing-unit;
      }
      
      .reason-text,
      .content-preview {
        margin-top: $spacing-unit;
        padding: $spacing-unit;
        background: #f8f9fa;
        border-radius: 4px;
        line-height: 1.6;
      }
      
      .evidence-images {
        margin-top: $spacing-unit;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: $spacing-unit;
        
        .evidence-image {
          width: 120px;
          height: 120px;
          border-radius: 4px;
          cursor: pointer;
        }
      }
    }
  }
}
</style> 