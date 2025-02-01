<template>
  <div class="home">
    <div class="welcome-section">
      <h1 class="title">时光信笺</h1>
      <p class="subtitle">写一封信给未来的自己</p>
      <el-button 
        type="primary" 
        size="large" 
        @click="router.push('/write')"
        class="start-button"
      >
        开始写信
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped lang="scss">
.home {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $background-color, $secondary-color);
  
  .welcome-section {
    text-align: center;
    padding: $spacing-unit * 4;
    
    .title {
      font-family: $font-family-decorative;
      font-size: 3rem;
      color: $text-color;
      margin-bottom: $spacing-unit * 2;
    }
    
    .subtitle {
      font-size: 1.2rem;
      color: $text-color;
      margin-bottom: $spacing-unit * 4;
    }
    
    .start-button {
      background-color: $primary-color;
      border: none;
      padding: $spacing-unit * 2 $spacing-unit * 4;
      
      &:hover {
        background-color: darken($primary-color, 10%);
      }
    }
  }
}
</style> 