<template>
  <div class="login-container">
    <div class="login-form">
      <div class="login-header">
        <h2>后台管理系统</h2>
        <p class="text-muted">请登录您的账号</p>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="phone">
          <el-input
            v-model="loginForm.phone"
            placeholder="手机号"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="loginForm.rememberMe">
            记住手机号
          </el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            style="width: 100%"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { login } from '@/api/auth'
import type { ApiResponse } from '@/types'

const router = useRouter()
const loginFormRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive({
  phone: '',
  password: '',
  rememberMe: false
})

const loginRules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return
    
    loading.value = true
    
    const response: ApiResponse<string> = await login({
      phone: loginForm.phone,
      password: loginForm.password
    })
    
    if (response.status) {
      // 保存 token
      localStorage.setItem('token', response.data)
      
      // 记住手机号
      if (loginForm.rememberMe) {
        localStorage.setItem('phone', loginForm.phone)
      } else {
        localStorage.removeItem('phone')
      }
      
      ElMessage.success('登录成功')
      router.push('/')
    } else {
      ElMessage.error(response.error || response.reason || '登录失败')
    }
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 如果记住了手机号，自动填充
  const savedPhone = localStorage.getItem('phone')
  if (savedPhone) {
    loginForm.phone = savedPhone
    loginForm.rememberMe = true
  }
})
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(120deg, #3498db, #2c3e50);
}

.login-form {
  background: white;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  margin: auto;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h2 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.text-muted {
  color: #6c757d;
  margin: 0;
}

.el-form-item {
  margin-bottom: 1.5rem;
}

.el-form-item:last-child {
  margin-bottom: 0;
}
</style>
