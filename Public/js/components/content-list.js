const { ref, onMounted } = window.VueAPI;

const ContentList = {
    name: 'content-list',
    template: `
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
                            <div class="mini-chart" :ref="'miniChart' + scope.row.id"></div>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="200" fixed="right">
                        <template #default="scope">
                            <el-button type="text" @click="handleView(scope.row)">查看</el-button>
                            <el-button type="text" @click="handleEdit(scope.row)">编辑</el-button>
                            <el-button type="text" @click="handleDelete(scope.row)" class="delete-btn">删除</el-button>
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
    `,
    setup() {
        const filterForm = ref({
            dateRange: '',
            tag: '',
            contentType: ''
        });

        const loading = ref(false);
        const currentPage = ref(1);
        const pageSize = ref(10);
        const total = ref(300);
        const distributeDialogVisible = ref(false);
        const selectedRows = ref([]);

        const distributeForm = ref({
            channels: [],
            time: ''
        });

        // 模拟数据
        const tableData = ref([
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
            },
            {
                id: 6,
                title: '年轻人的第一份理财规划指南',
                cover: 'https://picsum.photos/300/200?random=6',
                creator: '理财专家',
                publishTime: '2024-01-08 10:00:00',
                tags: ['理财', '生活', '规划'],
                contentType: '文章',
                flowStatus: '下降',
                contentStatus: [80, 75, 70, 65, 60, 55, 50]
            },
            {
                id: 7,
                title: '美食vlog：探访米其林三星餐厅',
                cover: 'https://picsum.photos/300/200?random=7',
                creator: '美食家小李',
                publishTime: '2024-01-07 20:15:00',
                tags: ['美食', 'vlog', '探店'],
                contentType: '视频',
                flowStatus: '上升',
                contentStatus: [30, 35, 40, 45, 50, 55, 60]
            },
            {
                id: 8,
                title: '2024年春季流行趋势预测',
                cover: 'https://picsum.photos/300/200?random=8',
                creator: '时尚博主',
                publishTime: '2024-01-07 16:45:00',
                tags: ['时尚', '潮流', '生活'],
                contentType: '图文',
                flowStatus: '上升',
                contentStatus: [40, 45, 50, 55, 60, 65, 70]
            },
            {
                id: 9,
                title: 'ChatGPT使用技巧大全',
                cover: 'https://picsum.photos/300/200?random=9',
                creator: 'AI研究员',
                publishTime: '2024-01-07 11:20:00',
                tags: ['科技', 'AI', '教程'],
                contentType: '文章',
                flowStatus: '上升',
                contentStatus: [60, 65, 70, 75, 80, 85, 90]
            },
            {
                id: 10,
                title: '家居收纳整理的艺术',
                cover: 'https://picsum.photos/300/200?random=10',
                creator: '生活家',
                publishTime: '2024-01-06 09:30:00',
                tags: ['生活', '家居', '收纳'],
                contentType: '图文',
                flowStatus: '下降',
                contentStatus: [90, 85, 80, 75, 70, 65, 60]
            },
            {
                id: 11,
                title: '编程入门：Python基础教程系列',
                cover: 'https://picsum.photos/300/200?random=11',
                creator: '编程教育',
                publishTime: '2024-01-06 08:30:00',
                tags: ['编程', '教育', 'Python'],
                contentType: '视频',
                flowStatus: '上升',
                contentStatus: [40, 45, 50, 55, 60, 65, 70]
            },
            {
                id: 12,
                title: '宠物护理小知识分享',
                cover: 'https://picsum.photos/300/200?random=12',
                creator: '宠物医生',
                publishTime: '2024-01-06 07:15:00',
                tags: ['宠物', '生活', '护理'],
                contentType: '图文',
                flowStatus: '上升',
                contentStatus: [30, 35, 40, 45, 50, 55, 60]
            },
            {
                id: 13,
                title: '电动汽车行业发展趋势分析',
                cover: 'https://picsum.photos/300/200?random=13',
                creator: '汽车研究所',
                publishTime: '2024-01-05 21:00:00',
                tags: ['科技', '汽车', '新能源'],
                contentType: '文章',
                flowStatus: '上升',
                contentStatus: [50, 55, 60, 65, 70, 75, 80]
            },
            {
                id: 14,
                title: '瑜伽初学者入门指南',
                cover: 'https://picsum.photos/300/200?random=14',
                creator: '瑜伽导师',
                publishTime: '2024-01-05 18:45:00',
                tags: ['运动', '瑜伽', '健康'],
                contentType: '视频',
                flowStatus: '下降',
                contentStatus: [70, 65, 60, 55, 50, 45, 40]
            },
            {
                id: 15,
                title: '咖啡爱好者必看：手冲咖啡技巧',
                cover: 'https://picsum.photos/300/200?random=15',
                creator: '咖啡师',
                publishTime: '2024-01-05 16:30:00',
                tags: ['咖啡', '生活', '教程'],
                contentType: '视频',
                flowStatus: '上升',
                contentStatus: [45, 50, 55, 60, 65, 70, 75]
            },
            {
                id: 16,
                title: '室内植物养护攻略',
                cover: 'https://picsum.photos/300/200?random=16',
                creator: '园艺达人',
                publishTime: '2024-01-05 14:20:00',
                tags: ['园艺', '生活', '植物'],
                contentType: '图文',
                flowStatus: '上升',
                contentStatus: [35, 40, 45, 50, 55, 60, 65]
            },
            {
                id: 17,
                title: '区块链技术应用前景分析',
                cover: 'https://picsum.photos/300/200?random=17',
                creator: '区块链专家',
                publishTime: '2024-01-05 11:10:00',
                tags: ['科技', '区块链', '金融'],
                contentType: '文章',
                flowStatus: '下降',
                contentStatus: [85, 80, 75, 70, 65, 60, 55]
            },
            {
                id: 18,
                title: '摄影技巧：如何拍出完美人像',
                cover: 'https://picsum.photos/300/200?random=18',
                creator: '摄影师',
                publishTime: '2024-01-05 09:00:00',
                tags: ['摄影', '教程', '艺术'],
                contentType: '视频',
                flowStatus: '上升',
                contentStatus: [40, 45, 50, 55, 60, 65, 70]
            },
            {
                id: 19,
                title: '中国传统文化系列：茶道艺术',
                cover: 'https://picsum.photos/300/200?random=19',
                creator: '文化学者',
                publishTime: '2024-01-05 07:30:00',
                tags: ['文化', '茶道', '艺术'],
                contentType: '图文',
                flowStatus: '上升',
                contentStatus: [30, 35, 40, 45, 50, 55, 60]
            },
            {
                id: 20,
                title: '未来城市发展趋势展望',
                cover: 'https://picsum.photos/300/200?random=20',
                creator: '城市规划师',
                publishTime: '2024-01-04 22:00:00',
                tags: ['城市', '规划', '未来'],
                contentType: '文章',
                flowStatus: '上升',
                contentStatus: [50, 55, 60, 65, 70, 75, 80]
            },
            {
                id: 21,
                title: '2024春季护肤品测评：干皮救星推荐',
                cover: 'https://picsum.photos/300/200?random=21',
                creator: '美妆博主小C',
                publishTime: '2024-01-04 20:30:00',
                tags: ['美妆', '护肤', '测评'],
                contentType: '视频',
                flowStatus: '上升',
                contentStatus: [45, 50, 55, 60, 65, 70, 75]
            },
            {
                id: 22,
                title: '敏感肌护理全攻略：从清洁到防晒',
                cover: 'https://picsum.photos/300/200?random=22',
                creator: '皮肤科医生',
                publishTime: '2024-01-04 18:15:00',
                tags: ['护肤', '敏感肌', '医疗'],
                contentType: '文章',
                flowStatus: '上升',
                contentStatus: [30, 35, 40, 45, 50, 55, 60]
            },
            {
                id: 23,
                title: '10分钟日常职场妆容教程',
                cover: 'https://picsum.photos/300/200?random=23',
                creator: '化妆师王老师',
                publishTime: '2024-01-04 16:00:00',
                tags: ['美妆', '教程', '职场'],
                contentType: '视频',
                flowStatus: '上升',
                contentStatus: [50, 55, 60, 65, 70, 75, 80]
            },
            {
                id: 24,
                title: '美容仪器大横评：哪款最值得推荐',
                cover: 'https://picsum.photos/300/200?random=24',
                creator: '美容评测室',
                publishTime: '2024-01-04 14:45:00',
                tags: ['美容', '仪器', '评测'],
                contentType: '图文',
                flowStatus: '下降',
                contentStatus: [80, 75, 70, 65, 60, 55, 50]
            },
            {
                id: 25,
                title: '头发护理秘籍：从洗护到造型',
                cover: 'https://picsum.photos/300/200?random=25',
                creator: '发型师Tony',
                publishTime: '2024-01-04 12:30:00',
                tags: ['美容', '护发', '造型'],
                contentType: '视频',
                flowStatus: '上升',
                contentStatus: [40, 45, 50, 55, 60, 65, 70]
            },
            {
                id: 26,
                title: '医美科普：玻尿酸填充全知识',
                cover: 'https://picsum.photos/300/200?random=26',
                creator: '医美专家',
                publishTime: '2024-01-04 10:15:00',
                tags: ['医美', '科普', '美容'],
                contentType: '文章',
                flowStatus: '上升',
                contentStatus: [35, 40, 45, 50, 55, 60, 65]
            },
            {
                id: 27,
                title: '夏日防晒全攻略：选购使用技巧',
                cover: 'https://picsum.photos/300/200?random=27',
                creator: '美妆达人',
                publishTime: '2024-01-04 08:00:00',
                tags: ['防晒', '护肤', '夏季'],
                contentType: '图文',
                flowStatus: '上升',
                contentStatus: [30, 35, 40, 45, 50, 55, 60]
            },
            {
                id: 28,
                title: '男士护肤入门：简单有效的护理步骤',
                cover: 'https://picsum.photos/300/200?random=28',
                creator: '型男美妆师',
                publishTime: '2024-01-03 21:45:00',
                tags: ['男士护肤', '护理', '美容'],
                contentType: '视频',
                flowStatus: '上升',
                contentStatus: [45, 50, 55, 60, 65, 70, 75]
            },
            {
                id: 29,
                title: '美甲艺术：2024流行美甲款式',
                cover: 'https://picsum.photos/300/200?random=29',
                creator: '美甲师小美',
                publishTime: '2024-01-03 19:30:00',
                tags: ['美甲', '美容', '时尚'],
                contentType: '图文',
                flowStatus: '上升',
                contentStatus: [40, 45, 50, 55, 60, 65, 70]
            },
            {
                id: 30,
                title: '中医美容：传统养颜方法大全',
                cover: 'https://picsum.photos/300/200?random=30',
                creator: '中医美容师',
                publishTime: '2024-01-03 17:15:00',
                tags: ['中医', '美容', '养生'],
                contentType: '文章',
                flowStatus: '上升',
                contentStatus: [35, 40, 45, 50, 55, 60, 65]
            }
        ]);

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

        // 初始化迷你图表
        const initMiniCharts = () => {
            tableData.value.forEach(item => {
                const chartDom = document.querySelector(`[ref="miniChart${item.id}"]`);
                if (chartDom) {
                    const miniChart = echarts.init(chartDom);
                    const option = {
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
                    };
                    miniChart.setOption(option);
                }
            });
        };

        // 搜索处理
        const handleSearch = () => {
            console.log('搜索条件：', filterForm.value);
            // 这里添加实际的搜索逻辑
        };

        // 重置表单
        const resetForm = () => {
            filterForm.value = {
                dateRange: '',
                tag: '',
                contentType: ''
            };
        };

        // 批量添加
        const handleBatchAdd = () => {
            if (selectedRows.value.length === 0) {
                ElMessage.warning('请选择要添加的内容');
                return;
            }
            console.log('批量添加内容：', selectedRows.value);
            ElMessage.success('添加成功');
        };

        // 批量分发
        const handleBatchDistribute = () => {
            if (selectedRows.value.length === 0) {
                ElMessage.warning('请选择要分发的内容');
                return;
            }
            distributeDialogVisible.value = true;
        };

        // 确认分发
        const handleDistribute = () => {
            console.log('分发内容：', {
                contents: selectedRows.value,
                distribute: distributeForm.value
            });
            distributeDialogVisible.value = false;
            ElMessage.success('分发成功');
        };

        // 选择变化
        const handleSelectionChange = (selection) => {
            selectedRows.value = selection;
        };

        // 查看内容
        const handleView = (row) => {
            console.log('查看内容：', row);
            // 实现查看逻辑
        };

        // 编辑内容
        const handleEdit = (row) => {
            console.log('编辑内容：', row);
            // 实现编辑逻辑
        };

        // 删除内容
        const handleDelete = (row) => {
            ElMessageBox.confirm(
                '确定要删除这条内容吗？',
                '警告',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                }
            ).then(() => {
                console.log('删除内容：', row);
                ElMessage.success('删除成功');
            }).catch(() => {});
        };

        // 分页处理
        const handleSizeChange = (val) => {
            pageSize.value = val;
            // 重新加载数据
        };

        const handleCurrentChange = (val) => {
            currentPage.value = val;
            // 重新加载数据
        };

        // 处理图片加载错误
        const handleImageError = (e, row) => {
            // 设置默认图片
            e.target.src = 'https://via.placeholder.com/150';
        };

        // 组件挂载后初始化
        onMounted(() => {
            console.log('Content list component mounted');
            initMiniCharts();
        });

        return {
            filterForm,
            loading,
            currentPage,
            pageSize,
            total,
            distributeDialogVisible,
            selectedRows,
            distributeForm,
            tableData,
            dateShortcuts,
            handleSearch,
            resetForm,
            handleSizeChange,
            handleCurrentChange,
            handleSelectionChange,
            handleView,
            handleEdit,
            handleDelete,
            handleBatchAdd,
            handleBatchDistribute,
            handleDistribute,
            handleImageError
        };
    }
};

// 等待Vue应用实例创建完成后再注册组件
if (window.app) {
    window.app.component('content-list', ContentList);
} else {
    document.addEventListener('DOMContentLoaded', () => {
        window.app.component('content-list', ContentList);
    });
} 