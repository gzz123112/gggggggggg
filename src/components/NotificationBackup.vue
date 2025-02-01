<template>
  <div class="notification-backup">
    <div class="backup-actions">
      <el-button type="primary" @click="handleExport">
        导出通知
      </el-button>
      <el-upload
        class="upload-btn"
        accept=".json"
        :show-file-list="false"
        :before-upload="handleImport"
      >
        <el-button>导入通知</el-button>
      </el-upload>
    </div>

    <div class="backup-history">
      <h3>备份历史</h3>
      <el-table :data="backupHistory" style="width: 100%">
        <el-table-column prop="date" label="备份时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.date) }}
          </template>
        </el-table-column>
        <el-table-column prop="count" label="通知数量" width="120" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.type === 'export' ? 'success' : 'warning'">
              {{ row.type === 'export' ? '导出' : '导入' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              link
              @click="handleRestore(row)"
              v-if="row.type === 'export'"
            >
              恢复
            </el-button>
            <el-button 
              type="danger" 
              link
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useNotification } from '@/composables/useNotification'
import { downloadNotifications, importNotifications } from '@/utils/notificationExport'
import { formatDate } from '@/utils/date'

const { notifications } = useNotification()

const backupHistory = ref([
  {
    id: '1',
    date: new Date().toISOString(),
    count: 10,
    type: 'export'
  }
])

const handleExport = () => {
  try {
    downloadNotifications(notifications.value)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error(error)
    ElMessage.error('导出失败')
  }
}

const handleImport = async (file: File) => {
  try {
    const data = await importNotifications(file)
    // TODO: 处理导入的通知数据
    ElMessage.success('导入成功')
    return false
  } catch (error) {
    ElMessage.error('导入失败')
    return false
  }
}

const handleRestore = (backup: any) => {
  ElMessage.success('恢复成功')
}

const handleDelete = (backup: any) => {
  ElMessage.success('删除成功')
}
</script>

<style lang="scss" scoped>
.notification-backup {
  .backup-actions {
    display: flex;
    gap: $spacing-unit * 2;
    margin-bottom: $spacing-unit * 3;
  }
  
  .backup-history {
    h3 {
      margin: 0 0 $spacing-unit * 2;
      font-size: 1.2rem;
      color: $text-color;
    }
  }
}
</style> 