<template>
  <div class="trend-analysis">
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
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>内容趋势化</span>
            </div>
          </template>
          <div class="chart-container" ref="contentChartRef"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>推荐/搜索分别的关键词趋势变化</span>
            </div>
          </template>
          <div class="chart-container" ref="keywordChartRef"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import type { DateShortcut } from '@/types'

const filterForm = ref({
  dateRange: ''
})

const contentChartRef = ref<HTMLElement>()
const keywordChartRef = ref<HTMLElement>()
let contentChart: echarts.ECharts | null = null
let keywordChart: echarts.ECharts | null = null

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

// 初始化内容趋势图表
const initContentChart = () => {
  if (contentChart) {
    contentChart.dispose()
  }
  if (contentChartRef.value) {
    contentChart = echarts.init(contentChartRef.value)
    const option: EChartsOption = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['热门内容', '新增内容', '下架内容']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '热门内容',
          type: 'line',
          data: [120, 132, 101, 134, 90, 230, 210]
        },
        {
          name: '新增内容',
          type: 'line',
          data: [220, 182, 191, 234, 290, 330, 310]
        },
        {
          name: '下架内容',
          type: 'line',
          data: [150, 232, 201, 154, 190, 330, 410]
        }
      ]
    }
    contentChart.setOption(option)
  }
}

// 初始化关键词趋势图表
const initKeywordChart = () => {
  if (keywordChart) {
    keywordChart.dispose()
  }
  if (keywordChartRef.value) {
    keywordChart = echarts.init(keywordChartRef.value)
    const option: EChartsOption = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['推荐关键词', '搜索关键词']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '推荐关键词',
          type: 'line',
          data: [320, 332, 301, 334, 390, 330, 320]
        },
        {
          name: '搜索关键词',
          type: 'line',
          data: [220, 182, 191, 234, 290, 330, 310]
        }
      ]
    }
    keywordChart.setOption(option)
  }
}

// 搜索处理
const handleSearch = (): void => {
  console.log('搜索条件：', filterForm.value)
}

// 生命周期
onMounted(() => {
  nextTick(() => {
    initContentChart()
    initKeywordChart()
  })
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    contentChart?.resize()
    keywordChart?.resize()
  })
})

onUnmounted(() => {
  if (contentChart) {
    contentChart.dispose()
    contentChart = null
  }
  if (keywordChart) {
    keywordChart.dispose()
    keywordChart = null
  }
  
  window.removeEventListener('resize', () => {
    contentChart?.resize()
    keywordChart?.resize()
  })
})
</script>

<style scoped>
.trend-analysis {
  padding: 20px;
}

.filter-container {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-card .card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #EBEEF5;
  padding: 10px 20px;
}

.chart-container {
  height: 400px;
  padding: 20px;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .trend-analysis {
    padding: 10px;
  }

  .chart-container {
    height: 300px;
  }

  .el-col {
    margin-bottom: 20px;
  }
}
</style>
