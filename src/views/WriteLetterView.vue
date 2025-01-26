<template>
  <div class="write-letter-container">
    <el-container>
      <el-header class="write-header">
        <div class="letter-title-input">
          <el-input
            v-model="letterTitle"
            placeholder="请给您的信件取个标题..."
            class="title-input"
          />
        </div>
        
        <div class="toolbar">
          <!-- 信纸颜色选择 -->
          <el-popover placement="bottom" :width="300" trigger="click">
            <template #reference>
              <el-button type="primary">
                <el-icon><Brush /></el-icon>
                信纸样式
              </el-button>
            </template>
            <div class="paper-colors">
              <div
                v-for="color in paperColors"
                :key="color.value"
                class="color-item"
                :style="{ background: color.background }"
                @click="selectPaper(color)"
              >
                {{ color.label }}
              </div>
            </div>
          </el-popover>

          <!-- 字体工具栏 -->
          <el-select v-model="fontFamily" placeholder="选择字体">
            <el-option
              v-for="font in fonts"
              :key="font.value"
              :label="font.label"
              :value="font.value"
              :style="{ fontFamily: font.value }"
            />
          </el-select>

          <el-select v-model="fontSize" placeholder="字号">
            <el-option
              v-for="size in fontSizes"
              :key="size"
              :label="`${size}px`"
              :value="size"
            />
          </el-select>

          <!-- 文字样式 -->
          <el-button-group>
            <el-button :type="isBold ? 'primary' : ''" @click="toggleBold">
              加粗
            </el-button>
            <el-button :type="isItalic ? 'primary' : ''" @click="toggleItalic">
              斜体
            </el-button>
            <el-button :type="isUnderline ? 'primary' : ''" @click="toggleUnderline">
              下划线
            </el-button>
          </el-button-group>

          <!-- 对齐方式 -->
          <el-button-group>
            <el-button :type="textAlign === 'left' ? 'primary' : ''" @click="setAlign('left')">
              左对齐
            </el-button>
            <el-button :type="textAlign === 'center' ? 'primary' : ''" @click="setAlign('center')">
              居中
            </el-button>
            <el-button :type="textAlign === 'right' ? 'primary' : ''" @click="setAlign('right')">
              右对齐
            </el-button>
          </el-button-group>
        </div>
      </el-header>

      <el-main class="write-main">
        <div class="letter-content" :style="letterStyle">
          <el-input
            v-model="letterContent"
            type="textarea"
            :rows="20"
            :style="contentStyle"
            placeholder="写下你想对未来说的话..."
          />
        </div>
      </el-main>

      <el-footer class="write-footer">
        <div class="button-group">
          <el-button type="info" @click="saveDraft">保存草稿</el-button>
          <el-button type="primary" @click="handleSend">投递信件</el-button>
        </div>
      </el-footer>
    </el-container>

    <!-- 选择接收时间对话框 -->
    <el-dialog
      v-model="showDatePicker"
      title="选择接收时间"
      width="400px"
      center
      class="date-picker-dialog"
    >
      <div class="date-picker-content">
        <el-date-picker
          v-model="receiveDate"
          type="date"
          placeholder="选择日期"
          :disabled-date="disabledDate"
          format="YYYY年MM月DD日"
          value-format="YYYY-MM-DD"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDatePicker = false">取消</el-button>
          <el-button type="primary" @click="sendLetter">确定投递</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Brush,
  DocumentAdd,
  Timer,
  Edit,
  Document,
  Delete
} from '@element-plus/icons-vue'
import request from '@/utils/request'

const router = useRouter()
const route = useRoute()

// 信纸样式
const paperColors = [
  { label: '简约白', value: 'simple-white', background: '#ffffff' },
  { label: '星空蓝', value: 'starry-blue', background: '#e8f4ff' },
  { label: '复古黄', value: 'vintage-yellow', background: '#fff8dc' },
  { label: '薄荷绿', value: 'mint-green', background: '#f0fff0' },
  { label: '粉红色', value: 'pink', background: '#fff0f5' },
  { label: '淡紫色', value: 'lavender', background: '#e6e6fa' }
]

// 字体选项
const fonts = [
  { label: '宋体', value: 'SimSun' },
  { label: '楷体', value: 'KaiTi' },
  { label: '黑体', value: 'SimHei' },
  { label: '微软雅黑', value: 'Microsoft YaHei' },
  { label: '仿宋', value: 'FangSong' },
  { label: '华文行楷', value: 'STXingkai' },
  { label: '华文楷体', value: 'STKaiti' },
  { label: '华文宋体', value: 'STSong' }
]

