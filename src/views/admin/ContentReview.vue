<template>
  <div class="content-review">
    <!-- 筛选栏 -->
    <el-card class="filter-card" shadow="hover">
      <div class="filter-header">
        <h3>内容审核</h3>
        <div class="filter-actions">
          <el-select v-model="filterStatus" placeholder="审核状态" clearable>
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
          <el-select v-model="contentType" placeholder="内容类型" clearable>
            <el-option label="信件内容" value="letter" />
            <el-option label="个人签名" value="bio" />
            <el-option label="评论" value="comment" />
          </el-select>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </div>
      </div>
    </el-card>

    <!-- 内容列表 -->
    <el-card class="content-list" shadow="hover">
      <el-table :data="contents" style="width: 100%" v-loading="loading">
        <el-table-column prop="time" label="提交时间" width="180" />
        <el-table-column label="用户" width="200">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :src="row.user.avatar" :size="32" />
              <span>{{ row.user.username }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getContentTypeTag(row.type)">
              {{ getContentTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容预览" show-overflow-tooltip />
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
                @click="handleReview(row, 'approve')"
                v-if="row.status === 'pending'"
              >
                通过
              </el-button>
              <el-button 
                type="danger" 
                link
                @click="handleReview(row, 'reject')"
                v-if="row.status === 'pending'"
              >
                拒绝
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
      title="内容详情"
      width="600px"
    >
      <div v-if="selectedContent" class="content-detail">
        <div class="detail-item">
          <label>提交时间：</label>
          <span>{{ selectedContent.time }}</span>
        </div>
        <div class="detail-item">
          <label>用户：</label>
          <span>{{ selectedContent.user.username }}</span>
        </div>
        <div class="detail-item">
          <label>内容类型：</label>
          <span>{{ getContentTypeText(selectedContent.type) }}</span>
        </div>
        <div class="detail-item">
          <label>完整内容：</label>
          <div class="content-text" v-html="selectedContent.content"></div>
        </div>
        <div class="detail-item">
          <label>敏感词检测：</label>
          <div class="sensitive-words">
            <el-tag 
              v-for="word in selectedContent.sensitiveWords"
              :key="word"
              type="danger"
              size="small"
              class="word-tag"
            >
              {{ word }}
            </el-tag>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 拒绝原因对话框 -->
    <el-dialog
      v-model="rejectDialogVisible"
      title="拒绝原因"
      width="500px"
    >
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="原因">
          <el-select v-model="rejectForm.reason" style="width: 100%">
            <el-option label="包含敏感词" value="sensitive" />
            <el-option label="内容不当" value="inappropriate" />
            <el-option label="违反规定" value="violation" />
            <el-option label="其他原因" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="rejectForm.comment"
            type="textarea"
            :rows="3"
            placeholder="请输入详细说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rejectDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmReject">确认</el-button>
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
const contentType = ref('')
const contents = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const viewDialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const selectedContent = ref(null)
const rejectForm = ref({
  reason: '',
  comment: ''
})

// 获取待审核内容列表
const fetchContents = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/admin/contents/review', {
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })
    const data = await response.json()
    
    if (data.code === 200) {
      contents.value = data.data.list
      total.value = data.data.total
    } else {
      throw new Error(data.message)
    }
  } catch (error) {
    console.error('获取审核列表失败:', error)
    ElMessage.error('获取审核列表失败')
  } finally {
    loading.value = false
  }
}

// 审核操作
const handleReview = async (row: any, action: 'approve' | 'reject') => {
  try {
    await ElMessageBox.confirm(
      `确定要${action === 'approve' ? '通过' : '拒绝'}该内容吗？`,
      '提示'
    )
    
    const response = await fetch(`/api/admin/contents/${row.id}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token}`
      },
      body: JSON.stringify({
        action,
        reason: action === 'reject' ? '违规内容' : ''
      })
    })
    
    const data = await response.json()
    if (data.code === 200) {
      ElMessage.success('操作成功')
      fetchContents()
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
const handleView = (row: any) => {
  selectedContent.value = row
  viewDialogVisible.value = true
}

// 拒绝原因对话框
const confirmReject = async () => {
  if (!rejectForm.value.reason) {
    ElMessage.warning('请选择拒绝原因')
    return
  }
  // TODO: 调用拒绝 API
  ElMessage.success('已拒绝该内容')
  rejectDialogVisible.value = false
}

// 工具函数
const getContentTypeTag = (type: string) => {
  const types: Record<string, string> = {
    letter: 'primary',
    bio: 'success',
    comment: 'info'
  }
  return types[type] || 'info'
}

const getContentTypeText = (type: string) => {
  const texts: Record<string, string> = {
    letter: '信件内容',
    bio: '个人签名',
    comment: '评论'
  }
  return texts[type] || type
}

const getStatusTag = (status: string) => {
  const types: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return texts[status] || status
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchContents()
}

// 分页
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchContents()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchContents()
}

onMounted(() => {
  fetchContents()
})
</script>

<style lang="scss" scoped>
.content-review {
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
  
  .content-list {
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
  
  .content-detail {
    .detail-item {
      margin-bottom: $spacing-unit * 2;
      
      label {
        font-weight: bold;
        color: #666;
        margin-right: $spacing-unit;
      }
      
      .content-text {
        margin-top: $spacing-unit;
        padding: $spacing-unit;
        background: #f8f9fa;
        border-radius: 4px;
        line-height: 1.6;
      }
      
      .sensitive-words {
        margin-top: $spacing-unit;
        
        .word-tag {
          margin-right: $spacing-unit;
          margin-bottom: $spacing-unit;
        }
      }
    }
  }
}
</style> 