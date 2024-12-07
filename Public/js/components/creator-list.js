const CreatorList = {
    template: `
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
        </div>
    `,
    setup() {
        const filterForm = ref({
            dateRange: '',
            tag: '',
            keyword: '',
            region: ''
        });

        const loading = ref(false);
        const currentPage = ref(1);
        const pageSize = ref(10);
        const total = ref(0);

        // 模拟数据
        const tableData = ref([
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
                name: '创作��2',
                avatar: 'https://placeholder.com/150x150',
                registerTime: '2023-12-02 14:30:00',
                region: '上海',
                attributes: ['生活', '美食', '旅行'],
                contentCount: 89,
                wordCount: '78.2k',
                likes: '8.9k',
                comments: '956'
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
                keyword: '',
                region: ''
            };
        };

        // 查看创作者
        const handleView = (row) => {
            console.log('查看创作者：', row);
            // 实现查看逻辑
        };

        // 编辑创作者
        const handleEdit = (row) => {
            console.log('编辑创作者：', row);
            // 实现编辑逻辑
        };

        // 删除创作者
        const handleDelete = (row) => {
            ElMessageBox.confirm(
                '确定要删除该创作者吗？',
                '警告',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                }
            ).then(() => {
                console.log('删除创作者：', row);
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

        return {
            filterForm,
            dateShortcuts,
            loading,
            tableData,
            currentPage,
            pageSize,
            total,
            handleSearch,
            resetForm,
            handleView,
            handleEdit,
            handleDelete,
            handleSizeChange,
            handleCurrentChange
        };
    }
};

// 注册组件
app.component('creator-list', CreatorList); 