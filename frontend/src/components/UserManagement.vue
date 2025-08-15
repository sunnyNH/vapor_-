<template>
  <div class="user-management">
    <div class="page-header">
      <el-row :gutter="20" type="flex" justify="space-between" align="middle">
        <el-col :span="16">
          <el-form :inline="true" :model="searchForm" class="search-form">
            <el-form-item label="手机号">
              <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable />
            </el-form-item>
            <el-form-item label="用户名">
              <el-input v-model="searchForm.name" placeholder="请输入用户名" clearable />
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
                <el-option label="启用" value="1" />
                <el-option label="禁用" value="0" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="8" style="text-align: right;">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新增用户
          </el-button>
        </el-col>
      </el-row>
    </div>

    <el-table :data="tableData" style="width: 100%; margin-top: 20px;" v-loading="loading">
      <el-table-column prop="name" label="用户名" min-width="120" />
      <el-table-column prop="phone" label="手机号" min-width="120" />
      <el-table-column prop="roleName" label="角色" min-width="120" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="scope">
          <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="primary" link @click="handlePermissions(scope.row)">权限设置</el-button>
          <el-button :type="scope.row.status === 1 ? 'danger' : 'success'" link 
            @click="handleStatusChange(scope.row)">
            {{ scope.row.status === 1 ? '禁用' : '启用' }}
          </el-button>
          <el-button type="primary" link @click="handleResetPassword(scope.row)">重置密码</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 用户表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
      width="500px">
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="100px">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="用户名" prop="name">
          <el-input v-model="userForm.name" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="角色">
          <el-radio-group v-model="userForm.roleType">
            <el-radio :label="1">超级管理员</el-radio>
            <el-radio :label="2">普通管理员</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

// 响应式数据
const searchForm = reactive({
  phone: '',
  name: '',
  status: ''
})

const tableData = ref<any[]>([])
const loading = ref<boolean>(false)
const currentPage = ref<number>(1)
const pageSize = ref<number>(10)
const total = ref<number>(0)

const dialogVisible = ref<boolean>(false)
const dialogType = ref<'add' | 'edit'>('add')
const userFormRef = ref<FormInstance>()

const userForm = reactive({
  phone: '',
  name: '',
  password: '',
  roleType: 2
})

const userRules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ]
}

// 获取用户列表
const fetchUserList = async (): Promise<void> => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    tableData.value = [
      {
        id: 1,
        name: '张三',
        phone: '13800138000',
        roleType: 1,
        roleName: '超级管理员',
        status: 1
      },
      {
        id: 2,
        name: '李四',
        phone: '13800138001',
        roleType: 2,
        roleName: '普通管理员',
        status: 1
      }
    ]
    total.value = 2
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 事件处理函数
const handleSearch = (): void => {
  currentPage.value = 1
  fetchUserList()
}

const resetSearch = (): void => {
  searchForm.phone = ''
  searchForm.name = ''
  searchForm.status = ''
  handleSearch()
}

const handleAdd = (): void => {
  dialogType.value = 'add'
  Object.assign(userForm, {
    phone: '',
    name: '',
    password: '',
    roleType: 2
  })
  dialogVisible.value = true
}

const handleEdit = (row: any): void => {
  dialogType.value = 'edit'
  Object.assign(userForm, {
    id: row.id,
    phone: row.phone,
    name: row.name,
    roleType: row.roleType
  })
  dialogVisible.value = true
}

const handlePermissions = async (row: any): Promise<void> => {
  if (row.roleType === 1) {
    ElMessage.warning('超级管理员默认拥有所有权限，无需设置')
    return
  }
  ElMessage.info('权限设置功能开发中...')
}

const handleResetPassword = async (row: any): Promise<void> => {
  try {
    await ElMessageBox.confirm(
      '确定要重置该用户的密码吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await new Promise(resolve => setTimeout(resolve, 300))
    ElMessage.success('密码重置成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重置密码失败:', error)
      ElMessage.error('重置密码失败')
    }
  }
}

const submitForm = async (): Promise<void> => {
  if (!userFormRef.value) return
  
  try {
    const valid = await userFormRef.value.validate()
    if (!valid) return
    
    await new Promise(resolve => setTimeout(resolve, 300))
    ElMessage.success(dialogType.value === 'add' ? '添加成功' : '编辑成功')
    dialogVisible.value = false
    fetchUserList()
  } catch (error) {
    console.error('提交表单失败:', error)
    ElMessage.error('操作失败')
  }
}

const handleSizeChange = (val: number): void => {
  pageSize.value = val
  fetchUserList()
}

const handleCurrentChange = (val: number): void => {
  currentPage.value = val
  fetchUserList()
}

const handleStatusChange = async (row: any): Promise<void> => {
  try {
    const action = row.status === 1 ? '禁用' : '启用'
    await ElMessageBox.confirm(
      `确定要${action}该用户吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await new Promise(resolve => setTimeout(resolve, 300))
    ElMessage.success(`${action}成功`)
    row.status = row.status === 1 ? 0 : 1
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更改用户状态失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

onMounted(() => {
  fetchUserList()
})
</script>

<style scoped>
.user-management {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
