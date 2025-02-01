<template>
  <div class="notification-center">
    <el-popover
      placement="bottom-end"
      :width="320"
      trigger="click"
      popper-class="notification-popover"
    >
      <template #reference>
        <el-badge :value="notifications.length" :hidden="!notifications.length">
          <el-button circle>
            <el-icon><Bell /></el-icon>
          </el-button>
        </el-badge>
      </template>

      <div class="notification-header">
        <h3>通知中心</h3>
        <el-button 
          text 
          type="primary"
          @click="clearNotifications"
          v-if="notifications.length"
        >
          清空
        </el-button>
      </div>

      <el-scrollbar height="400px">
        <template v-if="notifications.length">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-item"
            :class="[`notification-${notification.type}`]"
          >
            <div class="notification-content">
              <h4>{{ notification.title }}</h4>
              <p>{{ notification.message }}</p>
              <span class="notification-time">
                {{ formatTime(notification.timestamp) }}
              </span>
            </div>
            <el-button
              circle
              text
              class="notification-close"
              @click="removeNotification(notification.id)"
            >
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </template>
        <div v-else class="notification-empty">
          <el-empty description="暂无通知" />
        </div>
      </el-scrollbar>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { Bell, Close } from '@element-plus/icons-vue'
import { useNotification } from '@/composables/useNotification'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

const { 
  notifications,
  clearNotifications,
  removeNotification
} = useNotification()

const formatTime = (timestamp: number) => {
  return dayjs(timestamp).fromNow()
}
</script>

<style lang="scss" scoped>
.notification-center {
  .notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-unit $spacing-unit * 2;
    border-bottom: 1px solid #eee;
    
    h3 {
      margin: 0;
      font-size: 1rem;
    }
  }
  
  .notification-item {
    padding: $spacing-unit * 2;
    border-bottom: 1px solid #eee;
    display: flex;
    align-items: flex-start;
    
    &:hover {
      background: #f8f9fa;
      
      .notification-close {
        opacity: 1;
      }
    }
    
    .notification-content {
      flex: 1;
      
      h4 {
        margin: 0 0 $spacing-unit;
        font-size: 0.9rem;
      }
      
      p {
        margin: 0;
        font-size: 0.85rem;
        color: #666;
      }
      
      .notification-time {
        font-size: 0.8rem;
        color: #999;
        margin-top: $spacing-unit;
        display: block;
      }
    }
    
    .notification-close {
      opacity: 0;
      transition: opacity 0.2s;
    }
  }
  
  .notification-empty {
    padding: $spacing-unit * 4;
  }
}

.notification-success {
  border-left: 3px solid var(--el-color-success);
}

.notification-warning {
  border-left: 3px solid var(--el-color-warning);
}

.notification-info {
  border-left: 3px solid var(--el-color-info);
}

.notification-error {
  border-left: 3px solid var(--el-color-danger);
}
</style> 