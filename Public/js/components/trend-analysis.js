const TrendAnalysis = {
    template: `
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
    `,
    setup() {
        const { ref, onMounted, onUnmounted } = window.VueAPI;
        
        const filterForm = ref({
            dateRange: ''
        });

        const contentChartRef = ref(null);
        const keywordChartRef = ref(null);
        let contentChart = null;
        let keywordChart = null;

        const dateShortcuts = [
            {
                text: '最近一周',
                value: () => {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                    return [start, end];
                },
            },
            {
                text: '最近一月',
                value: () => {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                    return [start, end];
                },
            }
        ];

        // 初始化内容趋势图表
        const initContentChart = () => {
            if (contentChart) {
                contentChart.dispose();
            }
            contentChart = echarts.init(contentChartRef.value);
            const option = {
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
            };
            contentChart.setOption(option);
        };

        // 初始化关键词趋势图表
        const initKeywordChart = () => {
            if (keywordChart) {
                keywordChart.dispose();
            }
            keywordChart = echarts.init(keywordChartRef.value);
            const option = {
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
            };
            keywordChart.setOption(option);
        };

        // 搜索处理
        const handleSearch = () => {
            console.log('搜索条件：', filterForm.value);
            // 这里添加实际的搜索逻辑
        };

        // 组件挂载后初始化图表
        onMounted(() => {
            initContentChart();
            initKeywordChart();
            // 监听窗口大小变化，重绘图表
            window.addEventListener('resize', () => {
                contentChart && contentChart.resize();
                keywordChart && keywordChart.resize();
            });
        });

        // 组件卸载前清理
        onUnmounted(() => {
            if (contentChart) {
                contentChart.dispose();
                contentChart = null;
            }
            if (keywordChart) {
                keywordChart.dispose();
                keywordChart = null;
            }
            window.removeEventListener('resize', () => {
                contentChart && contentChart.resize();
                keywordChart && keywordChart.resize();
            });
        });

        return {
            filterForm,
            dateShortcuts,
            contentChartRef,
            keywordChartRef,
            handleSearch
        };
    }
};

// 等待Vue应用实例创建完成后再注册组件
if (window.app) {
    window.app.component('trend-analysis', TrendAnalysis);
} else {
    document.addEventListener('DOMContentLoaded', () => {
        window.app.component('trend-analysis', TrendAnalysis);
    });
}
