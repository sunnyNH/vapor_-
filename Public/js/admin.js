// 导出Vue API供组件使用
window.VueAPI = Vue;

// 打印所有可用的图标
console.log('Available icons:', Object.keys(ElementPlusIconsVue));

// 导入 Element Plus 图标
const {
    Histogram,
    Odometer,
    Folder,
    Document,
    Search,
    User,
    Avatar,
    UserFilled,
    Setting,
    Bell,
    Comment,
    Message,
    Plus,
    Connection,
    Ticket,
    Monitor,
    Files,
    Calendar,
    Lock,
    List,
    Key,
    Operation,
    ArrowDown
} = ElementPlusIconsVue;

// 路由配置
const routes = {
    '1-1': 'data-overview',
    '1-2': 'trend-analysis',
    '2-1': 'content-list',
    '2-2': 'content-detail-query',
    '3-1': 'creator-list',
    '3-2': 'creator-detail',
    '4-1': 'push-management',
    '4-2': 'message-management',
    '4-3': 'email-notification',
    '4-4': 'quantity-management',
    '4-5': 'invitation-management',
    '4-6': 'invitation-code',
    '4-7': 'banner-management',
    '4-8': 'topic-management',
    '4-9': 'activity-management',
    '5-1': 'user-management',
    '5-2': 'operation-log'
};

// 路由中文名称映射
const routeNames = {
    'data-overview': '全局数据动态',
    'trend-analysis': '推荐/搜索热度趋势',
    'content-list': '内容列表/榜单',
    'content-detail-query': '单个内容明细查询',
    'creator-list': '创作者列表',
    'creator-detail': '创作者信息查询',
    'push-management': 'Push管理',
    'message-management': '私信管理',
    'email-notification': 'Email通知',
    'quantity-management': '加量管理',
    'invitation-management': '邀请管理',
    'invitation-code': '邀请码',
    'banner-management': 'Banner管理',
    'topic-management': '专题管理',
    'activity-management': '活动管理',
    'user-management': '用户管理',
    'operation-log': '操作日志'
};

// 组件映射
const components = {
    'data-overview': 'data-overview',
    'trend-analysis': 'trend-analysis',
    'content-list': 'content-list',
    'content-detail-query': 'content-detail-query',
    'creator-list': 'creator-list',
    'creator-detail': 'creator-detail',
    'user-management': 'user-management'
};

