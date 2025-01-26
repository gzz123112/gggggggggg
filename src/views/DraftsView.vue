<template>
  <div class="drafts-container">
    <el-container>
      <el-header class="drafts-header">
        <div class="header-content">
          <h2>我的草稿箱</h2>
          <el-button @click="router.push('/my')">返回</el-button>
        </div>
      </el-header>

      <el-main class="drafts-main">
        <template v-if="drafts.length">
          <el-card v-for="draft in drafts" :key="draft.id" class="draft-card">
            <template #header>
              <div class="draft-header">
                <span class="draft-title">{{ draft.title || '未命名草稿' }}</span>
                <span class="draft-date">{{ draft.updateTime }}</span>
              </div>
            </template>
            <div class="draft-content">
              <p class="draft-preview">{{ draft.content.substring(0, 100) }}...</p>
              <div class="draft-actions">
                <el-button type="primary" @click="editDraft(draft)">继续编辑</el-button>
                <el-button type="danger" @click="confirmDelete(draft)">删除草稿</el-button>
              </div>
            </div>
          </el-card>
        </template>
        <el-empty
          v-else
          description="暂无草稿"
          :image-size="200"
        >
          <el-button type="primary" @click="router.push('/write')">
            写新信件
          </el-button>
        </el-empty>
      </el-main>
    </el-container>

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="showDeleteConfirm"
      title="删除确认"
      width="300px"
      center
    >
      <span>确定要删除这封草稿吗？</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDeleteConfirm = false">取消</el-button>
          <el-button type="danger" @click="deleteDraft">确定删除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

interface Draft {
  id: number
  title: string
  content: string
  updateTime: string
  style: {
    fontFamily: string
    fontSize: number
    isBold: boolean
    isItalic: boolean
    isUnderline: boolean
    textAlign: string
    paperColor: any
  }
}

// 从 localStorage 加载草稿
const drafts = ref<Draft[]>([])
const loadDrafts = () => {
  drafts.value = JSON.parse(localStorage.getItem('letterDrafts') || '[]')
}

const showDeleteConfirm = ref(false)
const currentDraft = ref<Draft | null>(null)

const editDraft = (draft: Draft) => {
  router.push({
    path: '/write',
    query: { draftId: draft.id }
  })
}

const confirmDelete = (draft: Draft) => {
  currentDraft.value = draft
  showDeleteConfirm.value = true
}

const deleteDraft = () => {
  if (currentDraft.value) {
    const updatedDrafts = drafts.value.filter(d => d.id !== currentDraft.value?.id)
    localStorage.setItem('letterDrafts', JSON.stringify(updatedDrafts))
    drafts.value = updatedDrafts
    ElMessage.success('草稿已删除')
    showDeleteConfirm.value = false
  }
}

// 初始加载草稿
onMounted(() => {
  loadDrafts()
})
</script>

<style scoped>
.drafts-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.drafts-header {
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.drafts-main {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.draft-card {
  margin-bottom: 20px;
  transition: all 0.3s;
}

.draft-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.draft-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.draft-title {
  font-weight: bold;
  font-size: 16px;
}

.draft-date {
  color: #999;
  font-size: 14px;
}

.draft-content {
  color: #666;
}

.draft-preview {
  margin-bottom: 15px;
  line-height: 1.6;
}

.draft-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-empty__description) {
  margin-top: 20px;
}
</style> 