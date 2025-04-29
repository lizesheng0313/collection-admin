<template>
    <div class="container">
        <div class="handle-box">
            <el-select v-model="queryParams.status" placeholder="文章状态" class="handle-select mr10">
                <el-option label="全部" value="" />
                <el-option label="已发布" value="published" />
                <el-option label="已删除" value="deleted" />
            </el-select>
            <el-select v-model="queryParams.source" placeholder="来源网站" class="handle-select mr10">
                <el-option label="全部" value="" />
                <el-option v-for="item in sourceOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-date-picker
                v-model="queryParams.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                class="mr10"
            />
            <el-input v-model="queryParams.keyword" placeholder="关键词搜索" class="handle-input mr10" />
            <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
            <el-button type="success" :icon="Plus" @click="handleAdd">新增文章</el-button>
        </div>

        <el-table
            :data="tableData"
            border
            class="table"
            ref="multipleTable"
            header-cell-class-name="table-header"
            @selection-change="handleSelectionChange"
        >
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column prop="title" label="文章标题" width="250" show-overflow-tooltip :tooltip-options="{ effect: 'dark', enterable: false }" />
            <el-table-column prop="source" label="来源网站" min-width="100" />
            <el-table-column prop="collectTime" label="收集时间" min-width="150" />
            <el-table-column prop="updateTime" label="修改时间" min-width="150" />
            <el-table-column prop="readCount" label="阅读量" min-width="80" />
            <el-table-column prop="status" label="发布状态" width="100">
                <template #default="scope">
                    <el-tag :type="scope.row.status === 'published' ? 'success' : 'danger'">
                        {{ scope.row.status === 'published' ? '已发布' : '已删除' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="publishTime" label="发布时间" min-width="150" />
            <el-table-column label="操作" width="200" align="center">
                <template #default="scope">
                    <el-button text :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
                    <el-button text :icon="Delete" class="red" @click="handleDelete(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="pagination">
            <el-pagination
                background
                layout="total, prev, pager, next"
                :current-page="queryParams.page"
                :page-size="queryParams.pageSize"
                :total="pageTotal"
                @current-change="handlePageChange"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete, Edit, Search, Plus } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import { getArticleList, deleteArticle, ArticleQueryParams, ArticleData } from '@/api/article';

interface TableItem {
    id: number;
    title: string;
    source: string;
    collectTime: string;
    updateTime: string;
    readCount: number;
    status: string;
    publishTime: string;
}

const router = useRouter();

// 查询条件
const queryParams = reactive<ArticleQueryParams>({
    keyword: '',
    status: '',
    source: '',
    dateRange: [],
    page: 1,
    pageSize: 10
});

// 来源网站选项
const sourceOptions = ref([
    { label: '网站A', value: 'siteA' },
    { label: '网站B', value: 'siteB' },
    // 可以从后端获取
]);

// 表格数据
const tableData = ref<TableItem[]>([]);
// 总条数
const pageTotal = ref(0);
// 选中的行
const multipleSelection = ref<TableItem[]>([]);

// 是否为开发环境
const isDev = computed(() => {
    return import.meta.env.DEV;
});

// 获取表格数据
const getData = async () => {
    try {
        console.log('发送请求参数:', queryParams);
        const response: any = await getArticleList(queryParams);
        console.log('API返回原始数据:', response);
        
        // 直接使用response，不需要再取response.data
        const res = response;
        console.log('处理后的数据:', res);
        
        if (res.success) {
            console.log('请求成功，数据列表:', res.data.list);
            // 将API返回的数据转换为页面TableItem格式
            tableData.value = res.data.list.map((item: any) => {
                console.log('处理单条数据:', item);
                return {
                    id: item.id,
                    title: item.title,
                    source: item.source,
                    collectTime: item.collect_time,
                    updateTime: item.update_time,
                    readCount: item.read_count,
                    status: item.status,
                    publishTime: item.publish_time
                };
            });
            console.log('转换后的表格数据:', tableData.value);
            pageTotal.value = res.data.total;
        } else {
            console.error('请求失败，错误信息:', res.message);
            ElMessage.error(res.message || '获取数据失败');
        }
    } catch (error) {
        console.error('获取文章列表出现异常:', error);
        ElMessage.error('获取文章列表失败');
    }
};

// 搜索
const handleSearch = () => {
    queryParams.page = 1;
    getData();
};

// 新增文章
const handleAdd = () => {
    router.push('/article/add');
};

// 编辑文章
const handleEdit = (row: TableItem) => {
    router.push(`/article/edit/${row.id}`);
};

// 删除文章
const handleDelete = (row: TableItem) => {
    ElMessageBox.confirm('确定要删除该文章吗？', '提示', {
        type: 'warning'
    })
        .then(async () => {
            try {
                const response: any = await deleteArticle(row.id);
                const res = response;
                console.log('删除操作响应:', res);
                
                if (res.success) {
                    ElMessage.success('删除成功');
                    getData();
                } else {
                    ElMessage.error(res.message || '删除失败');
                }
            } catch (error) {
                console.error('删除文章失败:', error);
                ElMessage.error('删除文章失败');
            }
        })
        .catch(() => {});
};

// 表格多选
const handleSelectionChange = (val: TableItem[]) => {
    multipleSelection.value = val;
};

// 分页导航
const handlePageChange = (val: number) => {
    queryParams.page = val;
    getData();
};

// 初始化数据
onMounted(() => {
    getData();
});
</script>

<style scoped>
.handle-box {
    margin-bottom: 20px;
}

.handle-select {
    width: 120px;
}

.handle-input {
    width: 300px;
}

.table {
    width: 100%;
    font-size: 14px;
}

.red {
    color: #F56C6C;
}

.mr10 {
    margin-right: 10px;
}

.ml10 {
    margin-left: 10px;
}

.table-header {
    background-color: #f5f7fa;
}

.pagination {
    margin-top: 20px;
    text-align: right;
}
</style> 