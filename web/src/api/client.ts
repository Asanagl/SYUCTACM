import type {
  AdminSurveyDetail,
  AdminSurveySummary,
  Article,
  MySurveySubmission,
  PagedResult,
  SubmissionDetail,
  Survey,
  SurveyAnswerInput,
  SurveyDetail,
  SurveyInput,
  SurveyStats,
  SurveySubmission,
  User,
  WikiPage,
  WikiPageSummary,
  WikiRevision,
  WikiRevisionDetail,
  WikiTreeItem,
} from '../types'

const TOKEN_KEY = 'syuctacm_token'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {})
  headers.set('Content-Type', 'application/json')

  const token = getToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(path, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData: { error?: string } = await response.json().catch(() => ({}))
    throw new ApiError(response.status, errorData.error || `请求失败 (${response.status})`)
  }

  return response.json()
}

export interface FetchArticlesOptions {
  category?: string
  search?: string
  page?: number
  page_size?: number
}

export async function fetchArticles(
  options: FetchArticlesOptions = {}
): Promise<{ total: number; items: Article[] }> {
  const params = new URLSearchParams()
  if (options.category) params.set('category', options.category)
  if (options.search) params.set('search', options.search)
  if (options.page) params.set('page', String(options.page))
  if (options.page_size) params.set('page_size', String(options.page_size))
  const query = params.toString()
  return request<{ total: number; items: Article[] }>(`/api/v1/articles${query ? `?${query}` : ''}`)
}

export async function fetchArticle(id: number, opts?: { manage?: boolean }): Promise<Article> {
  const suffix = opts?.manage ? '?manage=1' : ''
  return request<Article>(`/api/v1/articles/${id}${suffix}`)
}

