import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 懒加载组件
const Login = () => import('@/views/Login.vue')
const Layout = () => import('@/views/Layout.vue')
const DataOverview = () => import('@/components/DataOverview.vue')
const TrendAnalysis = () => import('@/components/TrendAnalysis.vue')
const ContentList = () => import('@/components/ContentList.vue')
const ContentDetailQuery = () => import('@/components/ContentDetailQuery.vue')
const CreatorList = () => import('@/components/CreatorList.vue')
const UserManagement = () => import('@/components/UserManagement.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/data-overview',
    children: [
      {
        path: 'data-overview',
        name: 'DataOverview',
        component: DataOverview,
        meta: { title: '全局数据动态' }
      },
      {
        path: 'trend-analysis',
        name: 'TrendAnalysis',
        component: TrendAnalysis,
        meta: { title: '推荐/搜索热度趋势' }
      },
      {
        path: 'content-list',
        name: 'ContentList',
        component: ContentList,
        meta: { title: '内容列表/榜单' }
      },
      {
        path: 'content-detail-query',
        name: 'ContentDetailQuery',
        component: ContentDetailQuery,
        meta: { title: '单个内容明细查询' }
      },
      {
        path: 'creator-list',
        name: 'CreatorList',
        component: CreatorList,
        meta: { title: '创作者列表' }
      },
      {
        path: 'user-management',
        name: 'UserManagement',
        component: UserManagement,
        meta: { title: '用户管理' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.path === '/login') {
    if (token) {
      next('/')
    } else {
      next()
    }
  } else {
    if (token) {
      next()
    } else {
      next('/login')
    }
  }
})

export default router
