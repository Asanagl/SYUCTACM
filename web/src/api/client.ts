import type { Article, User } from '../types'

const TOKEN_KEY = 'syuctacm_token'

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
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `请求失败 (${response.status})`)
  }

  return response.json()
}

export async function fetchArticles(category?: string): Promise<{ total: number; items: Article[] }> {
  const query = category ? `?category=${encodeURIComponent(category)}` : ''
  return request<{ total: number; items: Article[] }>(`/api/v1/articles${query}`)
}

export async function fetchArticle(id: number): Promise<Article> {
  return request<Article>(`/api/v1/articles/${id}`)
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
