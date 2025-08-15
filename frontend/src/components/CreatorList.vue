<template>
  <div class="creator-list">
    <!-- 筛选条件 -->
    <el-card class="filter-container">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :shortcuts="dateShortcuts"
          />
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="filterForm.tag" placeholder="请选择标签">
            <el-option label="科技" value="tech" />
            <el-option label="生活" value="life" />
            <el-option label="娱乐" value="entertainment" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词搜索">
          <el-input v-model="filterForm.keyword" placeholder="请输入关键词" />
        </el-form-item>
        <el-form-item label="地区">
          <el-select v-model="filterForm.region" placeholder="请选择地区">
            <el-option label="北京" value="beijing" />
            <el-option label="上海" value="shanghai" />
            <el-option label="广州" value="guangzhou" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 创作者列表 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>创作者列表</span>
        </div>
      </template>

      <el-table
        :data="tableData"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="创作者信息" min-width="250">
          <template #default="scope">
            <div class="creator-info">
              <el-avatar :size="50" :src="scope.row.avatar" />
              <div class="creator-detail">
                <div class="creator-name">{{ scope.row.name }}</div>
                <div class="creator-id">ID: {{ scope.row.id }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="registerTime" label="注册时间" width="160" />
        <el-table-column prop="region" label="地区" width="120" />
        <el-table-column label="属性信息" min-width="200">
          <template #default="scope">
            <div class="attribute-info">
              <el-tag 
                v-for="tag in scope.row.attributes" 
                :key="tag"
                size="small"
                class="attribute-tag"
              >
                {{ tag }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="发布数据" min-width="200">
          <template #default="scope">
            <div class="publish-data">
              <div class="data-item">
                <span class="label">内容量：</span>
                <span class="value">{{ scope.row.contentCount }}</span>
              </div>
              <div class="data-item">
                <span class="label">字数：</span>
                <span class="value">{{ scope.row.wordCount }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="互动数据" min-width="200">
          <template #default="scope">
            <div class="interaction-data">
              <div class="data-item">
                <span class="label">点赞：</span>
                <span class="value">{{ scope.row.likes }}</span>
              </div>
              <div class="data-item">
                <span class="label">评论：</span>
                <span class="value">{{ scope.row.comments }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleView(scope.row)">查看</el-button>
            <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { CreatorItem, DateShortcut } from '@/types'

const filterForm = ref({
  dateRange: '',
  tag: '',
  keyword: '',
  region: ''
})

const loading = ref<boolean>(false)
const currentPage = ref<number>(1)
const pageSize = ref<number>(10)
const total = ref<number>(0)

// 模拟数据
const tableData = ref<CreatorItem[]>([
  {
    id: '10001',
    name: '创作者1',
    avatar: 'https://placeholder.com/150x150',
    registerTime: '2023-12-01 10:00:00',
    region: '北京',
    attributes: ['科技', '互联网', '人工智能'],
    contentCount: 156,
    wordCount: '125.5k',
    likes: '12.3k',
    comments: '1.2k'
  },
  {
    id: '10002',
    name: '创作者2',
    avatar: 'https://placeholder.com/150x150',
    registerTime: '2023-12-02 14:30:00',
    region: '上海',
    attributes: ['生活', '美食', '旅行'],
    contentCount: 89,
    wordCount: '78.2k',
    likes: '8.9k',
    comments: '956'
  }
])

const dateShortcuts: DateShortcut[] = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  }
]

// 事件处理函数
const handleSearch = (): void => {
  console.log('搜索条件：', filterForm.value)
}

const resetForm = (): void => {
  filterForm.value = {
    dateRange: '',
    tag: '',
    keyword: '',
    region: ''
  }
}

const handleView = (row: CreatorItem): void => {
  console.log('查看创作者：', row)
}

const handleEdit = (row: CreatorItem): void => {
  console.log('编辑创作者：', row)
}

const handleDelete = async (row: CreatorItem): Promise<void> => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该创作者吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    console.log('删除创作者：', row)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}

const handleSizeChange = (val: number): void => {
  pageSize.value = val
}

const handleCurrentChange = (val: number): void => {
  currentPage.value = val
}
</script>

<style scoped>
.creator-list {
  padding: 20px;
}

.filter-container {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.creator-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.creator-detail {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.creator-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.creator-id {
  font-size: 13px;
  color: #909399;
}

.attribute-info {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.attribute-tag {
  margin-right: 5px;
}

.data-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.data-item:last-child {
  margin-bottom: 0;
}

.data-item .label {
  color: #909399;
  margin-right: 5px;
}

.data-item .value {
  color: #303133;
  font-weight: 500;
}

.publish-data,
.interaction-data {
  display: flex;
  flex-direction: column;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .creator-list {
    padding: 10px;
  }

  .creator-info {
    gap: 10px;
  }

  .data-item {
    font-size: 13px;
  }

  .creator-name {
    font-size: 14px;
  }

  .creator-id {
    font-size: 12px;
  }
}
</style>