const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32]

// 编辑器状态
const selectedPaper = ref(paperColors[0])
const fontFamily = ref('Microsoft YaHei')
const fontSize = ref(16)
const isBold = ref(false)
const isItalic = ref(false)
const isUnderline = ref(false)
const textAlign = ref('left')
const letterContent = ref('')
const showDatePicker = ref(false)
const receiveDate = ref('')
const letterTitle = ref('')
const draftId = ref<number | null>(null)

// 计算样式
const letterStyle = computed(() => ({
  backgroundColor: selectedPaper.value.background,
  padding: '20px',
  borderRadius: '8px',
  minHeight: '600px'
}))

const contentStyle = computed(() => ({
  fontFamily: fontFamily.value,
  fontSize: `${fontSize.value}px`,
  fontWeight: isBold.value ? 'bold' : 'normal',
  fontStyle: isItalic.value ? 'italic' : 'normal',
  textDecoration: isUnderline.value ? 'underline' : 'none',
  textAlign: textAlign.value as 'left' | 'center' | 'right',
  backgroundColor: 'transparent',
  border: 'none',
  width: '100%',
  minHeight: '500px'
}))

// 方法
const selectPaper = (color: typeof paperColors[0]) => {
  selectedPaper.value = color
}

const toggleBold = () => isBold.value = !isBold.value
const toggleItalic = () => isItalic.value = !isItalic.value
const toggleUnderline = () => isUnderline.value = !isUnderline.value
const setAlign = (align: string) => textAlign.value = align

const disabledDate = (time: Date) => {
  return time.getTime() < Date.now()
}

// 添加敏感词检测
const sensitiveWords = ['傻逼', '混蛋', '王八蛋', '滚蛋', '去死'] // 可以扩充

const checkContent = (content: string) => {
  return sensitiveWords.some(word => content.includes(word))
}

// 保存草稿
const saveDraft = () => {
  try {
    if (!letterTitle.value || !letterContent.value) {
      ElMessage.warning('请填写标题和内容')
      return
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) {
      ElMessage.error('请先登录')
      router.push('/')
      return
    }

    const draft = {
      id: draftId.value || Date.now(),
      userId: user.id,
      title: letterTitle.value,
      content: letterContent.value,
      updateTime: new Date().toISOString(),
      style: {
        fontFamily: fontFamily.value,
        fontSize: fontSize.value,
        isBold: isBold.value,
        isItalic: isItalic.value,
        isUnderline: isUnderline.value,
        textAlign: textAlign.value,
        paperColor: selectedPaper.value
      }
    }

    let drafts = JSON.parse(localStorage.getItem('letterDrafts') || '[]')
    const index = drafts.findIndex((d: any) => d.id === draft.id)
    
    if (index !== -1) {
      drafts[index] = draft
    } else {
      drafts.push(draft)
    }

    localStorage.setItem('letterDrafts', JSON.stringify(drafts))

    // 记录活动
    const activities = JSON.parse(localStorage.getItem('activities') || '[]')
    activities.unshift({
      id: Date.now(),
      userId: user.id,
      content: `保存了一封草稿《${draft.title}》`,
      time: new Date().toISOString(),
      type: 'info'
    })
    localStorage.setItem('activities', JSON.stringify(activities))

    ElMessage.success('草稿已保存')
    
    // 询问是否查看草稿箱
    ElMessageBox.confirm(
      '草稿已保存，是否查看草稿箱？',
      '保存成功',
      {
        confirmButtonText: '查看草稿箱',
        cancelButtonText: '继续编辑',
        type: 'success'
      }
    ).then(() => {
      router.push('/drafts')
    }).catch(() => {
      // 继续编辑
    })
  } catch (error) {
    console.error('保存草稿失败:', error)
    ElMessage.error('保存失败，请重试')
  }
}

// 修改发送信件的逻辑
const handleSend = () => {
  if (!letterTitle.value || !letterContent.value) {
    ElMessage.warning('请填写标题和内容')
    return
  }
  // 显示日期选择对话框
  showDatePicker.value = true
}

