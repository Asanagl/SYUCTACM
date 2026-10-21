import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchWikiPage, fetchWikiRevisions, revertWikiPage } from '../api/client'
import { formatDateTime } from '../lib/format'
import { canWrite } from '../lib/permissions'
import type { User, WikiRevision } from '../types'

interface WikiHistoryPageProps {
  user: User | null
}

export function WikiHistoryPage({ user }: WikiHistoryPageProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [revisions, setRevisions] = useState<WikiRevision[]>([])
  const [pageTitle, setPageTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [revertingId, setRevertingId] = useState<number | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    ;(async () => {
      try {
        const [pageRes, revRes] = await Promise.all([
          fetchWikiPage(Number(id)),
          fetchWikiRevisions(Number(id)),
        ])
        if (!cancelled) {
          setPageTitle(pageRes.title)
          setRevisions(revRes.items ?? [])
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '修订历史加载失败')
          setLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  const handleRevert = async (rid: number) => {
    if (!id) return
    if (!window.confirm('确定要回退到该版本吗？当前内容将被替换，且此操作会记录一次新的修订。')) return
    setRevertingId(rid)
    try {
      const page = await revertWikiPage(Number(id), rid)
      navigate(`/wiki/${page.id}`)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '回退失败')
      setRevertingId(null)
    }
  }

  return (
    <div className="py-8">
      <div className="border-b border-[#e5e7eb] pb-3 mb-5">
        <h1 className="text-2xl font-bold text-gray-800">修订历史</h1>
        {pageTitle && <p className="text-[13px] text-gray-500 mt-1">{pageTitle}</p>}
      </div>

      {loading ? (
        <div className="py-14 text-center text-gray-400 text-sm">正在加载修订历史...</div>
      ) : error ? (
        <div className="py-14 text-center text-gray-400 text-sm">{error}</div>
      ) : revisions.length === 0 ? (
        <div className="py-14 text-center text-gray-400 text-sm">暂无修订记录</div>
      ) : (
        <ul className="list-none">
          {revisions.map((rev) => (
            <li
              key={rev.id}
              className="py-3 border-b border-[#e5e7eb] flex flex-wrap items-center justify-between gap-2"
            >
              <div className="text-sm">
                <span className="font-mono text-gray-400 mr-3">r{rev.id}</span>
                <span className="text-gray-800 font-medium">{rev.title}</span>
                <span className="text-[12.5px] text-gray-500 ml-3">
                  {formatDateTime(rev.created_at)} · {rev.editor}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/wiki/${rev.page_id}/revisions/${rev.id}`)}
                  className="text-[12.5px] px-3 py-0.5 border border-gray-200 rounded bg-gray-50 text-gray-700 hover:border-[#0f766e] hover:text-[#0f766e] transition-colors cursor-pointer"
                >
                  查看
                </button>
                {canWrite(user) && (
                  <button
                    onClick={() => handleRevert(rev.id)}
                    disabled={revertingId !== null}
                    className="text-[12.5px] px-3 py-0.5 border border-gray-200 rounded bg-gray-50 text-gray-700 hover:border-red-500 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {revertingId === rev.id ? '回退中...' : '回退'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {id && (
        <Link
          to={`/wiki/${id}`}
          className="inline-block mt-6 text-sm text-[#0f766e] hover:underline"
        >
          ← 返回 Wiki 页面
        </Link>
      )}
    </div>
  )
}
