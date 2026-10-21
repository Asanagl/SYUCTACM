import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchWikiRevision } from '../api/client'
import { MarkdownContent } from '../components/MarkdownContent'
import { formatDateTime } from '../lib/format'
import type { WikiRevisionDetail } from '../types'

export function WikiRevisionPage() {
  const { id, rid } = useParams<{ id: string; rid: string }>()
  const [revision, setRevision] = useState<WikiRevisionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id || !rid) return
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchWikiRevision(Number(id), Number(rid))
        if (!cancelled) {
          setRevision(data)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '该版本加载失败')
          setLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, rid])

  if (loading) {
    return <div className="py-20 text-center text-gray-400 text-sm">正在加载该版本...</div>
  }

  if (error || !revision) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500 text-sm mb-4">{error || '该版本不存在'}</p>
        <Link to={`/wiki/${id}/history`} className="text-[#0f766e] hover:underline text-sm">
          ← 返回修订历史
        </Link>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="border-b border-[#e5e7eb] pb-3 mb-5">
        <h1 className="text-2xl leading-[1.4] font-bold text-gray-800">{revision.title}</h1>
        <div className="text-[13px] text-gray-500 mt-1.5">
          <span className="font-mono">r{revision.id}</span>
          <span className="before:content-[' · ']">{formatDateTime(revision.created_at)}</span>
          <span className="before:content-[' · ']">{revision.editor}</span>
          <span className="before:content-[' · '] text-gray-400">历史只读版本</span>
        </div>
      </div>

      <MarkdownContent content={revision.content} />

      <div className="mt-6 flex gap-5">
        <Link
          to={`/wiki/${revision.page_id}/history`}
          className="text-sm text-[#0f766e] hover:underline"
        >
          ← 返回修订历史
        </Link>
        <Link to={`/wiki/${revision.page_id}`} className="text-sm text-[#0f766e] hover:underline">
          查看当前版本 →
        </Link>
      </div>
    </div>
  )
}
