import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: {
          title: '时光信笺',
          requiresAuth: true
        }
      },
      {
        path: 'write',
        name: 'WriteLetter',
        component: () => import('@/views/WriteLetter.vue'),
        meta: {
          title: '写信',
          requiresAuth: true
        }
      },
      {
        path: 'letters',
        name: 'Letters',
        component: () => import('@/views/Letters.vue'),
        meta: {
          title: '我的信件',
          requiresAuth: true
        }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/user/Profile.vue'),
        meta: {
          title: '个人资料',
          requiresAuth: true
        }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/user/Settings.vue'),
        meta: {
          title: '设置',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/auth/Login.vue'),
        meta: { title: '用户登录' }
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/views/auth/Register.vue'),
        meta: { title: '用户注册' }
      }
    ]
  },
  {
    path: '/admin-login',
    name: 'AdminLogin',
    component: () => import('@/views/admin/Login.vue'),
    meta: { title: '管理员登录' }
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAdmin: true },
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: { title: '系统概览' }
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('@/views/admin/UserManagement.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'content-review',
        name: 'ContentReview',
        component: () => import('@/views/admin/ContentReview.vue'),
        meta: { title: '内容审核' }
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/views/admin/Reports.vue'),
        meta: { title: '举报处理' }
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('@/views/admin/Statistics.vue'),
        meta: { title: '数据统计' }
      },
      {
        path: 'system',
        name: 'SystemMonitor',
        component: () => import('@/views/admin/SystemMonitor.vue'),
        meta: { title: '系统监控' }
      }
    ]
  },
  {
    path: '/guest',
    component: () => import('@/views/GuestHome.vue'),
    meta: { title: '欢迎体验' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  document.title = `${to.meta.title} - 时光信笺`

  // 检查是否需要管理员权限
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    if (!userStore.isAdmin) {
      ElMessage.warning('请使用管理员账号登录')
      next('/admin-login')
      return
    }
  }
  
  // 检查是否需要普通用户权限
  if (to.meta.requiresAuth && !userStore.token) {
    ElMessage.warning('请先登录')
    next('/login')
    return
  }

  // 如果是管理员，访问普通用户页面时重定向到管理员仪表盘
  if (userStore.isAdmin && to.path === '/') {
    next('/admin/dashboard')
    return
  }

  next()
})

export default router 