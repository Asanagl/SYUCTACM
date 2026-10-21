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
  created_by: string
  updated_by: string
  created_at: string
  updated_at: string
  revision_count: number
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
