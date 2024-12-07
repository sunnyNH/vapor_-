const DataOverview = {
    template: `
        <div class="data-overview">
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
                            <el-option label="标签1" value="tag1" />
                            <el-option label="标签2" value="tag2" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="内容类型">
                        <el-select v-model="filterForm.contentType" placeholder="请选择内容类型">
                            <el-option label="类型1" value="type1" />
                            <el-option label="类型2" value="type2" />
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="handleSearch">查询</el-button>
                    </el-form-item>
                </el-form>
            </el-card>

            <!-- 数据概览卡片 -->
            <el-row :gutter="20" class="data-cards">
                <el-col :span="6">
                    <el-card shadow="hover">
                        <template #header>
                            <div class="card-header">
                                <span>DAU</span>
                                <el-tooltip content="日活跃用户数" placement="top">
                                    <el-icon><question-filled /></el-icon>
                                </el-tooltip>
                            </div>
                        </template>
                        <div class="card-content">
                            <div class="main-value">123,456</div>
                            <div class="compare">
                                较昨日 <span class="up">+5.2%</span>
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="6">
                    <el-card shadow="hover">
                        <template #header>
                            <div class="card-header">
                                <span>推荐曝光数</span>
                            </div>
                        </template>
                        <div class="card-content">
                            <div class="main-value">8,234,567</div>
                            <div class="compare">
                                较昨日 <span class="down">-2.1%</span>
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="6">
                    <el-card shadow="hover">
                        <template #header>
                            <div class="card-header">
                                <span>搜索曝光数</span>
                            </div>
                        </template>
                        <div class="card-content">
                            <div class="main-value">1,234,567</div>
                            <div class="compare">
                                较昨日 <span class="up">+3.4%</span>
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="6">
                    <el-card shadow="hover">
                        <template #header>
                            <div class="card-header">
                                <span>消费时长</span>
                            </div>
                        </template>
                        <div class="card-content">
                            <div class="main-value">45.2分钟</div>
                            <div class="compare">
                                较昨日 <span class="up">+1.2%</span>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>

            <!-- 用户行为指标 -->
            <el-card class="chart-card">
                <template #header>
                    <div class="card-header">
                        <span>用户行为指标趋势</span>
                        <div class="header-right">
                            <el-radio-group v-model="chartType" size="small">
                                <el-radio-button label="day">日</el-radio-button>
                                <el-radio-button label="week">周</el-radio-button>
                                <el-radio-button label="month">月</el-radio-button>
                            </el-radio-group>
                        </div>
                    </div>
                </template>
                <div class="chart-container" ref="chartRef"></div>
            </el-card>
        </div>
    `,
    setup() {
        const { ref, watch, onMounted, onUnmounted } = window.VueAPI;
        
        const filterForm = ref({
            dateRange: '',
            tag: '',
            contentType: ''
        });

        const chartType = ref('day');
        const chartRef = ref(null);
        let chart = null;

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
            },
            {
                text: '最近三月',
                value: () => {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                    return [start, end];
                },
            },
        ];

        // 初始化图表
        const initChart = () => {
            if (chart) {
                chart.dispose();
            }
            chart = echarts.init(chartRef.value);
            const option = {
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: ['有效登录用户数', '互动量', '新用户量', '内容搜索用户量']
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
                        name: '有效登录用户数',
                        type: 'line',
                        data: [120, 132, 101, 134, 90, 230, 210]
                    },
                    {
                        name: '互动量',
                        type: 'line',
                        data: [220, 182, 191, 234, 290, 330, 310]
                    },
                    {
                        name: '新用户量',
                        type: 'line',
                        data: [150, 232, 201, 154, 190, 330, 410]
                    },
                    {
                        name: '内容搜索用户量',
                        type: 'line',
                        data: [320, 332, 301, 334, 390, 330, 320]
                    }
                ]
            };
            chart.setOption(option);
        };

        // 搜索处理
        const handleSearch = () => {
            console.log('搜索条件：', filterForm.value);
            // 这里添加实际的搜索逻辑
        };

        // 监听图表类型变化
        watch(chartType, (newVal) => {
            console.log('图表类型切换：', newVal);
            // 根据类型重新加载数据
            initChart();
        });

        // 组件挂载后初始化图表
        onMounted(() => {
            initChart();
            // 监听窗口大小变化，重绘图表
            window.addEventListener('resize', () => {
                chart && chart.resize();
            });
        });

        // 组件卸载前清理
        onUnmounted(() => {
            if (chart) {
                chart.dispose();
                chart = null;
            }
            window.removeEventListener('resize', () => {
                chart && chart.resize();
            });
        });

        return {
            filterForm,
            dateShortcuts,
            chartType,
            chartRef,
            handleSearch
        };
    }
};

// 等待Vue应用实例创建完成后再注册组件
if (window.app) {
    window.app.component('data-overview', DataOverview);
} else {
    document.addEventListener('DOMContentLoaded', () => {
        window.app.component('data-overview', DataOverview);
    });
} 