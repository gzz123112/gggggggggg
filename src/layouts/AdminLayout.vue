<template>
  <div class="admin-layout">
    <el-container>
      <el-aside width="200px">
        <div class="admin-sidebar">
          <div class="logo">
            <h1>管理后台</h1>
          </div>
          
          <el-menu
            :default-active="route.path"
            :router="true"
            class="admin-menu"
          >
            <el-menu-item index="/admin/dashboard">
              <el-icon><DataLine /></el-icon>
              <span>系统概览</span>
            </el-menu-item>
            
            <el-menu-item index="/admin/users">
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </el-menu-item>
            
            <el-menu-item index="/admin/content-review">
              <el-icon><Document /></el-icon>
              <span>内容审核</span>
            </el-menu-item>
            
            <el-menu-item index="/admin/reports">
              <el-icon><Warning /></el-icon>
              <span>举报处理</span>
            </el-menu-item>

            <el-menu-item index="/admin/statistics">
              <el-icon><PieChart /></el-icon>
              <span>数据统计</span>
            </el-menu-item>
            
            <el-menu-item index="/admin/system">
              <el-icon><Monitor /></el-icon>
              <span>系统监控</span>
            </el-menu-item>
          </el-menu>
        </div>
      </el-aside>
      
      <el-container>
        <el-header height="60px">
          <div class="header-content">
            <el-breadcrumb>
              <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
            </el-breadcrumb>
            
            <el-button type="danger" @click="handleLogout">安全退出</el-button>
          </div>
        </el-header>
        
        <el-main>
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { DataLine, User, Document, Warning, Monitor, PieChart } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      type: 'warning'
    })
    userStore.logout()
    router.push('/admin/login')
    ElMessage.success('已退出登录')
  } catch {
    // 用户取消操作
  }
}
</script>

<style lang="scss" scoped>
.admin-layout {
  min-height: 100vh;
  
  .admin-sidebar {
    height: 100vh;
    background: #304156;
    color: white;
    
    .logo {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      
      h1 {
        margin: 0;
        font-size: 1.2rem;
        color: white;
      }
    }
    
    .admin-menu {
      border-right: none;
      background: transparent;
      
      :deep(.el-menu-item) {
        color: #bfcbd9;
        
        &:hover {
          color: white;
          background: #263445;
        }
        
        &.is-active {
          color: white;
          background: #1890ff;
        }
        
        .el-icon {
          color: inherit;
        }
      }
    }
  }
  
  .admin-header {
    background: white;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    
    .header-content {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      .admin-avatar {
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
  
  .admin-main {
    background: #f0f2f5;
    padding: $spacing-unit * 3;
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