export async function createArticle(data: {
  title: string
  category: string
  summary: string
  content: string
  is_pinned: boolean
  author_name?: string
}): Promise<{ message: string; data: Article }> {
  return request<{ message: string; data: Article }>('/api/v1/articles', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateArticle(
  id: number,
  data: Partial<Article>
): Promise<{ message: string; data: Article }> {
  return request<{ message: string; data: Article }>(`/api/v1/articles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteArticle(id: number): Promise<{ message: string }> {
  return request<{ message: string }>(`/api/v1/articles/${id}`, {
    method: 'DELETE',
  })
}

export async function loginUser(credentials: {
  username: string
  password: string
}): Promise<{ token: string; user: User }> {
  const data = await request<{ token: string; user: User }>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
  setToken(data.token)
  return data
}

export async function registerUser(userData: {
  username: string
  password: string
  nickname: string
  email?: string
  student_number?: string
  grade?: string
}): Promise<{ token: string; user: User }> {
  const data = await request<{ token: string; user: User }>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  })
  setToken(data.token)
  return data
}

export async function fetchMe(): Promise<{ user: User }> {
  return request<{ user: User }>('/api/v1/auth/me')
}

export async function fetchWikiPages(page = 1, pageSize = 50): Promise<PagedResult<WikiPageSummary>> {
  return request<PagedResult<WikiPageSummary>>(
    `/api/v1/wiki?page=${page}&page_size=${pageSize}`
  )
}

export async function fetchWikiPage(id: number): Promise<WikiPage> {
  return request<WikiPage>(`/api/v1/wiki/${id}`)
}

export async function createWikiPage(data: {
  title: string
  content: string
  group_name?: string
}): Promise<WikiPage> {
  return request<WikiPage>('/api/v1/wiki', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateWikiPage(
  id: number,
  data: { title: string; content: string; group_name?: string }
): Promise<WikiPage> {
  return request<WikiPage>(`/api/v1/wiki/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteWikiPage(id: number): Promise<{ message: string }> {
  return request<{ message: string }>(`/api/v1/wiki/${id}`, {
    method: 'DELETE',
  })
}

export async function fetchWikiTree(): Promise<{ items: WikiTreeItem[] }> {
  return request<{ items: WikiTreeItem[] }>('/api/v1/wiki/tree')
}

export async function fetchWikiRevisions(id: number): Promise<PagedResult<WikiRevision>> {
  return request<PagedResult<WikiRevision>>(`/api/v1/wiki/${id}/revisions`)
}

export async function fetchWikiRevision(id: number, rid: number): Promise<WikiRevisionDetail> {
  return request<WikiRevisionDetail>(`/api/v1/wiki/${id}/revisions/${rid}`)
}

export async function revertWikiPage(id: number, rid: number): Promise<WikiPage> {
  return request<WikiPage>(`/api/v1/wiki/${id}/revert/${rid}`, {
    method: 'POST',
  })
}

// ---------- 问卷（用户侧） ----------

export async function fetchSurveys(page = 1, pageSize = 20): Promise<PagedResult<Survey>> {
  return request<PagedResult<Survey>>(`/api/v1/surveys?page=${page}&page_size=${pageSize}`)
}

export async function fetchSurvey(id: number): Promise<SurveyDetail> {
  return request<SurveyDetail>(`/api/v1/surveys/${id}`)
}

export async function submitSurvey(
  id: number,
  answers: SurveyAnswerInput[]
): Promise<{ message: string }> {
  return request<{ message: string }>(`/api/v1/surveys/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  })
}

// 未提交过时后端返回 404，此处归一化为 null
export async function fetchMySurveySubmission(id: number): Promise<MySurveySubmission | null> {
  try {
    return await request<MySurveySubmission>(`/api/v1/surveys/${id}/my`)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}

// ---------- 问卷（管理侧） ----------

export async function fetchAdminSurveys(): Promise<{ total: number; items: AdminSurveySummary[] }> {
  return request<{ total: number; items: AdminSurveySummary[] }>('/api/v1/admin/surveys')
}

// 管理端单卷详情（含题目与提交数），编辑页加载结构用，不依赖公开端点的可见性规则
export async function fetchAdminSurvey(id: number): Promise<AdminSurveyDetail> {
  return request<AdminSurveyDetail>(`/api/v1/admin/surveys/${id}`)
}

export async function createSurvey(data: SurveyInput): Promise<{ message: string }> {
  return request<{ message: string }>('/api/v1/admin/surveys', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateSurvey(id: number, data: SurveyInput): Promise<{ message: string }> {
  return request<{ message: string }>(`/api/v1/admin/surveys/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function updateSurveyStatus(
  id: number,
  action: 'publish' | 'close' | 'reopen'
): Promise<{ message: string }> {
  return request<{ message: string }>(`/api/v1/admin/surveys/${id}/status`, {
    method: 'POST',
    body: JSON.stringify({ action }),
  })
}

export async function fetchSurveySubmissions(
  id: number,
  page = 1,
  pageSize = 20
): Promise<PagedResult<SurveySubmission>> {
  return request<PagedResult<SurveySubmission>>(
    `/api/v1/admin/surveys/${id}/submissions?page=${page}&page_size=${pageSize}`
  )
}

export async function fetchSurveySubmission(id: number, sid: number): Promise<SubmissionDetail> {
  return request<SubmissionDetail>(`/api/v1/admin/surveys/${id}/submissions/${sid}`)
}

export async function deleteSurveySubmission(id: number, sid: number): Promise<{ message: string }> {
  return request<{ message: string }>(`/api/v1/admin/surveys/${id}/submissions/${sid}`, {
    method: 'DELETE',
  })
}

export async function fetchSurveyStats(id: number): Promise<SurveyStats> {
  return request<SurveyStats>(`/api/v1/admin/surveys/${id}/stats`)
}

// CSV 导出：走原始 fetch（response 是文件流而非 JSON），文件名取自 Content-Disposition
export async function exportSurveySubmissions(id: number): Promise<void> {
  const headers = new Headers()
  const token = getToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`/api/v1/admin/surveys/${id}/export`, { headers })
  if (!response.ok) {
    const errorData: { error?: string } = await response.json().catch(() => ({}))
    throw new ApiError(response.status, errorData.error || `导出失败 (${response.status})`)
  }

  const blob = await response.blob()
  const disposition = response.headers.get('Content-Disposition') ?? ''
  const match = /filename\*?=(?:UTF-8''|")?([^";]+)/i.exec(disposition)
  const filename = match
    ? decodeURIComponent(match[1].replace(/"$/, '').trim())
    : `survey-${id}-submissions.csv`

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
