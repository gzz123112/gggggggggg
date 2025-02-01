<template>
  <div class="letters-page">
    <div class="letters-container">
      <div class="page-header">
        <h2>我的信件</h2>
        <el-button type="primary" @click="router.push('/write')">写新的信</el-button>
      </div>
      
      <el-tabs v-model="activeTab">
        <el-tab-pane label="定时发送" name="scheduled">
          <div class="letters-grid">
            <div 
              v-for="letter in scheduledLetters" 
              :key="letter.id"
              class="letter-card"
            >
              <div class="letter-preview">
                <div class="letter-content" v-html="getPreviewContent(letter.content)"></div>
                <div class="letter-footer">
                  <span>预计发送时间：{{ formatDate(letter.scheduledAt) }}</span>
                  <el-button-group>
                    <el-button 
                      size="small"
                      @click="editLetter(letter)"
                    >
                      编辑
                    </el-button>
                    <el-button 
                      size="small"
                      type="danger"
                      @click="cancelSchedule(letter)"
                    >
                      取消发送
                    </el-button>
                  </el-button-group>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="草稿箱" name="drafts">
          <div class="letters-grid">
            <div 
              v-for="letter in draftLetters" 
              :key="letter.id"
              class="letter-card"
            >
              <div class="letter-preview">
                <div class="letter-content" v-html="getPreviewContent(letter.content)"></div>
                <div class="letter-footer">
                  <span>创建时间：{{ formatDate(letter.createdAt) }}</span>
                  <el-button-group>
                    <el-button 
                      size="small"
                      @click="editLetter(letter)"
                    >
                      继续编辑
                    </el-button>
                    <el-button 
                      size="small"
                      type="danger"
                      @click="deleteDraft(letter)"
                    >
                      删除
                    </el-button>
                  </el-button-group>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="已发送" name="sent">
          <div class="letters-grid">
            <div 
              v-for="letter in sentLetters" 
              :key="letter.id"
              class="letter-card"
            >
              <div class="letter-preview">
                <div class="letter-content" v-html="getPreviewContent(letter.content)"></div>
                <div class="letter-footer">
                  <span>发送时间：{{ formatDate(letter.scheduledAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLetterStore } from '../stores/letter'
import dayjs from 'dayjs'

const router = useRouter()
const letterStore = useLetterStore()
const activeTab = ref('scheduled')

const scheduledLetters = computed(() => 
  letterStore.letters.filter(letter => letter.status === 'scheduled')
)

const draftLetters = computed(() => 
  letterStore.letters.filter(letter => letter.status === 'draft')
)

const sentLetters = computed(() => 
  letterStore.letters.filter(letter => letter.status === 'sent')
)

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY年MM月DD日 HH:mm')
}

const getPreviewContent = (content: string) => {
  // 简单处理HTML内容，截取前100个字符
  const plainText = content.replace(/<[^>]+>/g, '')
  return plainText.length > 100 ? plainText.slice(0, 100) + '...' : plainText
}

const editLetter = (letter: Letter) => {
  letterStore.currentLetter = letter
  router.push('/write')
}

const cancelSchedule = async (letter: Letter) => {
  try {
    await ElMessageBox.confirm('确定要取消发送这封信吗？', '提示')
    letterStore.updateLetter(letter.id, { status: 'draft', scheduledAt: '' })
    ElMessage.success('已取消定时发送')
  } catch {
    // 用户取消操作
  }
}

const deleteDraft = async (letter: Letter) => {
  try {
    await ElMessageBox.confirm('确定要删除这封信吗？', '提示')
    letterStore.deleteLetter(letter.id)
    ElMessage.success('已删除')
  } catch {
    // 用户取消操作
  }
}
</script>

<style lang="scss">
.letters-page {
  min-height: 100vh;
  background: $background-color;
  padding: $container-padding;
  
  .letters-container {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    padding: $spacing-unit * 3;
    
    .page-header {
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
    
    .letters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: $spacing-unit * 2;
      padding: $spacing-unit * 2 0;
      
      .letter-card {
        background: $background-color;
        border-radius: 4px;
        padding: $spacing-unit * 2;
        transition: transform 0.2s;
        
        &:hover {
          transform: translateY(-2px);
        }
        
        .letter-content {
          min-height: 100px;
          margin-bottom: $spacing-unit * 2;
        }
        
        .letter-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9em;
          color: #666;
        }
      }
    }
  }
}
</style> 