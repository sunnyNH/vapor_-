// 用户管理组件
const UserManagement = {
    template: `
        <div class="user-management">
            <div class="page-header">
                <el-row :gutter="20" type="flex" justify="space-between" align="middle">
                    <el-col :span="16">
                        <el-form :inline="true" :model="searchForm" class="search-form">
                            <el-form-item label="手机号">
                                <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable></el-input>
                            </el-form-item>
                            <el-form-item label="用户名">
                                <el-input v-model="searchForm.name" placeholder="请输入用户名" clearable></el-input>
                            </el-form-item>
                            <el-form-item label="状态">
                                <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
                                    <el-option label="启用" value="1"></el-option>
                                    <el-option label="禁用" value="0"></el-option>
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
                <el-table-column prop="name" label="用户名" min-width="120"></el-table-column>
                <el-table-column prop="phone" label="手机号" min-width="120"></el-table-column>
                <el-table-column prop="roleName" label="角色" min-width="120"></el-table-column>
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
                    @current-change="handleCurrentChange">
                </el-pagination>
            </div>

            <!-- 用户表单对话框 -->
            <el-dialog
                v-model="dialogVisible"
                :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
                width="500px">
                <el-form
                    ref="userForm"
                    :model="userForm"
                    :rules="userRules"
                    label-width="100px">
                    <el-form-item label="手机号" prop="phone">
                        <el-input v-model="userForm.phone" placeholder="请输入手机号"></el-input>
                    </el-form-item>
                    <el-form-item label="用户名" prop="name">
                        <el-input v-model="userForm.name" placeholder="请输入用户名"></el-input>
                    </el-form-item>
                    <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
                        <el-input v-model="userForm.password" type="password" placeholder="请输入密码"></el-input>
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

            <!-- 权限设置对话框 -->
            <el-dialog
                v-model="permissionDialogVisible"
                :title="currentUser.name + ' - 权限设置'"
                width="800px"
                :close-on-click-modal="false">
                <div class="permission-header" style="margin-bottom: 20px;">
                    <el-alert
                        v-if="currentUser.roleType === 1"
                        title="超级管理员默认拥有所有权限"
                        type="warning"
                        :closable="false">
                    </el-alert>
                    <el-alert
                        v-else
                        title="为普通管理员分配具体功能权限"
                        type="info"
                        :closable="false">
                    </el-alert>
                </div>
                <div class="permission-content" v-if="currentUser.roleType === 2">
                    <el-form :model="permissionForm" label-position="top">
                        <div v-for="(group, groupIndex) in permissionGroups" :key="groupIndex" class="permission-group">
                            <div class="group-title" style="background: #f5f7fa; padding: 10px; margin-bottom: 10px;">
                                <el-checkbox 
                                    v-model="group.checked"
                                    :indeterminate="group.indeterminate"
                                    @change="(val) => handleGroupChange(val, group)">
                                    {{ group.name }}
                                </el-checkbox>
                            </div>
                            <div class="group-content" style="padding: 0 20px; margin-bottom: 20px;">
                                <template v-if="group.children">
                                    <div v-for="(subGroup, subIndex) in group.children" :key="subIndex" 
                                        style="margin-bottom: 15px;">
                                        <div style="margin-bottom: 10px;">
                                            <el-checkbox 
                                                v-model="subGroup.checked"
                                                :indeterminate="subGroup.indeterminate"
                                                @change="(val) => handleSubGroupChange(val, subGroup, group)">
                                                {{ subGroup.name }}
                                            </el-checkbox>
                                        </div>
                                        <div style="padding-left: 25px;">
                                            <el-checkbox-group 
                                                v-model="subGroup.selectedPermissions"
                                                @change="(val) => handlePermissionChange(val, subGroup, group)">
                                                <el-checkbox 
                                                    v-for="permission in subGroup.permissions" 
                                                    :key="permission.id"
                                                    :label="permission.id">
                                                    {{ permission.name }}
                                                </el-checkbox>
                                            </el-checkbox-group>
                                        </div>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </el-form>
                </div>
                <template #footer>
                    <el-button @click="permissionDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitPermissions" 
                        :disabled="currentUser.roleType === 1">确定</el-button>
                </template>
            </el-dialog>
        </div>
    `,
    setup() {
        const { ref, reactive, onMounted } = Vue;

        // 搜索表单
        const searchForm = reactive({
            phone: '',
            name: '',
            status: ''
        });

        // 表格数据
        const tableData = ref([]);
        const loading = ref(false);
        const currentPage = ref(1);
        const pageSize = ref(10);
        const total = ref(0);

        // 用户表单对话框
        const dialogVisible = ref(false);
        const dialogType = ref('add');
        const userForm = reactive({
            phone: '',
            name: '',
            password: '',
            roleType: 2  // 默认为普通管理员
        });
        const userRules = {
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
        };

        // 权限设置对话框
        const permissionDialogVisible = ref(false);
        const currentUser = ref({
            name: '',
            roleType: 1
        });
        const permissionGroups = ref([
            {
                name: '流量监控',
                checked: false,
                indeterminate: false,
                children: [
                    {
                        name: '全局数据动态',
                        checked: false,
                        indeterminate: false,
                        selectedPermissions: [],
                        permissions: [
                            { id: 'data:view', name: '查看' }
                        ]
                    },
                    {
                        name: '推荐/搜索热度趋势',
                        checked: false,
                        indeterminate: false,
                        selectedPermissions: [],
                        permissions: [
                            { id: 'trend:view', name: '查看' }
                        ]
                    }
                ]
            },
            {
                name: '内容管理',
                checked: false,
                indeterminate: false,
                children: [
                    {
                        name: '内容列表/榜单',
                        checked: false,
                        indeterminate: false,
                        selectedPermissions: [],
                        permissions: [
                            { id: 'content:view', name: '查看' },
                            { id: 'content:edit', name: '编辑' },
                            { id: 'content:delete', name: '删除' }
                        ]
                    },
                    {
                        name: '单个内容明细查询',
                        checked: false,
                        indeterminate: false,
                        selectedPermissions: [],
                        permissions: [
                            { id: 'content:detail:view', name: '查看' }
                        ]
                    }
                ]
            },
            {
                name: '创作者管理',
                checked: false,
                indeterminate: false,
                children: [
                    {
                        name: '创作者列表',
                        checked: false,
                        indeterminate: false,
                        selectedPermissions: [],
                        permissions: [
                            { id: 'creator:view', name: '查看' },
                            { id: 'creator:edit', name: '编辑' },
                            { id: 'creator:delete', name: '删除' }
                        ]
                    },
                    {
                        name: '创作者信息查询',
                        checked: false,
                        indeterminate: false,
                        selectedPermissions: [],
                        permissions: [
                            { id: 'creator:detail:view', name: '查看' }
                        ]
                    }
                ]
            },
            {
                name: '运营工具',
                checked: false,
                indeterminate: false,
                children: [
                    {
                        name: 'Push管理',
                        checked: false,
                        indeterminate: false,
                        selectedPermissions: [],
                        permissions: [
                            { id: 'push:view', name: '查看' },
                            { id: 'push:add', name: '新增' },
                            { id: 'push:edit', name: '编辑' },
                            { id: 'push:delete', name: '删除' }
                        ]
                    },
                    {
                        name: '私信管理',
                        checked: false,
                        indeterminate: false,
                        selectedPermissions: [],
                        permissions: [
                            { id: 'message:view', name: '查看' },
                            { id: 'message:send', name: '发送' },
                            { id: 'message:delete', name: '删除' }
                        ]
                    },
                    {
                        name: 'Email通知',
                        checked: false,
                        indeterminate: false,
                        selectedPermissions: [],
                        permissions: [
                            { id: 'email:view', name: '查看' },
                            { id: 'email:send', name: '发送' }
                        ]
                    },
                    {
                        name: '加量管理',
                        checked: false,
                        indeterminate: false,
                        selectedPermissions: [],
                        permissions: [
                            { id: 'quantity:view', name: '查看' },
                            { id: 'quantity:add', name: '新增' },
                            { id: 'quantity:edit', name: '编辑' },
                            { id: 'quantity:delete', name: '删除' }
                        ]
                    },
                    {
                        name: '邀请管理',
                        checked: false,
                        indeterminate: false,
                        selectedPermissions: [],
                        permissions: [
                            { id: 'invitation:view', name: '查看' },
                            { id: 'invitation:add', name: '新增' },
                            { id: 'invitation:edit', name: '编辑' },
                            { id: 'invitation:delete', name: '删除' }
                        ]
                    },
                    {
                        name: '邀请码',
                        checked: false,
                        indeterminate: false,
                        selectedPermissions: [],
                        permissions: [
                            { id: 'invitationCode:view', name: '查看' },
                            { id: 'invitationCode:generate', name: '生成' },
                            { id: 'invitationCode:delete', name: '删除' }
                        ]
                    },
                    {
                        name: 'Banner管理',
                        checked: false,
                        indeterminate: false,
                        selectedPermissions: [],
                        permissions: [
                            { id: 'banner:view', name: '查看' },
                            { id: 'banner:add', name: '新增' },
                            { id: 'banner:edit', name: '编辑' },
                            { id: 'banner:delete', name: '删除' }
                        ]
                    },
                    {
                        name: '专题管理',
                        checked: false,
                        indeterminate: false,
                        selectedPermissions: [],
                        permissions: [
                            { id: 'topic:view', name: '查看' },
                            { id: 'topic:add', name: '新增' },
                            { id: 'topic:edit', name: '编辑' },
                            { id: 'topic:delete', name: '删除' }
                        ]
                    },
                    {
                        name: '活动管理',
                        checked: false,
                        indeterminate: false,
                        selectedPermissions: [],
                        permissions: [
                            { id: 'activity:view', name: '查看' },
                            { id: 'activity:add', name: '新增' },
                            { id: 'activity:edit', name: '编辑' },
                            { id: 'activity:delete', name: '删除' }
                        ]
                    }
                ]
            },
            {
                name: '系统管理',
                checked: false,
                indeterminate: false,
                children: [
                    {
                        name: '用户管理',
                        checked: false,
                        indeterminate: false,
                        selectedPermissions: [],
                        permissions: [
                            { id: 'user:view', name: '查看' },
                            { id: 'user:add', name: '新增' },
                            { id: 'user:edit', name: '编辑' },
                            { id: 'user:delete', name: '删除' }
                        ]
                    },
                    {
                        name: '操作日志',
                        checked: false,
                        indeterminate: false,
                        selectedPermissions: [],
                        permissions: [
                            { id: 'log:view', name: '查看' }
                        ]
                    }
                ]
            }
        ]);

        // 获取用户列表
        const fetchUserList = async () => {
            loading.value = true;
            try {
                // 模拟API调用
                const response = await new Promise(resolve => {
                    setTimeout(() => {
                        resolve({
                            data: {
                                list: [
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
                                ],
                                total: 2
                            }
                        });
                    }, 500);
                });
                tableData.value = response.data.list;
                total.value = response.data.total;
            } catch (error) {
                console.error('获取用户列表失败:', error);
                ElementPlus.ElMessage.error('获取用户列表失败');
            } finally {
                loading.value = false;
            }
        };

        // 搜索
        const handleSearch = () => {
            currentPage.value = 1;
            fetchUserList();
        };

        // 重置搜索
        const resetSearch = () => {
            searchForm.phone = '';
            searchForm.name = '';
            searchForm.status = '';
            handleSearch();
        };

        // 新增用户
        const handleAdd = () => {
            dialogType.value = 'add';
            Object.assign(userForm, {
                phone: '',
                name: '',
                password: '',
                roleType: 2  // 默认为普通管理员
            });
            dialogVisible.value = true;
        };

        // 编辑用户
        const handleEdit = (row) => {
            dialogType.value = 'edit';
            Object.assign(userForm, {
                id: row.id,
                phone: row.phone,
                name: row.name,
                roleType: row.roleType
            });
            dialogVisible.value = true;
        };

        // 权限设置
        const handlePermissions = async (row) => {
            if (row.roleType === 1) {
                ElementPlus.ElMessage.warning('超级管理员默认拥有所有权限，无需设置');
                return;
            }
            currentUser.value = row;
            permissionDialogVisible.value = true;
        };

        // 提交权限设置
        const submitPermissions = async () => {
            try {
                // 模拟API调用
                await new Promise(resolve => setTimeout(resolve, 300));
                ElementPlus.ElMessage.success('权限设置成功');
                permissionDialogVisible.value = false;
                fetchUserList();
            } catch (error) {
                console.error('权限设置失败:', error);
                ElementPlus.ElMessage.error('权限设置失败');
            }
        };

        // 重置密码
        const handleResetPassword = async (row) => {
            try {
                await ElementPlus.ElMessageBox.confirm(
                    '确定要重置该用户的密码吗？',
                    '提示',
                    {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }
                );
                // 模拟API调用
                await new Promise(resolve => setTimeout(resolve, 300));
                ElementPlus.ElMessage.success('密码重置成功');
            } catch (error) {
                if (error !== 'cancel') {
                    console.error('重置密码失败:', error);
                    ElementPlus.ElMessage.error('重置密码失败');
                }
            }
        };

        // 提交表单
        const submitForm = async () => {
            try {
                // 模拟API调用
                await new Promise(resolve => setTimeout(resolve, 300));
                ElementPlus.ElMessage.success(
                    dialogType.value === 'add' ? '添加成功' : '编辑成功'
                );
                dialogVisible.value = false;
                fetchUserList();
            } catch (error) {
                console.error('提交表单失败:', error);
                ElementPlus.ElMessage.error('操作失败');
            }
        };

        // 分页
        const handleSizeChange = (val) => {
            pageSize.value = val;
            fetchUserList();
        };

        const handleCurrentChange = (val) => {
            currentPage.value = val;
            fetchUserList();
        };

        // 更改用户状态
        const handleStatusChange = async (row) => {
            try {
                const action = row.status === 1 ? '禁用' : '启用';
                await ElementPlus.ElMessageBox.confirm(
                    `确定要${action}该用户吗？`,
                    '提示',
                    {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }
                );
                // 模拟API调用
                await new Promise(resolve => setTimeout(resolve, 300));
                ElementPlus.ElMessage.success(`${action}成功`);
                row.status = row.status === 1 ? 0 : 1;
            } catch (error) {
                if (error !== 'cancel') {
                    console.error('更改用户状态失败:', error);
                    ElementPlus.ElMessage.error('操作失败');
                }
            }
        };

        onMounted(() => {
            fetchUserList();
        });

        return {
            searchForm,
            tableData,
            loading,
            currentPage,
            pageSize,
            total,
            dialogVisible,
            dialogType,
            userForm,
            userRules,
            permissionDialogVisible,
            currentUser,
            permissionGroups,
            handleSearch,
            resetSearch,
            handleAdd,
            handleEdit,
            handlePermissions,
            handleStatusChange,
            handleResetPassword,
            submitForm,
            submitPermissions,
            handleSizeChange,
            handleCurrentChange
        };
    }
};

// 注册组件
app.component('user-management', UserManagement); 