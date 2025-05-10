<template>
    <div class="container">
        <div class="header">
            <h1>{{ isEdit ? '编辑文章' : '新增文章' }}</h1>
            <div class="button-group">
                <el-button type="primary" :loading="loading" @click="saveArticle">{{ isEdit ? '保存' : '发布' }}</el-button>
                <el-button @click="goBack">返回</el-button>
            </div>
        </div>

        <div class="content-wrapper">
            <div class="form-fields">
                <el-form ref="formRef" :model="articleForm" :rules="rules" label-width="0">
                    <div class="form-item">
                        <span class="label">*标题</span>
                        <el-form-item prop="title" class="input-field">
                            <el-input v-model="articleForm.title" placeholder="文章标题" class="input-field"></el-input>
                        </el-form-item>
                    </div>
                    <div class="form-item">
                        <span class="label">*来源</span>
                        <el-form-item prop="source" class="input-field">
                            <el-input v-model="articleForm.source" placeholder="网站来源" class="input-field"></el-input>
                        </el-form-item>
                    </div>
                    <div class="form-item" v-if="isEdit">
                        <span class="label">收集</span>
                        <div class="input-field">
                            <el-text>{{ formatDateTime(articleForm.collect_time) }}</el-text>
                        </div>
                    </div>
                    <div class="form-item" v-if="isEdit">
                        <span class="label">发布</span>
                        <div class="input-field">
                            <el-text>{{ formatDateTime(articleForm.publish_time) }}</el-text>
                        </div>
                    </div>
                    <div class="form-item" v-if="isEdit">
                        <span class="label">阅读</span>
                        <div class="input-field">
                            <el-text>{{ articleForm.read_count || 0 }}</el-text>
                        </div>
                    </div>
                    <div class="form-item editor-form-item">
                        <span class="label">*内容</span>
                        <el-form-item prop="content" class="editor-wrapper">
                            <QuillEditor
                                v-model:content="articleForm.content" 
                                content-type="html" 
                                toolbar="full" 
                                theme="snow"
                                class="editor"
                            />
                        </el-form-item>
                    </div>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import { getArticleDetail, createArticle, updateArticle, ArticleData, ApiResponse } from '@/api/article';

const route = useRoute();
const router = useRouter();
const formRef = ref();
const loading = ref(false);

// 判断是新增还是编辑
const isEdit = computed(() => route.params.id !== undefined);

// 文章表单
const articleForm = reactive({
    id: 0,
    title: '',
    source: '',
    content: '',
    collect_time: '',
    publish_time: '',
    read_count: 0
});

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

// 表单验证规则
const rules = {
    title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
    source: [{ required: true, message: '请输入来源网站', trigger: 'blur' }],
    content: [{ required: true, message: '请输入文章内容', trigger: 'blur' }]
};

// 获取文章详情
const getArticleData = async (id: string) => {
    try {
        loading.value = true;
        const res = await getArticleDetail(parseInt(id));
        if (res && res.success) {
            // 后端返回的字段名与前端表单字段名可能不同，需要转换
            articleForm.id = res.data.id;
            articleForm.title = res.data.title;
            articleForm.source = res.data.source;
            articleForm.content = res.data.content;
            articleForm.collect_time = res.data.collect_time;
            articleForm.publish_time = res.data.publish_time;
            articleForm.read_count = res.data.read_count;
        }
    } finally {
        loading.value = false;
    }
};

// 保存文章
const saveArticle = async () => {
    if (!formRef.value) return;
    
    formRef.value.validate(async (valid: boolean) => {
        if (!valid) return;
        
        try {
            loading.value = true;
            
            // 准备提交数据
            const submitData: Partial<ArticleData> = {
                title: articleForm.title,
                source: articleForm.source,
                content: articleForm.content
            };
            
            let res;
            if (isEdit.value && route.params.id) {
                // 编辑文章
                res = await updateArticle(parseInt(route.params.id as string), submitData as ArticleData);
            } else {
                // 新增文章
                res = await createArticle(submitData as ArticleData);
            }
            
            if (res && res.success) {
                ElMessage.success(isEdit.value ? '文章更新成功' : '文章发布成功');
                goBack();
            }
        } finally {
            loading.value = false;
        }
    });
};

// 返回列表页
const goBack = () => {
    router.push('/article/list');
};

// 初始化
onMounted(() => {
    if (isEdit.value && route.params.id) {
        getArticleData(route.params.id as string);
    }
});
</script>

<style scoped>
.container {
    padding: 20px;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 185px);
    overflow: hidden;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.header h1 {
    font-size: 20px;
    margin: 0;
    font-weight: normal;
}

.button-group {
    display: flex;
    gap: 10px;
}

.content-wrapper {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
}

.form-fields {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.form-item {
    margin-bottom: 15px;
    display: flex;
    align-items: flex-start;
}

.editor-form-item {
    flex: 1;
    display: flex;
    margin-bottom: 0;
    overflow: hidden;
}

.label {
    width: 50px;
    text-align: right;
    color: #606266;
    margin-right: 10px;
    font-size: 14px;
    margin-top: 8px;
}

.input-field {
    flex: 1;
    margin-bottom: 0 !important;
}

.editor-wrapper {
    flex: 1;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    margin-bottom: 0 !important;
}

.editor {
    height: 100%;
    display: flex;
    flex-direction: column;
}

:deep(.ql-container) {
    flex: 1;
    font-size: 14px;
    border: none;
    overflow: hidden;
}

:deep(.ql-toolbar) {
    background-color: #f5f7fa;
    border-bottom: 1px solid #dcdfe6;
}

:deep(.ql-editor) {
    padding: 10px 15px;
    overflow-y: auto;
    height: 100%;
}

:deep(.ql-toolbar.ql-snow) {
    padding: 4px;
}

:deep(.el-form-item__error) {
    position: absolute;
    top: 100%;
    left: 0;
}
</style> 