<template>
  <div class="github-projects">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>GitHub项目管理</h1>
      <p>管理GitHub热门项目的翻译和商业价值分析</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalProjects }}</div>
              <div class="stat-label">总项目数</div>
            </div>
            <el-icon class="stat-icon"><Document /></el-icon>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.translatedProjects }}</div>
              <div class="stat-label">已翻译</div>
            </div>
            <el-icon class="stat-icon"><ChatDotRound /></el-icon>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.analyzedProjects }}</div>
              <div class="stat-label">已分析</div>
            </div>
            <el-icon class="stat-icon"><TrendCharts /></el-icon>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.avgScore }}</div>
              <div class="stat-label">平均评分</div>
            </div>
            <el-icon class="stat-icon"><Star /></el-icon>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="left-actions">
        <el-button type="primary" @click="fetchTrendingProjects">
          <el-icon><Refresh /></el-icon>
          获取热门项目
        </el-button>
        <el-button @click="showAnalysisDialog = true">
          <el-icon><Search /></el-icon>
          分析项目
        </el-button>
      </div>
      <div class="right-actions">
        <el-select v-model="filters.language" placeholder="编程语言" clearable @change="handleFilterChange">
          <el-option label="全部" value="" />
          <el-option label="JavaScript" value="JavaScript" />
          <el-option label="Python" value="Python" />
          <el-option label="Java" value="Java" />
          <el-option label="TypeScript" value="TypeScript" />
          <el-option label="Go" value="Go" />
          <el-option label="Rust" value="Rust" />
        </el-select>
        <el-select v-model="filters.trending_period" placeholder="热门周期" clearable @change="handleFilterChange">
          <el-option label="每日" value="daily" />
          <el-option label="每周" value="weekly" />
          <el-option label="每月" value="monthly" />
        </el-select>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索项目名称或描述"
          style="width: 300px"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button @click="handleSearch">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 项目列表 -->
    <el-card class="project-list">
      <el-table
        v-loading="loading"
        :data="projects"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="github_info.full_name" label="项目名称" width="200">
          <template #default="{ row }">
            <div class="project-name">
              <a :href="row.github_info.url" target="_blank" class="project-link">
                {{ row.github_info.full_name }}
              </a>
              <el-tag v-if="row.github_info.language" size="small" class="language-tag">
                {{ row.github_info.language }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="描述" min-width="300">
          <template #default="{ row }">
            <div class="description">
              <div class="original-desc">{{ row.github_info.original_description }}</div>
              <div v-if="row.github_info.translated_description" class="translated-desc">
                {{ row.github_info.translated_description }}
              </div>
              <el-button
                v-else
                size="small"
                type="primary"
                link
                @click="translateDescription(row)"
              >
                翻译
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="github_info.stars" label="Stars" width="100" sortable>
          <template #default="{ row }">
            <el-tag type="warning">{{ formatNumber(row.github_info.stars) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="github_info.forks" label="Forks" width="100" sortable>
          <template #default="{ row }">
            <el-tag>{{ formatNumber(row.github_info.forks) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="overall_score" label="评分" width="100" sortable>
          <template #default="{ row }">
            <el-rate
              v-if="row.overall_score"
              :model-value="row.overall_score / 2"
              disabled
              show-score
              text-color="#ff9900"
              score-template="{value}"
            />
            <el-button
              v-else
              size="small"
              type="success"
              link
              @click="analyzeProject(row)"
            >
              分析
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewProject(row)">查看</el-button>
            <el-button size="small" type="primary" @click="editProject(row)">编辑</el-button>
            <el-dropdown @command="(command) => handleCommand(command, row)">
              <el-button size="small">
                更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="translate">翻译描述</el-dropdown-item>
                  <el-dropdown-item command="analyze">商业分析</el-dropdown-item>
                  <el-dropdown-item command="refresh">刷新数据</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 项目分析对话框 -->
    <el-dialog v-model="showAnalysisDialog" title="分析GitHub项目" width="500px">
      <el-form :model="analysisForm" label-width="100px">
        <el-form-item label="项目地址">
          <el-input
            v-model="analysisForm.url"
            placeholder="https://github.com/owner/repo"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAnalysisDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAnalyzeProject">开始分析</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  ChatDotRound,
  TrendCharts,
  Star,
  Refresh,
  Search,
  ArrowDown
} from '@element-plus/icons-vue'
import {
  getGitHubArticles,
  getTrendingProjects,
  analyzeProject as analyzeProjectAPI,
  translateText,
  getLanguageStats,
  getScoreStats
} from '@/api/github'

// 响应式数据
const loading = ref(false)
const projects = ref([])
const selectedProjects = ref([])
const searchKeyword = ref('')
const showAnalysisDialog = ref(false)

// 统计数据
const stats = reactive({
  totalProjects: 0,
  translatedProjects: 0,
  analyzedProjects: 0,
  avgScore: 0
})

// 筛选条件
const filters = reactive({
  language: '',
  trending_period: '',
  min_stars: null
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 分析表单
const analysisForm = reactive({
  url: ''
})

// 计算属性
const computedStats = computed(() => {
  const total = projects.value.length
  const translated = projects.value.filter(p => p.github_info?.translated_description).length
  const analyzed = projects.value.filter(p => p.overall_score).length
  const avgScore = analyzed > 0
    ? (projects.value.reduce((sum, p) => sum + (p.overall_score || 0), 0) / analyzed).toFixed(1)
    : 0

  return {
    totalProjects: total,
    translatedProjects: translated,
    analyzedProjects: analyzed,
    avgScore
  }
})

// 方法
const fetchProjects = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filters
    }
    const response = await getGitHubArticles(params)
    if (response.data.success) {
      projects.value = response.data.data.list
      pagination.total = response.data.data.total
      updateStats()
    }
  } catch (error) {
    ElMessage.error('获取项目列表失败')
  } finally {
    loading.value = false
  }
}

const updateStats = () => {
  Object.assign(stats, computedStats.value)
}

const fetchTrendingProjects = async () => {
  loading.value = true
  try {
    const response = await getTrendingProjects({
      period: 'daily',
      limit: 25
    })
    if (response.data.success) {
      ElMessage.success(`成功获取 ${response.data.data.repositories.length} 个热门项目`)
      await fetchProjects()
    }
  } catch (error) {
    ElMessage.error('获取热门项目失败')
  } finally {
    loading.value = false
  }
}

const translateDescription = async (project) => {
  if (!project.github_info?.original_description) {
    ElMessage.warning('该项目没有描述信息')
    return
  }

  try {
    const response = await translateText({
      text: project.github_info.original_description
    })
    if (response.data.success) {
      project.github_info.translated_description = response.data.data.translated
      ElMessage.success('翻译成功')
    }
  } catch (error) {
    ElMessage.error('翻译失败')
  }
}

const analyzeProject = async (project) => {
  if (!project.github_info?.full_name) {
    ElMessage.warning('项目信息不完整')
    return
  }

  const [owner, repo] = project.github_info.full_name.split('/')

  try {
    ElMessage.info('正在分析项目，请稍候...')
    const response = await analyzeProjectAPI(owner, repo)
    if (response.data.success) {
      project.overall_score = response.data.data.analysis.overall_score
      project.analysis_info = response.data.data.analysis
      ElMessage.success('分析完成')
      updateStats()
    }
  } catch (error) {
    ElMessage.error('分析失败')
  }
}

const handleAnalyzeProject = async () => {
  if (!analysisForm.url) {
    ElMessage.warning('请输入项目地址')
    return
  }

  const match = analysisForm.url.match(/github\.com\/([^\/]+)\/([^\/]+)/)
  if (!match) {
    ElMessage.error('请输入有效的GitHub项目地址')
    return
  }

  const [, owner, repo] = match
  await analyzeProject({ github_info: { full_name: `${owner}/${repo}` } })
  showAnalysisDialog.value = false
  analysisForm.url = ''
}

const handleFilterChange = () => {
  pagination.page = 1
  fetchProjects()
}

const handleSearch = () => {
  pagination.page = 1
  fetchProjects()
}

const handleSelectionChange = (selection) => {
  selectedProjects.value = selection
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  fetchProjects()
}

const handleCurrentChange = (page) => {
  pagination.page = page
  fetchProjects()
}

const viewProject = (project) => {
  window.open(`/articles/github/${project.github_info.full_name}`, '_blank')
}

const editProject = (project) => {
  // 跳转到编辑页面
  console.log('编辑项目:', project)
}

const handleCommand = async (command, project) => {
  switch (command) {
    case 'translate':
      await translateDescription(project)
      break
    case 'analyze':
      await analyzeProject(project)
      break
    case 'refresh':
      await fetchProjects()
      break
    case 'delete':
      await handleDelete(project)
      break
  }
}

const handleDelete = async (project) => {
  try {
    await ElMessageBox.confirm('确定要删除这个项目吗？', '确认删除', {
      type: 'warning'
    })
    // 调用删除API
    ElMessage.success('删除成功')
    await fetchProjects()
  } catch (error) {
    // 用户取消删除
  }
}

const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

// 生命周期
onMounted(() => {
  fetchProjects()
})
</script>

<style scoped>
.github-projects {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  position: relative;
  overflow: hidden;
}

.stat-content {
  position: relative;
  z-index: 2;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.stat-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 40px;
  color: #e4e7ed;
  z-index: 1;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.left-actions {
  display: flex;
  gap: 12px;
}

.right-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.project-list {
  margin-bottom: 20px;
}

.project-name {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-link {
  color: #409eff;
  text-decoration: none;
  font-weight: 500;
}

.project-link:hover {
  text-decoration: underline;
}

.language-tag {
  align-self: flex-start;
}

.description {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.original-desc {
  color: #606266;
  font-size: 13px;
  line-height: 1.4;
}

.translated-desc {
  color: #303133;
  font-size: 14px;
  line-height: 1.4;
  padding: 8px;
  background: #f0f9ff;
  border-left: 3px solid #409eff;
  border-radius: 4px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .action-bar {
    flex-direction: column;
    gap: 16px;
  }

  .left-actions,
  .right-actions {
    width: 100%;
    justify-content: center;
  }

  .right-actions {
    flex-wrap: wrap;
  }
}
</style>