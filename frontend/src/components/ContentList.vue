<template>
  <div class="content-list">
    <!-- 筛选条件 -->
    <el-card class="filter-container">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="时间周期">
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
        <el-form-item label="内容类型">
          <el-select v-model="filterForm.contentType" placeholder="请选择内容类型">
            <el-option label="文章" value="article" />
            <el-option label="视频" value="video" />
            <el-option label="图片" value="image" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 内容列表 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>内容列表</span>
          <div class="header-right">
            <el-button type="primary" @click="handleBatchAdd">一键内容池添加操作</el-button>
            <el-button type="success" @click="handleBatchDistribute">批量分发</el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="tableData"
        style="width: 100%"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="标题" min-width="300">
          <template #default="scope">
            <div class="content-title">
              <el-image
                :src="scope.row.cover"
                :preview-src-list="[scope.row.cover]"
                fit="cover"
                class="content-image"
                @error="handleImageError($event, scope.row)"
              />
              <div class="title-info">
                <div class="main-title">{{ scope.row.title }}</div>
                <div class="sub-info">
                  <span>创作者：{{ scope.row.creator }}</span>
                  <span>发布时间：{{ scope.row.publishTime }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="标签" width="150">
          <template #default="scope">
            <el-tag
              v-for="tag in scope.row.tags"
              :key="tag"
              size="small"
              class="tag-item"
            >
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="contentType" label="内容类型" width="100" />
        <el-table-column label="流量状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.flowStatus === '上升' ? 'success' : 'danger'">
              {{ scope.row.flowStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="内容状态变化" width="200">
          <template #default="scope">
            <div class="mini-chart" :ref="el => setChartRef(el, scope.row.id)"></div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
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

    <!-- 批量分发对话框 -->
    <el-dialog
      v-model="distributeDialogVisible"
      title="批量分发"
      width="40%"
    >
      <el-form :model="distributeForm" label-width="100px">
        <el-form-item label="分发渠道">
          <el-checkbox-group v-model="distributeForm.channels">
            <el-checkbox label="web">Web端</el-checkbox>
            <el-checkbox label="app">App端</el-checkbox>
            <el-checkbox label="wechat">微信小程序</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="分发时间">
          <el-date-picker
            v-model="distributeForm.time"
            type="datetime"
            placeholder="选择分发时间"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="distributeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleDistribute">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import type { ContentItem, FilterForm, DistributeForm, DateShortcut } from '@/types'

// 响应式数据
const filterForm = ref<FilterForm>({
  dateRange: '',
  tag: '',
  contentType: ''
})

const loading = ref<boolean>(false)
const currentPage = ref<number>(1)
const pageSize = ref<number>(10)
const total = ref<number>(300)
const distributeDialogVisible = ref<boolean>(false)
const selectedRows = ref<ContentItem[]>([])

const distributeForm = ref<DistributeForm>({
  channels: [],
  time: ''
})

// 图表实例存储
const chartRefs = new Map<number, HTMLElement>()
const chartInstances = new Map<number, echarts.ECharts>()

// 模拟数据
const tableData = ref<ContentItem[]>([
  {
    id: 1,
    title: '人工智能技术在现代生活中的应用',
    cover: 'https://picsum.photos/300/200?random=1',
    creator: '科技前沿',
    publishTime: '2024-01-10 12:00:00',
    tags: ['科技', '人工智能', '前沿技术'],
    contentType: '文章',
    flowStatus: '上升',
    contentStatus: [30, 40, 35, 50, 49, 60, 70]
  },
  {
    id: 2,
    title: '2024年最受欢迎的旅行地的TOP10',
    cover: 'https://picsum.photos/300/200?random=2',
    creator: '旅行达人',
    publishTime: '2024-01-09 15:30:00',
    tags: ['生活', '旅行', '攻略'],
    contentType: '图文',
    flowStatus: '下降',
    contentStatus: [70, 65, 60, 55, 50, 45, 40]
  },
  {
    id: 3,
    title: '健康饮食指南：如何科学搭配每日营养',
    cover: 'https://picsum.photos/300/200?random=3',
    creator: '营养师小王',
    publishTime: '2024-01-09 09:15:00',
    tags: ['健康', '饮食', '生活'],
    contentType: '文章',
    flowStatus: '上升',
    contentStatus: [20, 25, 30, 45, 50, 55, 60]
  },
  {
    id: 4,
    title: '最新款智能手机深度评测视频',
    cover: 'https://picsum.photos/300/200?random=4',
    creator: '数码评测',
    publishTime: '2024-01-08 18:20:00',
    tags: ['科技', '数码', '评测'],
    contentType: '视频',
    flowStatus: '上升',
    contentStatus: [40, 45, 50, 60, 65, 70, 75]
  },
  {
    id: 5,
    title: '30分钟快速健身操教程',
    cover: 'https://picsum.photos/300/200?random=5',
    creator: '健身教练Amy',
    publishTime: '2024-01-08 14:30:00',
    tags: ['运动', '健身', '教程'],
    contentType: '视频',
    flowStatus: '上升',
    contentStatus: [50, 55, 60, 65, 70, 75, 80]
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

// 设置图表引用
const setChartRef = (el: Element | null, id: number) => {
  if (el) {
    chartRefs.set(id, el as HTMLElement)
  }
}

// 初始化迷你图表
const initMiniCharts = () => {
  tableData.value.forEach(item => {
    const chartDom = chartRefs.get(item.id)
    if (chartDom) {
      const miniChart = echarts.init(chartDom)
      const option: EChartsOption = {
        animation: false,
        grid: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0
        },
        xAxis: {
          type: 'category',
          show: false,
          boundaryGap: false
        },
        yAxis: {
          type: 'value',
          show: false
        },
        series: [{
          type: 'line',
          data: item.contentStatus,
          smooth: true,
          symbol: 'none',
          lineStyle: {
            color: '#409EFF'
          },
          areaStyle: {
            color: 'rgba(64,158,255,0.2)'
          }
        }]
      }
      miniChart.setOption(option)
      chartInstances.set(item.id, miniChart)
    }
  })
}

// 事件处理函数
const handleSearch = (): void => {
  console.log('搜索条件：', filterForm.value)
  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

const resetForm = (): void => {
  filterForm.value = {
    dateRange: '',
    tag: '',
    contentType: ''
  }
}

const handleBatchAdd = (): void => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要添加的内容')
    return
  }
  console.log('批量添加内容：', selectedRows.value)
  ElMessage.success('添加成功')
}

const handleBatchDistribute = (): void => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要分发的内容')
    return
  }
  distributeDialogVisible.value = true
}

const handleDistribute = (): void => {
  console.log('分发内容：', {
    contents: selectedRows.value,
    distribute: distributeForm.value
  })
  distributeDialogVisible.value = false
  ElMessage.success('分发成功')
}

const handleSelectionChange = (selection: ContentItem[]): void => {
  selectedRows.value = selection
}

const handleView = (row: ContentItem): void => {
  console.log('查看内容：', row)
}

const handleEdit = (row: ContentItem): void => {
  console.log('编辑内容：', row)
}

const handleDelete = async (row: ContentItem): Promise<void> => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条内容吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    console.log('删除内容：', row)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}

const handleSizeChange = (val: number): void => {
  pageSize.value = val
  // 重新加载数据
}

const handleCurrentChange = (val: number): void => {
  currentPage.value = val
  // 重新加载数据
}

const handleImageError = (event: Event, row: ContentItem): void => {
  const target = event.target as HTMLImageElement
  target.src = 'https://via.placeholder.com/150'
}

// 生命周期
onMounted(() => {
  nextTick(() => {
    initMiniCharts()
  })
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    chartInstances.forEach(chart => chart.resize())
  })
})

onUnmounted(() => {
  // 清理图表实例
  chartInstances.forEach(chart => chart.dispose())
  chartInstances.clear()
  chartRefs.clear()
  
  window.removeEventListener('resize', () => {
    chartInstances.forEach(chart => chart.resize())
  })
})
</script>

<style scoped>
.content-list {
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

.header-right {
  display: flex;
  gap: 10px;
}

.content-title {
  display: flex;
  align-items: center;
  gap: 15px;
}

.content-image {
  width: 80px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
}

.title-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.main-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  line-height: 1.4;
}

.sub-info {
  font-size: 12px;
  color: #909399;
  display: flex;
  gap: 15px;
}

.tag-item {
  margin-right: 5px;
  margin-bottom: 5px;
}

.mini-chart {
  height: 40px;
  width: 100%;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .content-list {
    padding: 10px;
  }

  .content-title {
    gap: 10px;
  }

  .content-image {
    width: 60px;
    height: 45px;
  }

  .main-title {
    font-size: 13px;
  }

  .sub-info {
    font-size: 11px;
    flex-direction: column;
    gap: 3px;
  }

  .header-right {
    flex-direction: column;
    gap: 5px;
  }
}
</style>
