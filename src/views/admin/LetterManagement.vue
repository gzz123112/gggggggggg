<template>
  <div class="letter-management">
    <div class="page-header">
      <h2>信件管理</h2>
      <div class="header-actions">
        <el-input
          v-model="searchQuery"
          placeholder="搜索信件..."
          prefix-icon="Search"
          clearable
          @clear="handleSearch"
          @input="handleSearch"
        />
        <el-select v-model="filterStatus" placeholder="状态筛选" clearable>
          <el-option label="待发送" value="pending" />
          <el-option label="已发送" value="sent" />
          <el-option label="草稿" value="draft" />
        </el-select>
      </div>
    </div>

    <el-card>
      <el-table
        :data="letters"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column label="作者" width="200">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :src="row.author.avatar" :size="32" />
              <span>{{ row.author.username }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="scheduledAt" label="计划发送时间" width="180">
          <template #default="{ row }">
            {{ row.scheduledAt ? formatDate(row.scheduledAt) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
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
                type="primary" 
                link
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button 
                type="danger" 
                link
                @click="handleDelete(row)"
              >
                删除
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

    <!-- 查看信件对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="信件详情"
      width="800px"
    >
      <div class="letter-detail">
        <h3>{{ currentLetter?.title }}</h3>
        <div class="letter-meta">
          <span>作者：{{ currentLetter?.author.username }}</span>
          <span>创建时间：{{ formatDate(currentLetter?.createdAt) }}</span>
          <span>状态：{{ getStatusText(currentLetter?.status) }}</span>
        </div>
        <div class="letter-content" v-html="currentLetter?.content"></div>
      </div>
    </el-dialog>

    <!-- 编辑信件对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑信件"
      width="800px"
    >
      <el-form
        ref="formRef"
        :model="letterForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="letterForm.title" />
        </el-form-item>
        
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="letterForm.content"
            type="textarea"
            :rows="10"
          />
        </el-form-item>
        
        <el-form-item label="发送时间" prop="scheduledAt">
          <el-date-picker
            v-model="letterForm.scheduledAt"
            type="datetime"
            placeholder="选择发送时间"
          />
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-select v-model="letterForm.status">
            <el-option label="待发送" value="pending" />
            <el-option label="已发送" value="sent" />
            <el-option label="草稿" value="draft" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import dayjs from 'dayjs'

const loading = ref(false)
const searchQuery = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const letters = ref([
  {
    id: '1',
    title: '给未来的自己',
    content: '<p>这是一封测试信件...</p>',
    author: {
      username: '张三',
      avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
    },
    status: 'pending',
    createdAt: '2024-01-01T00:00:00.000Z',
    scheduledAt: '2024-12-31T00:00:00.000Z'
  },
  // ... 更多信件数据
])

const viewDialogVisible = ref(false)
const editDialogVisible = ref(false)
const currentLetter = ref<any>(null)
const submitting = ref(false)

const letterForm = ref({
  id: '',
  title: '',
  content: '',
  scheduledAt: '',
  status: 'pending'
})

const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

const formRef = ref<FormInstance>()

const formatDate = (date: string) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '-'
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'warning',
    sent: 'success',
    draft: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待发送',
    sent: '已发送',
    draft: '草稿'
  }
  return texts[status] || status
}

const handleSearch = () => {
  // TODO: 实现搜索功能
}

const handleView = (row: any) => {
  currentLetter.value = row
  viewDialogVisible.value = true
}

const handleEdit = (row: any) => {
  letterForm.value = { ...row }
  editDialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    // TODO: 调用更新信件 API
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('保存成功')
    editDialogVisible.value = false
  } catch (error) {
    console.error(error)
  } finally {
    submitting.value = false
  }
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该信件吗？此操作不可恢复', '提示', {
    type: 'warning'
  }).then(async () => {
    // TODO: 调用删除信件 API
    ElMessage.success('删除成功')
  })
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
.letter-management {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-unit * 3;
    
    h2 {
      margin: 0;
      font-size: 1.5rem;
      color: $text-color;
    }
    
    .header-actions {
      display: flex;
      gap: $spacing-unit * 2;
      
      .el-input {
        width: 300px;
      }
    }
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: $spacing-unit;
  }
  
  .pagination-container {
    margin-top: $spacing-unit * 2;
    display: flex;
    justify-content: flex-end;
  }
}

.letter-detail {
  h3 {
    margin: 0 0 $spacing-unit * 2;
    font-size: 1.5rem;
    color: $text-color;
  }
  
  .letter-meta {
    display: flex;
    gap: $spacing-unit * 3;
    margin-bottom: $spacing-unit * 3;
    color: #666;
  }
  
  .letter-content {
    line-height: 1.8;
    
    :deep(p) {
      margin: $spacing-unit 0;
    }
  }
}
</style> 
</style> 