// 修改发送信件的逻辑
const sendLetter = async () => {
  try {
    if (!letterTitle.value || !letterContent.value || !receiveDate.value) {
      ElMessage.warning('请填写完整信件内容并选择接收时间')
      return
    }

    // 检查内容是否包含敏感词
    if (checkContent(letterContent.value)) {
      ElMessage.error('信件内容包含不当词汇，请修改后重试')
      return
    }

    const letter = {
      id: Date.now(),
      userId: JSON.parse(localStorage.getItem('user') || '{}').id,
      title: letterTitle.value,
      content: letterContent.value,
      sendTime: new Date().toISOString(),
      receiveTime: receiveDate.value,
      status: 'pending', // 改为待审核状态
      isRead: false,
      style: {
        fontFamily: fontFamily.value,
        fontSize: fontSize.value,
        isBold: isBold.value,
        isItalic: isItalic.value,
        isUnderline: isUnderline.value,
        textAlign: textAlign.value,
        paperColor: selectedPaper.value
      }
    }

    // 保存信件到待审核列表
    const pendingLetters = JSON.parse(localStorage.getItem('pendingLetters') || '[]')
    pendingLetters.push(letter)
    localStorage.setItem('pendingLetters', JSON.stringify(pendingLetters))

    // 记录活动
    const activities = JSON.parse(localStorage.getItem('activities') || '[]')
    activities.unshift({
      id: Date.now(),
      userId: letter.userId,
      content: `提交了一封信《${letter.title}》等待审核`,
      time: new Date().toISOString(),
      type: 'info'
    })
    localStorage.setItem('activities', JSON.stringify(activities))

    ElMessage.success('信件已提交审核，请等待管理员审核')
    router.push('/my')
  } catch (error) {
    console.error('投递信件失败:', error)
    ElMessage.error('投递失败，请重试')
  }
}

const submitLetter = async () => {
  try {
    const response = await request.post('/letters', {
      title: letterTitle.value,
      content: letterContent.value
    })
    
    // 通知管理员有新信件
    const socket = new WebSocket('ws://your-backend-url/ws/admin')
    socket.onopen = () => {
      socket.send(JSON.stringify({
        type: 'NEW_LETTER',
        data: response.data
      }))
      socket.close()
    }
    
    ElMessage.success('信件提交成功')
  } catch (error) {
    ElMessage.error('信件提交失败')
  }
}

// 检查是否需要加载草稿
onMounted(() => {
  const draftIdFromQuery = Number(route.query.draftId)
  if (draftIdFromQuery) {
    draftId.value = draftIdFromQuery
    const drafts = JSON.parse(localStorage.getItem('letterDrafts') || '[]')
    const draft = drafts.find((d: any) => d.id === draftIdFromQuery)
    if (draft) {
      letterTitle.value = draft.title
      letterContent.value = draft.content
      fontFamily.value = draft.style.fontFamily
      fontSize.value = draft.style.fontSize
      isBold.value = draft.style.isBold
      isItalic.value = draft.style.isItalic
      isUnderline.value = draft.style.isUnderline
      textAlign.value = draft.style.textAlign
      selectedPaper.value = draft.style.paperColor
    }
  }
})
</script>

<style scoped>
.write-letter-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.write-header {
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 10px 20px;
  height: auto !important;
}

.toolbar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.paper-colors {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 10px;
}

.color-item {
  padding: 15px;
  text-align: center;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s;
}

.color-item:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.write-main {
  padding: 20px;
}

.letter-content {
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.write-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 20px;
  background-color: white;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
}

.date-picker-dialog {
  :deep(.el-dialog__body) {
    padding: 30px;
  }
}

.date-picker-content {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
}

:deep(.el-textarea__inner) {
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  font-style: inherit;
  text-decoration: inherit;
  text-align: inherit;
  background-color: transparent;
  border: none;
  resize: none;
  box-shadow: none !important;
  padding: 20px;
  line-height: 1.8;
}

:deep(.el-textarea__inner:focus) {
  box-shadow: none !important;
}

/* 自定义消息样式 */
:deep(.custom-message) {
  min-width: 400px !important;
  padding: 20px !important;
}

:deep(.custom-message .el-message__content) {
  font-size: 16px !important;
  line-height: 1.5;
  color: #333;
}

/* 添加标题输入框样式 */
.letter-title-input {
  margin-bottom: 15px;
}

.title-input {
  max-width: 800px;
  margin: 0 auto;
}
</style> 