const ContentDetailQuery = {
    template: `
        <div class="content-detail-query">
            <!-- 查询条件 -->
            <el-card class="filter-container">
                <el-form :inline="true" :model="filterForm">
                    <el-form-item label="ID">
                        <el-input v-model="filterForm.id" placeholder="请输入内容ID" />
                    </el-form-item>
                    <el-form-item label="token">
                        <el-input v-model="filterForm.token" placeholder="请输入token" />
                    </el-form-item>
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
                    <el-form-item label="关键���">
                        <el-input v-model="filterForm.keyword" placeholder="请输入关键词" />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="handleSearch">查询</el-button>
                        <el-button @click="resetForm">重置</el-button>
                    </el-form-item>
                </el-form>
            </el-card>

            <!-- 内容详情 -->
            <el-card v-if="contentDetail" class="detail-card">
                <template #header>
                    <div class="card-header">
                        <span>内容详情</span>
                        <div class="header-right">
                            <el-button type="primary" @click="handleEdit">编辑</el-button>
                            <el-button type="danger" @click="handleDelete">删除</el-button>
                        </div>
                    </div>
                </template>

                <!-- 基本信息 -->
                <el-descriptions :column="2" border>
                    <el-descriptions-item label="标题">{{ contentDetail.title }}</el-descriptions-item>
                    <el-descriptions-item label="创作者">{{ contentDetail.creator }}</el-descriptions-item>
                    <el-descriptions-item label="发布时间">{{ contentDetail.publishTime }}</el-descriptions-item>
                    <el-descriptions-item label="标签">
                        <el-tag v-for="tag in contentDetail.tags" :key="tag" size="small" class="tag-item">
                            {{ tag }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="流量状态">
                        <el-tag :type="contentDetail.flowStatus === '上升' ? 'success' : 'danger'">
                            {{ contentDetail.flowStatus }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="内容状态">
                        <el-tag :type="contentDetail.contentStatus === '已开放' ? 'success' : 'info'">
                            {{ contentDetail.contentStatus }}
                        </el-tag>
                    </el-descriptions-item>
                </el-descriptions>

                <!-- 内容预览 -->
                <div class="content-preview">
                    <h3>内容预览</h3>
                    <div class="preview-box">
                        <el-image
                            v-if="contentDetail.cover"
                            :src="contentDetail.cover"
                            :preview-src-list="[contentDetail.cover]"
                            fit="cover"
                            class="cover-image"
                        />
                        <div class="content-text">{{ contentDetail.content }}</div>
                    </div>
                </div>

                <!-- 周期内容状态变化 -->
                <div class="trend-section">
                    <div class="section-header">
                        <h3>周期内容状态变化</h3>
                        <el-radio-group v-model="trendType" size="small">
                            <el-radio-button label="day">日</el-radio-button>
                            <el-radio-button label="week">周</el-radio-button>
                            <el-radio-button label="month">月</el-radio-button>
                        </el-radio-group>
                    </div>
                    <div class="chart-container" ref="trendChartRef"></div>
                </div>

                <!-- 互动数据统计 -->
                <div class="stats-section">
                    <h3>互动数据统计</h3>
                    <el-row :gutter="20">
                        <el-col :span="8">
                            <div class="stat-card">
                                <div class="stat-title">浏览量</div>
                                <div class="stat-value">{{ contentDetail.views }}</div>
                                <div class="stat-trend" :class="contentDetail.viewsTrend >= 0 ? 'up' : 'down'">
                                    <el-icon><caret-top v-if="contentDetail.viewsTrend >= 0" /><caret-bottom v-else /></el-icon>
                                    {{ Math.abs(contentDetail.viewsTrend) }}%
                                </div>
                            </div>
                        </el-col>
                        <el-col :span="8">
                            <div class="stat-card">
                                <div class="stat-title">点赞数</div>
                                <div class="stat-value">{{ contentDetail.likes }}</div>
                                <div class="stat-trend" :class="contentDetail.likesTrend >= 0 ? 'up' : 'down'">
                                    <el-icon><caret-top v-if="contentDetail.likesTrend >= 0" /><caret-bottom v-else /></el-icon>
                                    {{ Math.abs(contentDetail.likesTrend) }}%
                                </div>
                            </div>
                        </el-col>
                        <el-col :span="8">
                            <div class="stat-card">
                                <div class="stat-title">评论数</div>
                                <div class="stat-value">{{ contentDetail.comments }}</div>
                                <div class="stat-trend" :class="contentDetail.commentsTrend >= 0 ? 'up' : 'down'">
                                    <el-icon><caret-top v-if="contentDetail.commentsTrend >= 0" /><caret-bottom v-else /></el-icon>
                                    {{ Math.abs(contentDetail.commentsTrend) }}%
                                </div>
                            </div>
                        </el-col>
                    </el-row>
                </div>
            </el-card>
        </div>
    `,
    setup() {
        const filterForm = ref({
            id: '',
            token: '',
            dateRange: '',
            keyword: ''
        });

        const contentDetail = ref(null);
        const trendType = ref('day');
        const trendChartRef = ref(null);
        let trendChart = null;

        // 模拟数据
        const mockContentDetail = {
            title: '示例内容标题',
            creator: '创作者名称',
            publishTime: '2024-01-10 12:00:00',
            tags: ['科技', '互联网', 'AI'],
            flowStatus: '上升',
            contentStatus: '已开放',
            cover: 'https://placeholder.com/800x400',
            content: '这是内容的预览文本，展示部分内容...',
            views: '12.5k',
            viewsTrend: 5.2,
            likes: '1.2k',
            likesTrend: -2.1,
            comments: '328',
            commentsTrend: 3.4
        };

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

        // 初始化趋势图表
        const initTrendChart = () => {
            if (trendChart) {
                trendChart.dispose();
            }
            trendChart = echarts.init(trendChartRef.value);
            const option = {
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: ['浏览量', '点赞数', '评论数']
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
                        name: '浏览量',
                        type: 'line',
                        smooth: true,
                        data: [120, 132, 101, 134, 90, 230, 210]
                    },
                    {
                        name: '点赞数',
                        type: 'line',
                        smooth: true,
                        data: [220, 182, 191, 234, 290, 330, 310]
                    },
                    {
                        name: '评论数',
                        type: 'line',
                        smooth: true,
                        data: [150, 232, 201, 154, 190, 330, 410]
                    }
                ]
            };
            trendChart.setOption(option);
        };

        // 搜索处理
        const handleSearch = () => {
            console.log('搜索条件：', filterForm.value);
            // 模拟API调用
            contentDetail.value = mockContentDetail;
            nextTick(() => {
                initTrendChart();
            });
        };

        // 重置表单
        const resetForm = () => {
            filterForm.value = {
                id: '',
                token: '',
                dateRange: '',
                keyword: ''
            };
            contentDetail.value = null;
        };

        // 编辑内容
        const handleEdit = () => {
            console.log('编辑内容');
            // 实现编辑逻辑
        };

        // 删除内容
        const handleDelete = () => {
            ElMessageBox.confirm(
                '确定要删除该内容吗？',
                '警告',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                }
            ).then(() => {
                console.log('删除内容');
                ElMessage.success('删除成功');
                contentDetail.value = null;
            }).catch(() => {});
        };

        // 监听趋势类型变化
        watch(trendType, (newVal) => {
            console.log('趋势类型切换：', newVal);
            // 重新加载趋势数据
            initTrendChart();
        });

        // 组件挂载后初始化
        onMounted(() => {
            if (contentDetail.value) {
                initTrendChart();
            }
        });

        // 组件卸载前清理
        onUnmounted(() => {
            if (trendChart) {
                trendChart.dispose();
                trendChart = null;
            }
        });

        return {
            filterForm,
            dateShortcuts,
            contentDetail,
            trendType,
            trendChartRef,
            handleSearch,
            resetForm,
            handleEdit,
            handleDelete
        };
    }
};

// 注册组件
app.component('content-detail-query', ContentDetailQuery); 