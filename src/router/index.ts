import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import Home from '../views/home.vue';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import Dashboard from '../views/dashboard.vue';
import ArticleList from '../views/article/list.vue';
import ArticleEdit from '../views/article/edit.vue';
import CollectTask from '../views/collect/task.vue';
import CollectSource from '../views/collect/source.vue';
import CollectRule from '../views/collect/rule.vue';
import CollectLog from '../views/collect/log.vue';
import AITranslate from '../views/ai/translate.vue';
import AIModel from '../views/ai/model.vue';
import AIStyle from '../views/ai/style.vue';
import AIBatch from '../views/ai/batch.vue';
import ModelList from '../views/model/list.vue';
import GitHubProjects from '../views/github/index.vue';
import NotFound from '../views/pages/404.vue';
import Login from '../views/login/index.vue';


const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/dashboard',
    },
    {
        path: '/login',
        name: 'Login',
        meta: {
            title: '登录',
        },
        component: Login,
    },
    {
        path: '/',
        name: 'Home',
        component: Home,
        children: [
            {
                path: '/dashboard',
                name: 'dashboard',
                meta: {
                    title: '系统首页',
                },
                component: Dashboard,
            },
            {
                path: '/article/list',
                name: 'article-list',
                meta: {
                    title: '文章列表',
                },
                component: ArticleList,
            },
            {
                path: '/article/add',
                name: 'article-add',
                meta: {
                    title: '新增文章',
                },
                component: ArticleEdit,
            },
            {
                path: '/article/edit/:id',
                name: 'article-edit',
                meta: {
                    title: '编辑文章',
                },
                component: ArticleEdit,
            },
            {
                path: '/collect/task',
                name: 'collect-task',
                meta: {
                    title: '采集任务管理',
                },
                component: CollectTask,
            },
            {
                path: '/collect/source',
                name: 'collect-source',
                meta: {
                    title: '采集源管理',
                },
                component: CollectSource,
            },
            {
                path: '/collect/rule',
                name: 'collect-rule',
                meta: {
                    title: '采集规则设置',
                },
                component: CollectRule,
            },
            {
                path: '/collect/log',
                name: 'collect-log',
                meta: {
                    title: '采集日志',
                },
                component: CollectLog,
            },
            {
                path: '/ai/translate',
                name: 'ai-translate',
                meta: {
                    title: '翻译任务',
                },
                component: AITranslate,
            },
            {
                path: '/ai/model',
                name: 'ai-model',
                meta: {
                    title: '翻译模型配置',
                },
                component: AIModel,
            },
            {
                path: '/ai/style',
                name: 'ai-style',
                meta: {
                    title: '风格优化',
                },
                component: AIStyle,
            },
            {
                path: '/ai/batch',
                name: 'ai-batch',
                meta: {
                    title: '批量处理',
                },
                component: AIBatch,
            },
            {
                path: '/model/list',
                name: 'model-list',
                meta: {
                    title: '模型列表',
                },
                component: ModelList,
            }
        ],
    },
    
    {
        path: '/404',
        meta: {
            title: '找不到页面',
        },
        component: NotFound,
    },
    { path: '/:path(.*)', redirect: '/404' },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    NProgress.start();
    
    // 设置页面标题
    document.title = `${to.meta.title || '后台管理系统'}`;
    
    // 检查登录状态
    const token = localStorage.getItem('vuems_token');
    
    if (!token && to.path !== '/login') {
        // 未登录且访问非登录页面，重定向到登录页
        next({ path: '/login' });
    } else {
        next();
    }
});

router.afterEach(() => {
    NProgress.done();
});

export default router;
