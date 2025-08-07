<template>
    <div class="container">
        <div class="handle-box">
            <el-select v-model="queryParams.article_type" placeholder="内容类型" class="handle-select mr10">
                <el-option label="全部" value="" />
                <el-option label="博客文章" value="blog" />
                <el-option label="GitHub项目" value="github_project" />
            </el-select>
            <el-select v-model="queryParams.status" placeholder="文章状态" class="handle-select mr10">
                <el-option label="全部" value="" />
                <el-option label="已发布" value="published" />
                <el-option label="已删除" value="deleted" />
            </el-select>
            <el-select v-model="queryParams.programming_language" placeholder="编程语言" class="handle-select mr10" v-if="queryParams.article_type === 'github_project'">
                <el-option label="全部" value="" />
                <el-option label="JavaScript" value="JavaScript" />
                <el-option label="Python" value="Python" />
                <el-option label="Java" value="Java" />
                <el-option label="TypeScript" value="TypeScript" />
                <el-option label="Go" value="Go" />
                <el-option label="Rust" value="Rust" />
            </el-select>
            <el-select v-model="queryParams.source" placeholder="来源网站" class="handle-select mr10" v-else>
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
            <el-input v-model="queryParams.keyword" placeholder="搜索项目名称或描述" class="handle-input mr10" />
            <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
            <el-button type="success" :icon="Plus" @click="handleAdd">新增文章</el-button>
            <el-button type="warning" :icon="Download" @click="fetchGitHubTrending" v-if="queryParams.article_type === 'github_project'">获取热门项目</el-button>
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
            <el-table-column prop="article_type" label="类型" width="100">
                <template #default="scope">
                    <el-tag :type="scope.row.article_type === 'github_project' ? 'primary' : 'info'" size="small">
                        {{ scope.row.article_type === 'github_project' ? 'GitHub' : '博客' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="标题/项目名" width="280" show-overflow-tooltip>
                <template #default="scope">
                    <div v-if="scope.row.article_type === 'github_project'" class="github-project-info">
                        <div class="project-name">
                            <a :href="scope.row.github_url" target="_blank" class="project-link">
                                {{ scope.row.github_full_name }}
                            </a>
                        </div>
                        <div class="project-meta">
                            <el-tag v-if="scope.row.programming_language" size="small" type="warning">
                                {{ scope.row.programming_language }}
                            </el-tag>
                            <span class="stars">⭐ {{ formatNumber(scope.row.stars_count) }}</span>
                            <span v-if="scope.row.overall_score" class="score">
                                📊 {{ scope.row.overall_score }}/10
                            </span>
                        </div>
                    </div>
                    <div v-else>{{ scope.row.title }}</div>
                </template>
            </el-table-column>
            <el-table-column label="描述/翻译状态" min-width="300">
                <template #default="scope">
                    <div v-if="scope.row.article_type === 'github_project'" class="description-info">
                        <div class="original-desc">{{ scope.row.original_description }}</div>
                        <div v-if="scope.row.translated_description" class="translated-desc">
                            <el-tag size="small" type="success">已翻译</el-tag>
                            {{ scope.row.translated_description }}
                        </div>
                        <el-button v-else size="small" type="primary" link @click="translateProject(scope.row)">
                            翻译
                        </el-button>
                    </div>
                    <div v-else>{{ scope.row.summary || '暂无摘要' }}</div>
                </template>
            </el-table-column>
            <el-table-column prop="source" label="来源" min-width="100">
                <template #default="scope">
                    {{ scope.row.article_type === 'github_project' ? 'GitHub' : scope.row.source }}
                </template>
            </el-table-column>
            <el-table-column prop="collectTime" label="收集时间" min-width="150" />
            <el-table-column prop="readCount" label="阅读量" min-width="80" />
            <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                    <el-tag :type="scope.row.status === 'published' ? 'success' : 'danger'">
                        {{ scope.row.status === 'published' ? '已发布' : '已删除' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="250" align="center">
                <template #default="scope">
                    <el-button text :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
                    <el-button v-if="scope.row.article_type === 'github_project' && !scope.row.overall_score"
                               text type="success" @click="analyzeProject(scope.row)">分析</el-button>
                    <el-button text type="primary" @click="handleView(scope.row)">查看</el-button>
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
import { Delete, Edit, Search, Plus, Download } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import { getArticleList, deleteArticle, ArticleQueryParams, ArticleData } from '@/api/article';
import { getTrendingProjects, analyzeProject as analyzeProjectAPI, translateText } from '@/api/github';

interface TableItem {
    id: number;
    title: string;
    source: string;
    collectTime: string;
    updateTime: string;
    readCount: number;
    status: string;
    publishTime: string;
    article_type?: string;
    github_id?: number;
    github_full_name?: string;
    github_url?: string;
    original_description?: string;
    translated_description?: string;
    programming_language?: string;
    stars_count?: number;
    forks_count?: number;
    overall_score?: number;
}

const router = useRouter();

// 查询条件
const queryParams = reactive<ArticleQueryParams>({
    keyword: '',
    status: '',
    source: '',
    article_type: '',
    programming_language: '',
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

// 格式化时间
const formatDateTime = (dateTimeStr: string | null | undefined) => {
    if (!dateTimeStr) return '-';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).replace(/\//g, '-');
};

// 是否为开发环境
const isDev = computed(() => {
    return import.meta.env.DEV;
});

// 获取表格数据
const getData = async () => {
    try {
        const res = await getArticleList(queryParams);
        
        if (res.success) {
            // 将API返回的数据转换为页面TableItem格式
            tableData.value = res.data.list.map((item: any) => {
                return {
                    id: item.id,
                    title: item.title,
                    source: item.source,
                    collectTime: formatDateTime(item.collect_time),
                    updateTime: formatDateTime(item.update_time),
                    readCount: item.read_count,
                    status: item.status,
                    publishTime: formatDateTime(item.publish_time)
                };
            });
            pageTotal.value = res.data.total;
        } 
    } catch (error) {
        // 全局处理错误
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

// 查看文章
const handleView = (row: TableItem) => {
    if (row.article_type === 'github_project') {
        window.open(`/articles/github/${row.github_full_name}`, '_blank');
    } else {
        window.open(`/articles/${row.id}`, '_blank');
    }
};

// 删除文章
const handleDelete = (row: TableItem) => {
    ElMessageBox.confirm('确定要删除该文章吗？', '提示', {
        type: 'warning'
    })
        .then(async () => {
            const res = await deleteArticle(row.id);
            
            if (res.success) {
                ElMessage.success('删除成功');
                getData();
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

// 获取GitHub热门项目
const fetchGitHubTrending = async () => {
    try {
        ElMessage.info('正在获取GitHub热门项目...');
        const response = await getTrendingProjects({
            period: 'daily',
            limit: 25
        });
        if (response.data.success) {
            ElMessage.success(`成功获取 ${response.data.data.repositories.length} 个热门项目`);
            getData();
        }
    } catch (error) {
        ElMessage.error('获取热门项目失败');
    }
};

// 翻译项目描述
const translateProject = async (row: TableItem) => {
    if (!row.original_description) {
        ElMessage.warning('该项目没有描述信息');
        return;
    }

    try {
        ElMessage.info('正在翻译...');
        const response = await translateText({
            text: row.original_description
        });
        if (response.data.success) {
            row.translated_description = response.data.data.translated;
            ElMessage.success('翻译成功');
        }
    } catch (error) {
        ElMessage.error('翻译失败');
    }
};

// 分析项目商业价值
const analyzeProject = async (row: TableItem) => {
    if (!row.github_full_name) {
        ElMessage.warning('项目信息不完整');
        return;
    }

    const [owner, repo] = row.github_full_name.split('/');

    try {
        ElMessage.info('正在分析项目商业价值，请稍候...');
        const response = await analyzeProjectAPI(owner, repo);
        if (response.data.success) {
            row.overall_score = response.data.data.analysis.overall_score;
            ElMessage.success('分析完成');
        }
    } catch (error) {
        ElMessage.error('分析失败');
    }
};

// 格式化数字
const formatNumber = (num: number) => {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
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

/* GitHub项目相关样式 */
.github-project-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.project-name {
    font-weight: 500;
}

.project-link {
    color: #409eff;
    text-decoration: none;
}

.project-link:hover {
    text-decoration: underline;
}

.project-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
}

.stars {
    color: #f39c12;
    font-weight: 500;
}

.score {
    color: #27ae60;
    font-weight: 500;
}

.description-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.original-desc {
    color: #666;
    font-size: 13px;
    line-height: 1.4;
}

.translated-desc {
    color: #333;
    font-size: 13px;
    line-height: 1.4;
    padding: 4px 8px;
    background: #f0f9ff;
    border-left: 3px solid #409eff;
    border-radius: 3px;
}
</style> 