import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchArticle } from '../api/client'
import { MarkdownContent } from '../components/MarkdownContent'
import { CATEGORY_LABELS } from '../lib/categories'
import { formatDate } from '../lib/format'
import type { Article } from '../types'

export function ArticlePage() {
  const { id } = useParams<{ id: string }>()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchArticle(Number(id))
        if (!cancelled) {
          setArticle(data)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '文章加载失败')
          setLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return <div className="py-20 text-center text-gray-400 text-sm">正在加载文章...</div>
  }

  if (error || !article) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500 text-sm mb-4">{error || '文章不存在'}</p>
        <Link to="/" className="text-[#0f766e] hover:underline text-sm">
          ← 返回首页
        </Link>
      </div>
    )
  }

  return (
    <article className="py-9">
      <h1 className="text-[26px] leading-[1.4] font-bold mb-2 text-gray-800">{article.title}</h1>
      <div className="text-[13px] text-gray-500 mb-6">
        <span>{formatDate(article.created_at)}</span>
        <span className="before:content-[' · ']">
          {CATEGORY_LABELS[article.category] ?? article.category}
        </span>
        {article.author_name && <span className="before:content-[' · ']">{article.author_name}</span>}
      </div>

      {article.summary && (
        <div className="mb-6 px-4 py-3 bg-gray-50 border-l-4 border-[#0f766e] text-sm text-gray-600 leading-relaxed">
          {article.summary}
        </div>
      )}

      <MarkdownContent content={article.content} />

      <Link to="/" className="inline-block mt-7 text-sm text-[#0f766e] hover:underline">
        ← 返回文章列表
      </Link>
    </article>
  )
}
