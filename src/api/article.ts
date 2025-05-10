import request from '../utils/request';

// 文章列表接口参数类型
export interface ArticleQueryParams {
  keyword?: string;
  status?: string;
  source?: string;
  dateRange?: string[];
  page?: number;
  pageSize?: number;
}

// 文章详情类型
export interface ArticleData {
  id?: number;
  title: string;
  source: string;
  category_id?: number;
  tags?: string;
  author?: string;
  summary?: string;
  thumbnail?: string;
  content: string;
  read_count?: number;
  like_count?: number;
  comment_count?: number;
  status: string;
  is_top?: number;
  is_recommend?: number;
  publish_time?: string;
  collect_time?: string;
  update_time?: string;
  seo_title?: string;
  seo_keywords?: string;
  seo_description?: string;
  created_at?: string;
}

// 后端实际返回的API响应结构
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// 后端实际返回的分页响应结构
export interface PageResult<T> {
  page: number;
  pageSize: number;
  total: number;
  list: T[];
}

// 获取文章列表
export function getArticleList(params: ArticleQueryParams) {
  return request.get<any, ApiResponse<PageResult<ArticleData>>>('/api/articles/list', { params });
}

// 获取文章详情
export function getArticleDetail(id: number) {
  return request.get<any, ApiResponse<ArticleData>>(`/api/articles/detail/${id}?no_read=1`);
}

// 创建文章
export function createArticle(data: ArticleData) {
  return request.post<any, ApiResponse<ArticleData>>('/api/articles/create', data);
}

// 更新文章
export function updateArticle(id: number, data: ArticleData) {
  return request.post<any, ApiResponse<ArticleData>>(`/api/articles/edit/${id}`, data);
}

// 删除文章
export function deleteArticle(id: number) {
  return request.post<any, ApiResponse<null>>(`/api/articles/delete/${id}`);
} 