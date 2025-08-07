import request from '@/utils/request'

// GitHub项目相关接口

/**
 * 获取GitHub热门项目
 */
export const getTrendingProjects = (params: {
  period?: 'daily' | 'weekly' | 'monthly'
  language?: string
  page?: number
  limit?: number
}) => {
  return request({
    url: '/api/github/trending',
    method: 'get',
    params
  })
}

/**
 * 搜索GitHub项目
 */
export const searchProjects = (params: {
  q: string
  page?: number
  limit?: number
  sort?: string
  order?: string
}) => {
  return request({
    url: '/api/github/search',
    method: 'get',
    params
  })
}

/**
 * 获取项目详情
 */
export const getProjectDetail = (owner: string, repo: string) => {
  return request({
    url: `/api/github/repos/${owner}/${repo}`,
    method: 'get'
  })
}

/**
 * 分析项目商业价值
 */
export const analyzeProject = (owner: string, repo: string) => {
  return request({
    url: `/api/analysis/${owner}/${repo}`,
    method: 'get'
  })
}

/**
 * 翻译文本
 */
export const translateText = (data: { text: string }) => {
  return request({
    url: '/api/analysis/translate',
    method: 'post',
    data
  })
}

/**
 * 获取GitHub项目列表（文章形式）
 */
export const getGitHubArticles = (params: {
  page?: number
  pageSize?: number
  language?: string
  min_stars?: number
  trending_period?: string
}) => {
  return request({
    url: '/api/articles/github',
    method: 'get',
    params
  })
}

/**
 * 获取编程语言统计
 */
export const getLanguageStats = () => {
  return request({
    url: '/api/articles/github/languages',
    method: 'get'
  })
}

/**
 * 获取评分分布统计
 */
export const getScoreStats = () => {
  return request({
    url: '/api/articles/github/scores',
    method: 'get'
  })
}

/**
 * 获取GitHub项目详情（文章形式）
 */
export const getGitHubArticleDetail = (owner: string, repo: string) => {
  return request({
    url: `/api/articles/github/${owner}/${repo}`,
    method: 'get'
  })
}