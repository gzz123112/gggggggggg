import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import WriteLetterView from '../views/WriteLetterView.vue'
import MyView from '../views/MyView.vue'
import AdminView from '../views/AdminView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView
    },
    {
      path: '/write',
      name: 'write',
      component: WriteLetterView
    },
    {
      path: '/my',
      name: 'my',
      component: MyView,
      alias: ['/my/', '/my/index']
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView
    },
    {
      path: '/drafts',
      name: 'drafts',
      component: () => import('../views/DraftsView.vue')
    },
    {
      path: '/forget-password',
      name: 'forget-password',
      component: () => import('../views/ForgetPasswordView.vue')
    },
    {
      path: '/guest',
      name: 'guest',
      component: () => import('../views/GuestView.vue')
    },
    {
      path: '/mailbox',
      name: 'mailbox',
      component: () => import('../views/MailboxView.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: {
        title: '关于我们'
      }
    }
  ]
})

// 添加路由调试
router.beforeEach((to, from, next) => {
  console.log('路由跳转:', { from: from.path, to: to.path })
  next()
})

export default router 