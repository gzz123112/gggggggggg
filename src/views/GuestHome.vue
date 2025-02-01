<template>
  <div class="guest-home">
    <div class="welcome-section">
      <h1>欢迎来到时光信笺</h1>
      <p>让每一封信都承载永恒的记忆</p>
    </div>

    <div class="feature-section">
      <h2>产品特色</h2>
      <el-row :gutter="40">
        <el-col :span="8" v-for="feature in features" :key="feature.title">
          <el-card class="feature-card" shadow="hover">
            <div class="feature-icon" :style="{ background: feature.color }">
              <el-icon><component :is="feature.icon" /></el-icon>
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="letter-showcase">
      <h2>精选信件</h2>
      <el-carousel :interval="4000" type="card" height="400px">
        <el-carousel-item v-for="letter in showcaseLetters" :key="letter.id">
          <div class="letter-card">
            <div class="letter-content">
              <div class="letter-stamp"></div>
              <h3>{{ letter.title }}</h3>
              <p>{{ letter.content }}</p>
              <div class="letter-meta">
                <span class="date">{{ letter.date }}</span>
                <span class="author">{{ letter.author }}</span>
              </div>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <div class="cta-section">
      <div class="cta-content">
        <h2>开启您的时光之旅</h2>
        <p>记录此刻，珍藏永恒</p>
        <div class="cta-buttons">
          <el-button type="primary" size="large" @click="goToRegister">
            立即注册
          </el-button>
          <el-button size="large" @click="goToLogin">
            登录账号
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Timer, Edit, Lock } from '@element-plus/icons-vue'

const router = useRouter()

const features = [
  {
    icon: Timer,
    title: '时光邮递',
    description: '写给未来的信，在特定时刻传递',
    color: '#409EFF'
  },
  {
    icon: Edit,
    title: '情感表达',
    description: '用文字传递真挚的情感',
    color: '#67C23A'
  },
  {
    icon: Lock,
    title: '隐私保护',
    description: '严格的隐私保护机制',
    color: '#E6A23C'
  }
]

const showcaseLetters = [
  {
    id: 1,
    title: '给未来的自己',
    content: '亲爱的自己，当你看到这封信的时候，希望你依然保持着对生活的热爱和期待。记住，无论经历了什么，都要保持微笑，因为你是最棒的...',
    date: '2024-01-01',
    author: '时光守护者'
  },
  {
    id: 2,
    title: '致我的孩子',
    content: '亲爱的宝贝，写下这封信时你还未出生，但我已经无比期待与你相见。愿你平安健康地长大，成为一个善良勇敢的人...',
    date: '2024-02-14',
    author: '未来的父亲'
  },
  {
    id: 3,
    title: '写给青春',
    content: '那些年，我们一起追过的梦，一起度过的时光，都将成为永恒的回忆。感谢有你们的陪伴，让我的青春如此美好...',
    date: '2024-03-21',
    author: '追梦人'
  }
]

const goToRegister = () => {
  router.push('/register')
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style lang="scss" scoped>
.guest-home {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  
  .welcome-section {
    text-align: center;
    padding: $spacing-unit * 8 0;
    background: linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
    backdrop-filter: blur(10px);
    
    h1 {
      font-size: 3.5rem;
      font-family: $font-family-decorative;
      color: $primary-color;
      margin-bottom: $spacing-unit * 2;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    p {
      font-size: 1.5rem;
      color: #666;
      margin-bottom: $spacing-unit * 3;
    }
  }
  
  .feature-section {
    padding: $spacing-unit * 6 $spacing-unit * 4;
    background: white;
    
    h2 {
      text-align: center;
      font-size: 2.5rem;
      color: $text-color;
      margin-bottom: $spacing-unit * 4;
    }
    
    .feature-card {
      height: 100%;
      text-align: center;
      padding: $spacing-unit * 3;
      transition: transform 0.3s;
      border: none;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      
      &:hover {
        transform: translateY(-10px);
      }
      
      .feature-icon {
        width: 80px;
        height: 80px;
        margin: 0 auto $spacing-unit * 2;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .el-icon {
          font-size: 36px;
          color: white;
        }
      }
      
      h3 {
        font-size: 1.5rem;
        color: $text-color;
        margin-bottom: $spacing-unit;
      }
      
      p {
        color: #666;
        line-height: 1.6;
      }
    }
  }
  
  .letter-showcase {
    padding: $spacing-unit * 6 $spacing-unit * 4;
    background: linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
    
    h2 {
      text-align: center;
      font-size: 2.5rem;
      color: $text-color;
      margin-bottom: $spacing-unit * 4;
    }
    
    .letter-card {
      height: 100%;
      padding: $spacing-unit * 3;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
      position: relative;
      overflow: hidden;
      
      .letter-stamp {
        position: absolute;
        top: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background: $primary-color;
        opacity: 0.1;
        border-radius: 50%;
      }
      
      .letter-content {
        height: 100%;
        display: flex;
        flex-direction: column;
        
        h3 {
          font-size: 1.8rem;
          color: $text-color;
          margin-bottom: $spacing-unit * 2;
        }
        
        p {
          flex: 1;
          font-size: 1.1rem;
          color: #666;
          line-height: 1.8;
          margin-bottom: $spacing-unit * 2;
        }
        
        .letter-meta {
          display: flex;
          justify-content: space-between;
          color: #999;
          font-size: 0.9rem;
        }
      }
    }
  }
  
  .cta-section {
    padding: $spacing-unit * 8 $spacing-unit * 4;
    background: linear-gradient(135deg, $primary-color 0%, darken($primary-color, 15%) 100%);
    text-align: center;
    
    .cta-content {
      max-width: 600px;
      margin: 0 auto;
      
      h2 {
        font-size: 2.5rem;
        color: white;
        margin-bottom: $spacing-unit * 2;
      }
      
      p {
        font-size: 1.2rem;
        color: rgba(255, 255, 255, 0.9);
        margin-bottom: $spacing-unit * 4;
      }
      
      .cta-buttons {
        display: flex;
        justify-content: center;
        gap: $spacing-unit * 2;
        
        .el-button {
          padding: $spacing-unit * 2 $spacing-unit * 4;
          font-size: 1.1rem;
        }
      }
    }
  }
}
</style> 