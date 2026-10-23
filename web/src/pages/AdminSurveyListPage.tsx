import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Eye, FilePenLine, Lock, LockOpen, Plus, Send } from 'lucide-react'
import { fetchAdminSurveys, updateSurveyStatus } from '../api/client'
import { formatDateTime } from '../lib/format'
import { isAdmin } from '../lib/permissions'
import type { AdminSurveySummary, SurveyStatus, User } from '../types'

interface AdminSurveyListPageProps {
  user: User | null
  authReady: boolean
}

const STATUS_LABELS: Record<SurveyStatus, string> = {
  draft: '草稿',
  published: '进行中',
  closed: '已关闭',
}

const STATUS_STYLES: Record<SurveyStatus, string> = {
  draft: 'border-gray-300 text-gray-500',
  published: 'border-[#0f766e] text-[#0f766e]',
  closed: 'border-red-300 text-red-500',
}

const ACTION_LABELS: Record<'publish' | 'close' | 'reopen', string> = {
  publish: '发布',
  close: '关闭',
  reopen: '重开',
}

export function AdminSurveyListPage({ user, authReady }: AdminSurveyListPageProps) {
  const [surveys, setSurveys] = useState<AdminSurveySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    if (!isAdmin(user)) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetchAdminSurveys()
        if (!cancelled) {
          setSurveys(res.items ?? [])
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
  }, [user])

  // 认证未就绪前不判定角色守卫，避免 admin 被误判弹回首页
  if (!authReady) {
    return <div className="py-20 text-center text-gray-400 text-sm">正在加载...</div>
  }

  if (!isAdmin(user)) {
    return <Navigate to="/" replace />
  }

  const handleStatus = async (survey: AdminSurveySummary, action: 'publish' | 'close' | 'reopen') => {
    if (!window.confirm(`确认${ACTION_LABELS[action]}问卷「${survey.title}」？`)) return
    setActionError('')
    try {
      await updateSurveyStatus(survey.id, action)
      setSurveys((prev) =>
        prev.map((s) =>
          s.id === survey.id
            ? { ...s, status: action === 'publish' ? 'published' : action === 'close' ? 'closed' : 'published' }
            : s
        )
      )
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '操作失败')
    }
  }

  return (
    <div className="py-7">
      <div className="flex items-end justify-between border-b border-[#e5e7eb] pb-2">
        <h2 className="inline-block text-xl pb-1.5 border-b-2 border-gray-800 font-semibold">
          问卷管理
        </h2>
        <Link
          to="/admin/surveys/new"
          className="inline-flex items-center gap-1 text-[13px] px-3 py-1 rounded border border-[#0f766e] text-[#0f766e] hover:bg-[#0f766e] hover:text-white hover:no-underline transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          新建问卷
        </Link>
      </div>
      <p className="text-[13px] text-gray-500 my-2.5 mb-1">
        创建、发布与关闭问卷，查看提交与统计结果。
      </p>

      {actionError && (
        <div className="my-3 p-3 rounded bg-red-50 border border-red-200 text-red-600 text-xs">
          {actionError}
        </div>
      )}

      {loading ? (
        <div className="py-14 text-center text-gray-400 text-sm">正在加载问卷列表...</div>
      ) : error ? (
        <div className="py-14 text-center text-gray-400 text-sm">{error}</div>
      ) : surveys.length === 0 ? (
        <div className="py-14 text-center text-gray-400 text-sm">暂无问卷，点击右上角「新建问卷」创建</div>
      ) : (
        <ul className="list-none">
          {surveys.map((survey) => (
            <li key={survey.id} className="py-3.5 border-b border-[#e5e7eb]">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-[15.5px] font-semibold text-gray-800">{survey.title}</h3>
                <span className={`px-1.5 rounded text-[11px] border ${STATUS_STYLES[survey.status]}`}>
                  {STATUS_LABELS[survey.status]}
                </span>
                {!survey.is_public && (
                  <span className="px-1.5 rounded text-[11px] border border-amber-500 text-amber-600">
                    内部
                  </span>
                )}
              </div>
              <div className="text-[12.5px] text-gray-400 mt-1">
                <span>提交 {survey.submission_count} 份</span>
                <span className="before:content-[' · ']">
                  {survey.deadline ? `截止 ${formatDateTime(survey.deadline)}` : '长期有效'}
                </span>
                <span className="before:content-[' · ']">创建 {formatDateTime(survey.created_at)}</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-[12.5px]">
                <Link
                  to={`/admin/surveys/${survey.id}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-gray-300 text-gray-600 hover:border-[#0f766e] hover:text-[#0f766e] hover:no-underline transition-colors"
                >
                  <FilePenLine className="w-3.5 h-3.5" />
                  编辑
                </Link>
                {survey.status === 'draft' && (
                  <button
                    onClick={() => handleStatus(survey, 'publish')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#0f766e] text-[#0f766e] hover:bg-[#0f766e] hover:text-white transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    发布
                  </button>
                )}
                {survey.status === 'published' && (
                  <button
                    onClick={() => handleStatus(survey, 'close')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-red-300 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    关闭
                  </button>
                )}
                {survey.status === 'closed' && (
                  <button
                    onClick={() => handleStatus(survey, 'reopen')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-gray-300 text-gray-600 hover:border-[#0f766e] hover:text-[#0f766e] transition-colors cursor-pointer"
                  >
                    <LockOpen className="w-3.5 h-3.5" />
                    重开
                  </button>
                )}
                <Link
                  to={`/admin/surveys/${survey.id}?tab=stats`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-gray-300 text-gray-600 hover:border-[#0f766e] hover:text-[#0f766e] hover:no-underline transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  查看结果
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
