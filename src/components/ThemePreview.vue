<template>
  <div class="theme-preview">
    <div class="theme-grid">
      <div
        v-for="(theme, name) in themes"
        :key="name"
        class="theme-item"
        :class="{ active: currentTheme === name }"
        @click="selectTheme(name)"
      >
        <div class="theme-colors">
          <div 
            v-for="(color, key) in theme"
            :key="key"
            class="color-block"
            :style="{ backgroundColor: color }"
            :title="`${key}: ${color}`"
          />
        </div>
        <div class="theme-name">{{ getThemeName(name) }}</div>
        <div class="theme-preview-content" :style="getPreviewStyle(theme)">
          <div class="preview-header">
            <div class="preview-title">预览效果</div>
            <div class="preview-button" />
          </div>
          <div class="preview-body">
            <div class="preview-text" />
            <div class="preview-text" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { themes, applyTheme } = useTheme()
const currentTheme = ref(Object.keys(themes)[0])

const themeNames = {
  default: '默认主题',
  warm: '暖色主题',
  cool: '冷色主题',
  forest: '森林主题',
  ocean: '海洋主题',
  purple: '紫色主题'
}

const getThemeName = (name: string) => {
  return themeNames[name as keyof typeof themeNames] || name
}

const getPreviewStyle = (theme: Record<string, string>) => ({
  '--preview-primary': theme.primary,
  '--preview-secondary': theme.secondary,
  '--preview-text': theme.info
})

const selectTheme = (name: keyof typeof themes) => {
  currentTheme.value = name
  applyTheme(name)
}
</script>

<style lang="scss" scoped>
.theme-preview {
  .theme-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: $spacing-unit * 2;
  }

  .theme-item {
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;
    padding: $spacing-unit * 2;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &.active {
      border-color: var(--el-color-primary);
      box-shadow: 0 0 0 2px var(--el-color-primary-light-5);
    }
  }

  .theme-colors {
    display: flex;
    gap: 4px;
    margin-bottom: $spacing-unit;

    .color-block {
      width: 24px;
      height: 24px;
      border-radius: 4px;
    }
  }

  .theme-name {
    font-size: 0.9rem;
    margin-bottom: $spacing-unit;
    color: var(--el-text-color-regular);
  }

  .theme-preview-content {
    background: var(--preview-primary);
    border-radius: 4px;
    padding: $spacing-unit;
    
    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: $spacing-unit;

      .preview-title {
        color: white;
        font-size: 0.8rem;
      }

      .preview-button {
        width: 40px;
        height: 16px;
        background: var(--preview-secondary);
        border-radius: 4px;
      }
    }

    .preview-body {
      .preview-text {
        height: 8px;
        background: var(--preview-secondary);
        border-radius: 4px;
        margin-bottom: 6px;
        opacity: 0.8;

        &:last-child {
          width: 60%;
        }
      }
    }
  }
}
</style> 