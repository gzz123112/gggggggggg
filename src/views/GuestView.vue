<template>
  <div class="guest-container">
    <el-container>
      <el-header class="guest-header">
        <div class="header-left">
          <h2>时光邮递 - 访客预览</h2>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="router.push('/')">
            立即注册/登录
          </el-button>
        </div>
      </el-header>

      <el-main class="guest-main">
        <!-- 功能介绍 -->
        <el-row :gutter="20" class="feature-section">
          <el-col :span="8" v-for="feature in features" :key="feature.title">
            <el-card class="feature-card">
              <el-icon class="feature-icon" :size="40">
                <component :is="feature.icon" />
              </el-icon>
              <h3>{{ feature.title }}</h3>
              <p class="feature-content">{{ feature.description }}</p>
            </el-card>
          </el-col>
        </el-row>

        <!-- 优秀信件展示 -->
        <div class="showcase-section">
          <h2 class="section-title">精选信件展示</h2>
          <el-carousel :interval="4000" type="card" height="300px">
            <el-carousel-item v-for="letter in showcaseLetters" :key="letter.id">
              <div class="letter-card" :style="{ backgroundColor: letter.bgColor }">
                <h3>{{ letter.title }}</h3>
                <p class="letter-preview">{{ letter.content }}</p>
                <div class="letter-info">
                  <span>{{ letter.date }}</span>
                </div>
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>

        <!-- 使用指南 -->
        <div class="guide-section">
          <h2 class="section-title">使用指南</h2>
          <el-timeline>
            <el-timeline-item
              v-for="(step, index) in guideSteps"
              :key="index"
              :timestamp="step.title"
              placement="top"
            >
              <el-card>
                <p>{{ step.content }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-main>

      <el-footer class="guest-footer">
        <p>© 2024 时光邮递. 让每一封信都承载着温暖与期待</p>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Edit,
  Timer,
  Message,
  Connection
} from '@element-plus/icons-vue'

const router = useRouter()

const features = [
  {
    icon: Edit,
    title: '写给未来的信',
    description: '记录此刻的心情，寄给未来的自己'
  },
  {
    icon: Timer,
    title: '时间胶囊',
    description: '为信件设置接收时间，创造惊喜的期待'
  },
  {
    icon: Connection,
    title: '多样化编辑',
    description: '丰富的编辑功能，让每封信都独一无二'
  }
]

const showcaseLetters = [
  {
    id: 1,
    title: '致18岁的自己',
    content: '亲爱的自己，当你收到这封信时，想必已经走过了人生的重要转折点...',
    date: '2023-06-15',
    bgColor: '#e8f4ff'
  },
  {
    id: 2,
    title: '毕业季的约定',
    content: '四年时光，转眼即逝。愿我们带着最美好的回忆，迎接人生的下一站...',
    date: '2023-07-01',
    bgColor: '#fff8dc'
  },
  {
    id: 3,
    title: '新年寄语',
    content: '写下此刻的期许，愿未来的自己能够微笑着说：我做到了...',
    date: '2024-01-01',
    bgColor: '#f0fff0'
  }
]

const guideSteps = [
  {
    title: '注册账号',
    content: '简单注册，开启您的时光邮递之旅'
  },
  {
    title: '写下心语',
    content: '选择信纸样式，编辑您想说的话'
  },
  {
    title: '设置时间',
    content: '选择信件接收的时间点'
  },
  {
    title: '等待惊喜',
    content: '当时间到达，您将收到来自过去的自己的问候'
  }
]

const letters = ref([
  {
    title: '新年寄语',
    content: '新岁启封，万事可期。过去一年的磨砺，皆是成长序章。新的一年，愿你如傲雪寒梅，坚韧绽放。事业学业顺遂，每分耕耘皆有收获。阖家团圆安康，日子满是温馨。怀揣热忱，奔赴热爱，所行皆坦途，所遇皆美好，尽享流年的温柔与诗意。',
    author: '时光邮递团队',
    date: '2023-12-31'
  },
  {
    title: '毕业季的约定',
    content: '栀子花开，骊歌奏响。毕业是新程的序章，而非故事的终章。同窗情谊，铭记于心。待来年春日，我们重聚校园，漫步旧径，忆起往昔的欢笑与梦想，再续青春的热烈。愿你我此去繁花似锦，归来仍是少年，情谊如松柏常青。',
    author: '时光邮递团队',
    date: '2023-06-30'
  },
  {
    title: '致18岁的自己',
    content: '18岁的你，站在青春的路口，风华正茂。往昔的青涩懵懂，都化作前行的力量。往后岁月，愿你像展翅大鹏，扶摇直上。心怀赤子热忱，奔赴山海。秉持善良初心，不被世俗左右。用汗水浇灌梦想，在这滚烫的年华，绽放独属于你的璀璨光芒。',
    author: '时光邮递团队',
    date: '2023-05-04'
  }
])
</script>

<style scoped>
.guest-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.guest-header {
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
}

.guest-main {
  padding: 40px 20px;
}

.feature-section {
  margin-bottom: 60px;
}

.feature-card {
  text-align: center;
  padding: 30px;
  height: 100%;
  background: linear-gradient(145deg, #f0f0f0, #ffffff);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.feature-content {
  text-align: left;
  line-height: 1.8;
  color: #606266;
  font-size: 15px;
  margin-top: 20px;
}

.feature-icon {
  color: #409eff;
  margin-bottom: 20px;
}

.showcase-section {
  margin-bottom: 60px;
}

.section-title {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
}

.letter-card {
  height: 100%;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.letter-preview {
  flex: 1;
  margin: 20px 0;
  line-height: 1.8;
}

.letter-info {
  text-align: right;
  color: #909399;
}

.guide-section {
  max-width: 800px;
  margin: 0 auto;
}

.guest-footer {
  text-align: center;
  padding: 20px;
  background-color: white;
  color: #909399;
}

:deep(.el-carousel__item) {
  border-radius: 8px;
}
</style> 