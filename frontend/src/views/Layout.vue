<template>
  <el-container class="layout-container">
    <el-aside width="260px" class="sidebar">
      <div class="logo">运营管理后台</div>
      <el-menu
        :default-active="currentRoute"
        class="sidebar-menu"
        :background-color="'transparent'"
        text-color="#B4B7BD"
        active-text-color="#ffffff"
        @select="handleSelect"
      >
        <!-- 流量监控 -->
        <el-sub-menu index="1">
          <template #title>
            <el-icon><Histogram /></el-icon>
            <span>流量监控</span>
          </template>
          <el-menu-item index="data-overview">
            <el-icon><Odometer /></el-icon>
            <span>全局数据动态</span>
          </el-menu-item>
          <el-menu-item index="trend-analysis">
            <el-icon><Histogram /></el-icon>
            <span>推荐/搜索热度趋势</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 内容管理 -->
        <el-sub-menu index="2">
          <template #title>
            <el-icon><Folder /></el-icon>
            <span>内容管理</span>
          </template>
          <el-menu-item index="content-list">
            <el-icon><Document /></el-icon>
            <span>内容列表/榜单</span>
          </el-menu-item>
          <el-menu-item index="content-detail-query">
            <el-icon><Search /></el-icon>
            <span>单个内容明细查询</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 创作者管理 -->
        <el-sub-menu index="3">
          <template #title>
            <el-icon><User /></el-icon>
            <span>创作者管理</span>
          </template>
          <el-menu-item index="creator-list">
            <el-icon><User /></el-icon>
            <span>创作者列表</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 系统管理 -->
        <el-sub-menu index="5">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="user-management">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header class="header">
        <div class="header-content">
          <div class="breadcrumb">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item>首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ currentRouteName }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="user-info">
            <el-dropdown @command="handleCommand">
              <span class="user-dropdown">
                <el-avatar v-if="userInfo.avatar" :size="32" :src="userInfo.avatar" />
                <el-avatar v-else :size="32" :icon="UserFilled" />
                <span class="username">{{ userInfo.name || '未知用户' }}</span>
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>
                    <span class="phone-info">{{ userInfo.phone }}</span>
                  </el-dropdown-item>
                  <el-dropdown-item divided command="profile">个人信息</el-dropdown-item>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>
      
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Histogram, Odometer, Folder, Document, Search, User, Setting,
  UserFilled, ArrowDown
} from '@element-plus/icons-vue'
import { getUserProfile, logout } from '@/api/auth'
import type { UserInfo } from '@/types'

const router = useRouter()
const route = useRoute()

const userInfo = ref<UserInfo>({})

// 路由名称映射
const routeNames: Record<string, string> = {
  'data-overview': '全局数据动态',
  'trend-analysis': '推荐/搜索热度趋势',
  'content-list': '内容列表/榜单',
  'content-detail-query': '单个内容明细查询',
  'creator-list': '创作者列表',
  'user-management': '用户管理'
}

const currentRoute = computed(() => route.name as string)
const currentRouteName = computed(() => routeNames[currentRoute.value] || '')

const handleSelect = (index: string) => {
  router.push(`/${index}`)
}

const handleCommand = async (command: string) => {
  if (command === 'logout') {
    await handleLogout()
  } else if (command === 'profile') {
    showProfile()
  }
}

const handleLogout = async () => {
  try {
    await logout()
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    ElMessage.success('退出成功')
    router.push('/login')
  } catch (error) {
    console.error('退出失败:', error)
    // 即使API失败也清除本地数据
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    router.push('/login')
  }
}

const showProfile = () => {
  const info = userInfo.value
  const content = `
    <div style="text-align: left;">
      <p><strong>手机号：</strong>${info.phone}</p>
      <p><strong>用户名：</strong>${info.name || '未设置'}</p>
      <p><strong>性别：</strong>${info.gender === 1 ? '男' : info.gender === 2 ? '女' : '未设置'}</p>
      <p><strong>年龄：</strong>${info.age || '未设置'}</p>
      <p><strong>地址：</strong>${info.address || '未设置'}</p>
      <p><strong>简介：</strong>${info.overview || '未设置'}</p>
    </div>
  `
  
  ElMessageBox.alert(content, '个人信息', {
    dangerouslyUseHTMLString: true,
    confirmButtonText: '确定'
  })
}

const fetchUserInfo = async () => {
  try {
    const response = await getUserProfile()
    if (response.status) {
      userInfo.value = response.data
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    } else {
      console.error('获取用户信息失败:', response.error)
      if (response.error?.includes('401') || response.error?.includes('Unauthorized')) {
        ElMessage.error('登录已过期，请重新登录')
        router.push('/login')
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background: linear-gradient(180deg, #2F4056 0%, #1E293B 100%);
  color: #ffffff;
  box-shadow: 0 0 15px rgba(0,0,0,0.1);
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  color: #ffffff;
  background: rgba(255,255,255,0.05);
  margin-bottom: 1px;
  letter-spacing: 1px;
}

.sidebar-menu {
  border-right: none !important;
  background: transparent !important;
}

.sidebar-menu .el-menu-item,
.sidebar-menu .el-sub-menu__title {
  color: #B4B7BD !important;
  height: 50px;
  line-height: 50px;
  transition: all 0.3s ease;
  font-size: 14px;
  padding-left: 20px !important;
}

.sidebar-menu .el-menu-item:hover,
.sidebar-menu .el-sub-menu__title:hover {
  background: rgba(255,255,255,0.1) !important;
  color: #ffffff !important;
}

.sidebar-menu .el-menu-item.is-active {
  background: #2B85E4 !important;
  color: #ffffff !important;
  position: relative;
}

.sidebar-menu .el-menu-item.is-active::before {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: #2472c8;
}

.sidebar-menu .el-sub-menu.is-active .el-sub-menu__title {
  color: #2B85E4 !important;
}

.sidebar-menu .el-menu--inline {
  background: rgba(0,0,0,0.1) !important;
}

.sidebar-menu .el-menu--inline .el-menu-item {
  padding-left: 55px !important;
}

.header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  padding: 0 20px;
  height: 50px !important;
  line-height: 50px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.breadcrumb {
  font-size: 14px;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-dropdown {
  cursor: pointer;
  color: #303133;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.username {
  margin: 0 10px;
}

.phone-info {
  color: #909399;
  font-size: 12px;
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  height: calc(100vh - 50px);
  overflow-y: auto;
}
</style>
