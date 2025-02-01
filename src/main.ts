import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router'
import App from './App.vue'
import 'element-plus/dist/index.css'
import '@wangeditor/editor/dist/css/style.css'
import 'animate.css'
import '@/assets/styles/main.scss'
import './styles/dark-theme.scss'
import { useTheme } from './composables/useTheme'

// 开发环境下使用 mock
if (import.meta.env.DEV) {
  await import('../mock/mock')
}

const app = createApp(App)
const pinia = createPinia()

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 初始化主题
const { themeSettings } = useTheme()

app.mount('#app') 