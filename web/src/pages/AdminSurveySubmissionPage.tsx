import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { fetchSurveySubmission } from '../api/client'
import { formatDateTime } from '../lib/format'
import { isAdmin } from '../lib/permissions'
import type { SubmissionDetail, User } from '../types'

interface AdminSurveySubmissionPageProps {
  user: User | null
  authReady: boolean
}

const TYPE_LABELS: Record<string, string> = {
  single: '单选题',
  multi: '多选题',
  text: '单行填空',
  textarea: '多行填空',
}

export function AdminSurveySubmissionPage({ user, authReady }: AdminSurveySubmissionPageProps) {
  const { id, sid } = useParams<{ id: string; sid: string }>()
  const surveyId = Number(id)
  const submissionId = Number(sid)

  const [detail, setDetail] = useState<SubmissionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAdmin(user)) return
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchSurveySubmission(surveyId, submissionId)
        if (!cancelled) {
          setDetail(data)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '提交明细加载失败')
          setLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user, surveyId, submissionId])

  // 认证未就绪前不判定角色守卫，避免 admin 被误判弹回首页
  if (!authReady) {
    return <div className="py-20 text-center text-gray-400 text-sm">正在加载...</div>
  }

  if (!isAdmin(user)) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="py-7">
      <div className="flex items-end justify-between border-b border-[#e5e7eb] pb-2">
        <h2 className="inline-block text-xl pb-1.5 border-b-2 border-gray-800 font-semibold">
          提交明细
        </h2>
        <Link
          to={`/admin/surveys/${surveyId}?tab=submissions`}
          className="text-[13px] px-3 py-1 rounded border border-gray-300 text-gray-600 hover:border-gray-400 hover:no-underline"
        >
          返回提交列表
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400 text-sm">正在加载提交明细...</div>
      ) : error || !detail ? (
        <div className="py-20 text-center text-gray-400 text-sm">{error || '提交明细不存在'}</div>
      ) : (
        <>
          <div className="text-[13px] text-gray-500 mt-3">
            <span className="font-medium text-gray-700">{detail.username || '匿名'}</span>
            <span className="before:content-[' · ']">
              提交于 {formatDateTime(detail.created_at)}
            </span>
            {detail.updated_at !== detail.created_at && (
              <span className="before:content-[' · ']">
                更新于 {formatDateTime(detail.updated_at)}
              </span>
            )}
            {detail.submitter_ip && (
              <span className="before:content-[' · ']">IP {detail.submitter_ip}</span>
            )}
          </div>

          <div className="flex flex-col gap-4 mt-5">
            {detail.answers.map((a, index) => (
              <div key={a.question_id} className="border border-[#e5e7eb] rounded p-4">
                <h3 className="text-[14px] font-semibold text-gray-800">
                  {index + 1}. {a.question_title}
                  <span className="ml-2 text-[11px] font-normal text-gray-400">
                    {TYPE_LABELS[a.type] ?? a.type}
                  </span>
                </h3>
                <div className="mt-2 text-[13.5px] text-gray-700 whitespace-pre-wrap">
                  {a.type === 'text' || a.type === 'textarea' ? (
                    a.value_text ? (
                      a.value_text
                    ) : (
                      <span className="text-gray-400">（未填写）</span>
                    )
                  ) : a.value_options.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {a.value_options.map((opt) => (
                        <li key={opt}>{opt}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-400">（未选择）</span>
                  )}
                </div>
              </div>
            ))}
            {detail.answers.length === 0 && (
              <div className="py-10 text-center text-gray-400 text-sm">该提交没有任何答案</div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
