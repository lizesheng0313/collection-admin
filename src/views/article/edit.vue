<template>
    <div class="container">
        <div class="header">
            <h1>{{ isEdit ? '编辑文章' : '新增文章' }}</h1>
            <div class="button-group">
                <el-button type="primary" @click="saveArticle">{{ isEdit ? '保存' : '发布' }}</el-button>
                <el-button @click="goBack">返回</el-button>
            </div>
        </div>

        <div class="content-wrapper">
            <div class="form-fields">
                <div class="form-item">
                    <span class="label">*标题</span>
                    <el-input v-model="articleForm.title" placeholder="示例文章标题" class="input-field"></el-input>
                </div>
                <div class="form-item">
                    <span class="label">*来源</span>
                    <el-input v-model="articleForm.source" placeholder="网站A" class="input-field"></el-input>
                </div>
                <div class="form-item editor-form-item">
                    <span class="label">*内容</span>
                    <div class="editor-wrapper">
                        <QuillEditor
                            v-model:content="articleForm.content" 
                            content-type="html" 
                            toolbar="full" 
                            theme="snow"
                            class="editor"
                        />
                    </div>
                </div>
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

const route = useRoute();
const router = useRouter();
const formRef = ref();

// 判断是新增还是编辑
const isEdit = computed(() => route.params.id !== undefined);

// 文章表单
const articleForm = reactive({
    id: '',
    title: '',
    source: '',
    content: '',
    status: 'published' // 默认为已发布状态
});

// 表单验证规则
const rules = {
    title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
    source: [{ required: true, message: '请输入来源网站', trigger: 'blur' }],
    content: [{ required: true, message: '请输入文章内容', trigger: 'blur' }]
};

// 获取文章详情
const getArticleDetail = async (id: string) => {
    try {
        // TODO: 调用后端API获取文章详情
        // 模拟数据
        const result = {
            id: id,
            title: '示例文章标题',
            source: '网站A',
            content: '<p>这是文章内容</p>',
            status: 'published'
        };
        Object.assign(articleForm, result);
    } catch (error) {
        console.error('获取文章详情失败', error);
        ElMessage.error('获取文章详情失败');
    }
};

// 保存文章
const saveArticle = async () => {
    if (!formRef.value) return;
    
    await formRef.value.validate(async (valid: boolean) => {
        if (valid) {
            try {
                // TODO: 调用后端API保存文章
                ElMessage.success(isEdit.value ? '编辑成功' : '发布成功');
                goBack();
            } catch (error) {
                console.error('保存文章失败', error);
                ElMessage.error('保存文章失败');
            }
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
        getArticleDetail(route.params.id as string);
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
}

.editor-wrapper {
    flex: 1;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
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
</style> 