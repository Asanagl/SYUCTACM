// 文章分类（与后端枚举一致）；编辑器与本文件共用
export type ArticleCategory = 'news' | 'notice' | 'senior' | 'contest'

// 全站统一的文章分类标签（新闻/通知/薪火相传/选拔赛），列表页、详情页、管理页共用
export const CATEGORY_LABELS: Record<string, string> = {
  news: '新闻',
  notice: '通知',
  senior: '薪火相传',
  contest: '选拔赛',
}

// 筛选下拉（含「全部」）
export const CATEGORY_FILTER_OPTIONS: { key: string; label: string }[] = [
  { key: '', label: '全部' },
  { key: 'news', label: CATEGORY_LABELS.news },
  { key: 'notice', label: CATEGORY_LABELS.notice },
  { key: 'senior', label: CATEGORY_LABELS.senior },
  { key: 'contest', label: CATEGORY_LABELS.contest },
]

// 编辑器分类选项
export const CATEGORY_OPTIONS: { value: ArticleCategory; label: string }[] = [
  { value: 'news', label: CATEGORY_LABELS.news },
  { value: 'notice', label: CATEGORY_LABELS.notice },
  { value: 'senior', label: CATEGORY_LABELS.senior },
  { value: 'contest', label: CATEGORY_LABELS.contest },
]
