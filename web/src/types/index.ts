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
