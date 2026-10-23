import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchSurveys } from '../api/client'
import { formatDateTime } from '../lib/format'
import type { Survey } from '../types'

const STATUS_LABELS: Record<Survey['status'], string> = {
  draft: '草稿',
  published: '进行中',
  closed: '已结束',
}

const STATUS_STYLES: Record<Survey['status'], string> = {
  draft: 'border-gray-300 text-gray-500',
  published: 'border-[#0f766e] text-[#0f766e]',
  closed: 'border-gray-300 text-gray-400',
}

const PAGE_SIZE = 20

export function SurveyListPage() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetchSurveys(page, PAGE_SIZE)
        if (!cancelled) {
          setSurveys(res.items ?? [])
          setTotal(res.total ?? 0)
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          setError('问卷列表加载失败，请稍后重试')
          setLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [page])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="py-7">
      <div className="flex items-end justify-between border-b border-[#e5e7eb] pb-2">
        <h2 className="inline-block text-xl pb-1.5 border-b-2 border-gray-800 font-semibold">
          问卷
        </h2>
      </div>
      <p className="text-[13px] text-gray-500 my-2.5 mb-1">
        集训队问卷收集：报名统计、训练反馈与事项调查。未登录访客仅可查看并填写公开问卷。
      </p>

      {loading ? (
        <div className="py-14 text-center text-gray-400 text-sm">正在加载问卷列表...</div>
      ) : error ? (
        <div className="py-14 text-center text-gray-400 text-sm">{error}</div>
      ) : surveys.length === 0 ? (
        <div className="py-14 text-center text-gray-400 text-sm">暂无进行中的问卷</div>
      ) : (
        <>
          <ul className="list-none">
            {surveys.map((survey) => (
              <li key={survey.id} className="py-3.5 border-b border-[#e5e7eb]">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-[15.5px] font-semibold">
                    <Link
                      to={`/surveys/${survey.id}`}
                      className="text-gray-800 hover:text-[#0f766e] hover:no-underline"
                    >
                      {survey.title}
                    </Link>
                  </h3>
                  <span
                    className={`px-1.5 rounded text-[11px] border ${STATUS_STYLES[survey.status]}`}
                  >
                    {STATUS_LABELS[survey.status]}
                  </span>
                  {!survey.is_public && (
                    <span className="px-1.5 rounded text-[11px] border border-amber-500 text-amber-600">
                      内部
                    </span>
                  )}
                </div>
                {survey.description && (
                  <p className="text-[13px] text-gray-500 mt-1 line-clamp-2">{survey.description}</p>
                )}
                <div className="text-[12.5px] text-gray-400 mt-1">
                  {survey.deadline ? (
                    <span>截止时间 {formatDateTime(survey.deadline)}</span>
                  ) : (
                    <span>长期有效</span>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 text-[13px] text-gray-500">
              <span>
                共 {total} 份 · 第 {page} / {totalPages} 页
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 rounded border border-gray-300 text-gray-600 cursor-pointer disabled:opacity-40 disabled:cursor-default hover:border-gray-400"
                >
                  上一页
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1 rounded border border-gray-300 text-gray-600 cursor-pointer disabled:opacity-40 disabled:cursor-default hover:border-gray-400"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
