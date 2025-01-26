import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './mock'

const app = createApp(App)

app.use(ElementPlus)
app.use(router)

// 添加全局错误处理
app.config.errorHandler = (err) => {
  console.error('应用错误:', err)
}

app.mount('#app')
