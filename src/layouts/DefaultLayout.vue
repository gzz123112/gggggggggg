<template>
  <div class="default-layout">
    <el-header class="layout-header">
      <div class="header-content">
        <div class="logo" @click="router.push('/')">
          <div class="logo-icon">
            <!-- 使用内联 SVG -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="32" height="32">
              <circle cx="50" cy="50" r="45" fill="#f5b682"/>
              <path d="M30 50 L45 65 L70 35" stroke="white" stroke-width="8" fill="none"/>
            </svg>
          </div>
          <span>时光信笺</span>
        </div>
        
        <el-menu 
          mode="horizontal" 
          :router="true"
          :default-active="route.path"
        >
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/write">写信</el-menu-item>
          <el-menu-item index="/letters">我的信件</el-menu-item>
        </el-menu>
        
        <div class="user-actions">
          <NotificationCenter />
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-avatar">
              <el-avatar :src="userStore.currentUser?.avatar" />
              <span>{{ userStore.currentUser?.username }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item command="settings">设置</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>
    
    <el-main class="layout-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </el-main>
    
    <el-footer class="layout-footer">
      <p>© 2024 时光信笺. All rights reserved.</p>
    </el-footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import NotificationCenter from '@/components/NotificationCenter.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const handleCommand = (command: string) => {
  switch (command) {
    case 'logout':
      userStore.logout()
      router.push('/login')
      break
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
  }
}
</script>

<style lang="scss" scoped>
.default-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  
  .layout-header {
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    position: fixed;
    width: 100%;
    z-index: 100;
    
    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      .logo {
        display: flex;
        align-items: center;
        cursor: pointer;
        
        .logo-icon {
          margin-right: $spacing-unit;
          width: 32px;
          height: 32px;
        }
        
        span {
          font-family: $font-family-decorative;
          font-size: 1.5rem;
          color: $text-color;
        }
      }
      
      .user-actions {
        display: flex;
        align-items: center;
        gap: $spacing-unit * 2;
        
        .user-avatar {
          display: flex;
          align-items: center;
          cursor: pointer;
          
          span {
            margin-left: $spacing-unit;
            color: $text-color;
          }
        }
      }
    }
  }
  
  .layout-main {
    margin-top: 60px;
    flex: 1;
    background: $background-color;
    padding: $container-padding;
  }
  
  .layout-footer {
    background: white;
    text-align: center;
    padding: $spacing-unit * 2;
    color: #666;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 