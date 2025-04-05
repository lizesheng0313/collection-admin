import { Menus } from '@/types/menu';

export const menuData: Menus[] = [
    {
        id: '0',
        title: '系统首页',
        index: '/dashboard',
        icon: 'Odometer',
    },
    {
        id: '10',
        title: '文章管理',
        index: '10',
        icon: 'Document',
        children: [
            {
                id: '101',
                pid: '10',
                index: '/article/list',
                title: '文章列表',
            },
        ],
    },
    {
        id: '20',
        title: '内容采集',
        index: '20',
        icon: 'Download',
        children: [
            {
                id: '201',
                pid: '20',
                index: '/collect/task',
                title: '采集任务管理',
            },
            {
                id: '202',
                pid: '20',
                index: '/collect/source',
                title: '采集源管理',
            },
            {
                id: '203',
                pid: '20',
                index: '/collect/rule',
                title: '采集规则设置',
            },
            {
                id: '204',
                pid: '20',
                index: '/collect/log',
                title: '采集日志',
            },
        ],
    },
    {
        id: '30',
        title: 'AI处理',
        index: '30',
        icon: 'Magic',
        children: [
            {
                id: '301',
                pid: '30',
                index: '/ai/translate',
                title: '翻译任务',
            },
            {
                id: '302',
                pid: '30',
                index: '/ai/model',
                title: '翻译模型配置',
            },
            {
                id: '303',
                pid: '30',
                index: '/ai/style',
                title: '风格优化',
            },
            {
                id: '304',
                pid: '30',
                index: '/ai/batch',
                title: '批量处理',
            },
        ],
    },
    {
        id: '40',
        title: '模型管理',
        index: '40',
        icon: 'SetUp',
        children: [
            {
                id: '401',
                pid: '40',
                index: '/model/list',
                title: '模型列表',
            },
        ],
    },
];
