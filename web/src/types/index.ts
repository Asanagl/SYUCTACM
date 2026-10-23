export interface User {
  id: number
  username: string
  nickname: string
  email: string
  role: 'admin' | 'member' | 'guest'
  student_number?: string
  grade?: string
  major?: string
}

export interface WikiPageSummary {
  id: number
  title: string
  group_name: string
  created_by: string
  updated_by: string
  created_at: string
  updated_at: string
  revision_count: number
}

export interface WikiTreeItem {
  id: number
  title: string
  group_name: string
}

export interface WikiPage extends WikiPageSummary {
  content: string
}

export interface WikiRevision {
  id: number
  page_id: number
  title: string
  editor: string
  created_at: string
}

export interface WikiRevisionDetail extends WikiRevision {
  content: string
}

export interface PagedResult<T> {
  total: number
  page?: number
  page_size?: number
  items: T[]
}

export interface Article {
  id: number
  title: string
  slug?: string
  category: 'news' | 'notice' | 'senior' | 'contest'
  summary: string
  content: string
  is_pinned: boolean
  view_count: number
  author_id?: number
  author_name: string
  created_at: string
  updated_at: string
}

// ---------- 问卷 ----------

export type SurveyStatus = 'draft' | 'published' | 'closed'

export type QuestionType = 'single' | 'multi' | 'text' | 'textarea'

export interface Survey {
  id: number
  title: string
  description: string
  is_public: boolean
  status: SurveyStatus
  deadline: string | null
  created_at: string
}

export interface Question {
  id: number
  title: string
  type: QuestionType
  required: boolean
  options: string[]
  sort_order: number
}

export interface SurveyDetail extends Survey {
  questions: Question[]
}

export interface SurveyAnswerInput {
  question_id: number
  value_text?: string
  value_options?: string[]
}

export interface MySubmissionAnswer {
  question_id: number
  value_text: string
  value_options: string[]
}

export interface MySurveySubmission {
  id: number
  created_at: string
  updated_at: string
  answers: MySubmissionAnswer[]
}

export interface AdminSurveySummary extends Survey {
  submission_count: number
}

// 管理端单卷详情：结构同公开 detail，附带提交数（用于编辑保护与展示）
export interface AdminSurveyDetail extends SurveyDetail {
  submission_count: number
}

export interface SurveyQuestionInput {
  title: string
  type: QuestionType
  required: boolean
  options: string[]
  sort_order: number
}

export interface SurveyInput {
  title: string
  description: string
  is_public: boolean
  deadline?: string
  questions: SurveyQuestionInput[]
}

export interface SurveySubmission {
  id: number
  user_id?: number
  username: string
  submitter_ip: string
  created_at: string
  updated_at: string
}

export interface SubmissionAnswer {
  question_id: number
  question_title: string
  type: QuestionType
  value_text: string
  value_options: string[]
}

export interface SubmissionDetail extends SurveySubmission {
  answers: SubmissionAnswer[]
}

export interface SurveyOptionStat {
  label: string
  count: number
  percent: number
}

export interface SurveyQuestionStat {
  question_id: number
  title: string
  type: QuestionType
  required: boolean
  options: SurveyOptionStat[]
  text_answers: string[]
  // 填空题原文超过 100 条时后端截断并置 true；字段不存在表示未截断（向后兼容）
  text_truncated?: boolean
}

export interface SurveyStats {
  total_submissions: number
  questions: SurveyQuestionStat[]
}

export interface WeatherInfo {
  temperature: number
  text: string
  fetched_at: string
  cached: boolean
}
