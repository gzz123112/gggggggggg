<template>
  <div class="write-letter">
    <div class="letter-container">
      <div class="letter-header">
        <h2>写给未来的信</h2>
        <el-button @click="router.back()" icon="ArrowLeft">返回</el-button>
      </div>
      
      <div class="letter-content">
        <div class="editor-container">
          <el-form :model="letterForm" :rules="rules" ref="formRef">
            <el-form-item prop="title">
              <el-input 
                v-model="letterForm.title" 
                placeholder="信件标题"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
            
            <el-form-item prop="content">
              <div class="editor-wrapper">
                <Toolbar
                  :editor="editorRef"
                  :defaultConfig="toolbarConfig"
                  mode="default"
                  style="border-bottom: 1px solid #ccc"
                />
                <Editor
                  v-model="letterForm.content"
                  :defaultConfig="editorConfig"
                  mode="default"
                  @onCreated="handleCreated"
                  style="height: 500px"
                />
              </div>
            </el-form-item>
            
            <el-form-item label="发送时间">
              <el-date-picker
                v-model="letterForm.sendTime"
                type="datetime"
                placeholder="选择发送时间"
                :disabledDate="disabledDate"
                :shortcuts="shortcuts"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="handleSubmit">保存</el-button>
              <el-button @click="handleDraft">存为草稿</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { useLetterStore } from '../stores/letter'
import type { IDomEditor } from '@wangeditor/editor'
import type { IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { useUserStore } from '../stores/user'

const router = useRouter()
const letterStore = useLetterStore()
const userStore = useUserStore()

const editorRef = shallowRef<IDomEditor>()
const letterForm = ref({
  title: '',
  content: '',
  sendTime: ''
})

const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 50, message: '标题长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入正文内容', trigger: 'blur' }
  ],
  sendTime: [
    { required: true, message: '请选择发送时间', trigger: 'change' }
  ]
}

const editorConfig: Partial<IEditorConfig> = {
  placeholder: '写下你想说的话...',
  MENU_CONF: {}
}

const toolbarConfig: Partial<IToolbarConfig> = {
  excludeKeys: [
    'uploadImage',
    'uploadVideo',
    'insertTable',
    'codeBlock',
    'todo'
  ]
}

const disabledDate = (time: Date) => {
  return time.getTime() < Date.now()
}

const shortcuts = [
  {
    text: '一周后',
    value: () => dayjs().add(1, 'week').toDate()
  },
  {
    text: '一个月后',
    value: () => dayjs().add(1, 'month').toDate()
  },
  {
    text: '一年后',
    value: () => dayjs().add(1, 'year').toDate()
  }
]

const handleCreated = (editor: IDomEditor) => {
  editorRef.value = editor
}

const formRef = ref<FormInstance>()
const handleSubmit = async () => {
  try {
    const response = await fetch('/api/letters/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userStore.token}`
      },
      body: JSON.stringify({
        title: letterForm.value.title,
        content: letterForm.value.content,
        scheduledAt: letterForm.value.sendTime,
        status: 'scheduled'
      })
    })

    const data = await response.json()
    if (data.code === 200) {
      ElMessage.success('信件已保存')
      router.push('/letters')
    } else {
      throw new Error(data.message)
    }
  } catch (error) {
    console.error('保存信件失败:', error)
    ElMessage.error('保存失败')
  }
}

const handleDraft = () => {
  letterStore.saveLetter({
    title: letterForm.value.title,
    content: letterForm.value.content,
    createdAt: new Date().toISOString(),
    scheduledAt: '',
    status: 'draft'
  })
  router.push('/letters')
  ElMessage.success('草稿已保存')
}

onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor) editor.destroy()
})
</script>

<style lang="scss">
.write-letter {
  min-height: 100vh;
  background: $background-color;
  padding: $container-padding;
  
  .letter-container {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    padding: $spacing-unit * 3;
    
    .letter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: $spacing-unit * 3;
      
      h2 {
        font-family: $font-family-decorative;
        color: $text-color;
        margin: 0;
      }
    }
    
    .editor-container {
      border: 1px solid #ccc;
      border-radius: 4px;
      
      .editor-wrapper {
        border-bottom: 1px solid #ccc;
      }
    }
  }
}

.w-e-bar {
  padding: 0 8px !important;
}
</style> 