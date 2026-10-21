import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchWikiPage } from '../api/client'
import { MarkdownContent } from '../components/MarkdownContent'
import { formatDateTime } from '../lib/format'
import type { User, WikiPage } from '../types'

interface WikiPageViewProps {
  user: User | null
}

export function WikiPageView({ user }: WikiPageViewProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [page, setPage] = useState<WikiPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchWikiPage(Number(id))
        if (!cancelled) {
          setPage(data)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '页面加载失败')
          setLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return <div className="py-20 text-center text-gray-400 text-sm">正在加载页面...</div>
  }

  if (error || !page) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500 text-sm mb-4">{error || '页面不存在'}</p>
        <Link to="/wiki" className="text-[#0f766e] hover:underline text-sm">
          ← 返回 Wiki 列表
        </Link>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="border-b border-[#e5e7eb] pb-3 mb-5">
        <h1 className="text-2xl leading-[1.4] font-bold text-gray-800">{page.title}</h1>
        <div className="flex flex-wrap items-center justify-between gap-2 mt-1.5">
          <div className="text-[13px] text-gray-500">
            <span>最后编辑 {formatDateTime(page.updated_at)}</span>
            <span className="before:content-[' · ']">{page.updated_by}</span>
            <span className="before:content-[' · ']">共 {page.revision_count} 次修订</span>
          </div>
          <div className="flex gap-2">
            {user && (
              <button
                onClick={() => navigate(`/wiki/${page.id}/edit`)}
                className="text-[12.5px] px-3 py-0.5 border border-gray-200 rounded bg-gray-50 text-gray-700 hover:border-[#0f766e] hover:text-[#0f766e] transition-colors cursor-pointer"
              >
                编辑
              </button>
            )}
            <button
              onClick={() => navigate(`/wiki/${page.id}/history`)}
              className="text-[12.5px] px-3 py-0.5 border border-gray-200 rounded bg-gray-50 text-gray-700 hover:border-[#0f766e] hover:text-[#0f766e] transition-colors cursor-pointer"
            >
              历史
            </button>
          </div>
        </div>
      </div>

      <MarkdownContent content={page.content} />

      <Link to="/wiki" className="inline-block mt-6 text-sm text-[#0f766e] hover:underline">
        ← 返回 Wiki 列表
      </Link>
    </div>
  )
}