// 创建Vue应用实例
const app = Vue.createApp({
    setup() {
        const { ref, onMounted } = Vue;
        
        const currentRoute = ref('');
        const currentComponent = ref('data-overview');
        const currentRouteName = ref(routeNames['data-overview']);
        const userInfo = ref({});
        
        // 处理菜单选择
        const handleSelect = (index) => {
            console.log('Selected menu item:', index);
            currentRoute.value = index;
            const routeName = routes[index];
            currentComponent.value = components[routeName] || routeName;
            currentRouteName.value = routeNames[routeName];
            console.log('Current component:', currentComponent.value);
            // 更新浏览器历史记录
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('page', routeName);
            window.history.pushState({}, '', newUrl);
        };

        // 处理下拉菜单命令
        const handleCommand = (command) => {
            if (command === 'logout') {
                logout();
            } else if (command === 'profile') {
                showProfile();
            }
        };

        // 检查登录状态
        const checkLoginStatus = () => {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login.html';
                return false;
            }
            return true;
        };

        // 显示个人信息
        const showProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/user/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const result = await response.json();
                
                if (response.ok && result.status) {
                    // 使用 Element Plus 的对话框显示用户信息
                    ElementPlus.ElMessageBox.alert(
                        `<div style="text-align: left;">
                            <p><strong>手机号：</strong>${result.data.phone}</p>
                            <p><strong>用户名：</strong>${result.data.name || '未设置'}</p>
                            <p><strong>性别：</strong>${result.data.gender === 1 ? '男' : result.data.gender === 2 ? '女' : '未设置'}</p>
                            <p><strong>年龄：</strong>${result.data.age || '未设置'}</p>
                            <p><strong>地址：</strong>${result.data.address || '未设置'}</p>
                            <p><strong>简介：</strong>${result.data.overview || '未设置'}</p>
                        </div>`,
                        '个人信息',
                        {
                            dangerouslyUseHTMLString: true,
                            confirmButtonText: '确定'
                        }
                    );
                } else {
                    ElementPlus.ElMessage.error(result.error || '获取个人信息失败');
                }
            } catch (error) {
                console.error('获取个人信息失败:', error);
                ElementPlus.ElMessage.error('网络错误，请稍后重试');
            }
        };

        // 退出登录
        const logout = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/signout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                const result = await response.json();
                
                if (response.ok && result.status) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userInfo');
                    ElementPlus.ElMessage.success(result.data || '退出成功');
                    window.location.href = '/login.html';
                } else {
                    ElementPlus.ElMessage.error(result.error || '退出失败，请重试');
                }
            } catch (error) {
                console.error('退出请求失败:', error);
                ElementPlus.ElMessage.error('网络错误，请稍后重试');
            }
        };

        // 获取用户信息
        const getUserInfo = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('未找到登录令牌');
                    return;
                }

                const response = await fetch('/user/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                const result = await response.json();
                console.log('用户信息响应:', result); // 调试日志
                
                if (response.ok && result.status) {  // 使用 status 而不是 success
                    userInfo.value = {
                        name: result.data.name,
                        avatar: result.data.avatar,
                        phone: result.data.phone,
                        age: result.data.age,
                        gender: result.data.gender,
                        address: result.data.address,
                        overview: result.data.overview
                    };
                    // 更新本地存储
                    localStorage.setItem('userInfo', JSON.stringify(userInfo.value));
                } else {
                    console.error('获取用户信息失败:', result.error || '未知错误');
                    if (response.status === 401) {
                        // Token 过期或无效，清除数据并重新登录
                        localStorage.removeItem('token');
                        localStorage.removeItem('userInfo');
                        ElementPlus.ElMessage.error('登录已过期，请重新登录');
                        setTimeout(() => {
                            window.location.href = '/login.html';
                        }, 1500);
                    } else {
                        ElementPlus.ElMessage.error(result.error || '获取用户信息失败');
                    }
                }
            } catch (error) {
                console.error('获取用户信息失败:', error);
                // 检查是否是网络错误
                if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                    ElementPlus.ElMessage.error('网络连接失败，请检查网络设置');
                } else {
                    ElementPlus.ElMessage.error('获取用户信息时发生错误，请稍后重试');
                }
            }
        };

        // 初始化
        const init = async () => {
            if (!checkLoginStatus()) {
                return;
            }

            // 获取最新的用户信息
            await getUserInfo();

            // 从 URL 参数中获取页面
            const urlParams = new URLSearchParams(window.location.search);
            const page = urlParams.get('page');
            if (page) {
                // 找到对应的路由键
                const routeKey = Object.entries(routes).find(([key, value]) => value === page)?.[0];
                if (routeKey) {
                    currentRoute.value = routeKey;
                    currentComponent.value = components[page] || page;
                    currentRouteName.value = routeNames[page];
                }
            }
            console.log('Initialized with component:', currentComponent.value);
        };

        // 监听浏览器后退/前进
        window.addEventListener('popstate', () => {
            init();
        });

        // 页面加载完成后初始化
        onMounted(() => {
            init();
        });

        return {
            currentRoute,
            currentComponent,
            currentRouteName,
            userInfo,
            handleSelect,
            handleCommand,
            logout
        };
    }
});

// 注册 Element Plus
app.use(ElementPlus);

// 注册图标组件
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}

// 导出应用实例供组件使用
window.app = app;

// 等待DOM加载完成后再挂载应用
window.addEventListener('load', () => {
    // 确保所有组件都已注册
    setTimeout(() => {
        app.mount('#app');
    }, 500);
}); 