import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowDown,
  ArrowUp,
  Download,
  Plus,
  Trash2,
} from 'lucide-react'
import {
  createSurvey,
  deleteSurveySubmission,
  exportSurveySubmissions,
  fetchAdminSurvey,
  fetchSurveyStats,
  fetchSurveySubmissions,
  updateSurvey,
} from '../api/client'
import { formatDateTime } from '../lib/format'
import { isAdmin } from '../lib/permissions'
import type {
  QuestionType,
  SurveyQuestionStat,
  SurveyStats,
  SurveySubmission,
  User,
} from '../types'

interface AdminSurveyEditPageProps {
  user: User | null
  authReady: boolean
}

type TabKey = 'edit' | 'submissions' | 'stats'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'edit', label: '题目编辑' },
  { key: 'submissions', label: '回答' },
  { key: 'stats', label: '统计' },
]

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'single', label: '单选题' },
  { value: 'multi', label: '多选题' },
  { value: 'text', label: '单行填空' },
  { value: 'textarea', label: '多行填空' },
]

const SUBMISSION_PAGE_SIZE = 20

let questionKeySeq = 1

interface DraftQuestion {
  key: number
  title: string
  type: QuestionType
  required: boolean
  options: string[]
}

function createDraftQuestion(): DraftQuestion {
  return { key: questionKeySeq++, title: '', type: 'single', required: false, options: [''] }
}

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function AdminSurveyEditPage({ user, authReady }: AdminSurveyEditPageProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = id === undefined
  const surveyId = isNew ? 0 : Number(id)

  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const tab: TabKey =
    tabParam === 'submissions' || tabParam === 'stats' ? tabParam : 'edit'

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [deadline, setDeadline] = useState('')
  const [questions, setQuestions] = useState<DraftQuestion[]>([createDraftQuestion()])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submissionCount, setSubmissionCount] = useState(0)

  // ---- 问卷基本信息与题目加载（编辑模式，走管理端点） ----
  useEffect(() => {
    if (isNew) return
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchAdminSurvey(surveyId)
        if (cancelled) return
        setTitle(data.title)
        setDescription(data.description)
        setIsPublic(data.is_public)
        setDeadline(toDatetimeLocal(data.deadline))
        setSubmissionCount(data.submission_count ?? 0)
        setQuestions(
          data.questions
            .slice()
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((q) => ({
              key: questionKeySeq++,
              title: q.title,
              type: q.type,
              required: q.required,
              options: q.options.length > 0 ? [...q.options] : [''],
            }))
        )
        setLoading(false)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '问卷加载失败')
          setLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, isNew, surveyId])

  // ---- 回答 tab 数据 ----
  const [submissions, setSubmissions] = useState<SurveySubmission[]>([])
  const [submissionsTotal, setSubmissionsTotal] = useState(0)
  const [submissionsPage, setSubmissionsPage] = useState(1)
  const [submissionsLoading, setSubmissionsLoading] = useState(false)

  useEffect(() => {
    if (isNew || tab !== 'submissions') return
    let cancelled = false
    ;(async () => {
      setSubmissionsLoading(true)
      try {
        const res = await fetchSurveySubmissions(surveyId, submissionsPage, SUBMISSION_PAGE_SIZE)
        if (!cancelled) {
          setSubmissions(res.items ?? [])
          setSubmissionsTotal(res.total ?? 0)
          setSubmissionsLoading(false)
        }
      } catch {
        if (!cancelled) {
          setError('提交列表加载失败')
          setSubmissionsLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, isNew, surveyId, tab, submissionsPage])

  // ---- 统计 tab 数据 ----
  const [stats, setStats] = useState<SurveyStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)

  useEffect(() => {
    if (isNew || tab !== 'stats') return
    let cancelled = false
    ;(async () => {
      setStatsLoading(true)
      try {
        const res = await fetchSurveyStats(surveyId)
        if (!cancelled) {
          setStats(res)
          setStatsLoading(false)
        }
      } catch {
        if (!cancelled) {
          setError('统计数据加载失败')
          setStatsLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, isNew, surveyId, tab])

  // 认证未就绪前不判定角色守卫，避免 admin 被误判弹回首页
  if (!authReady) {
    return <div className="py-20 text-center text-gray-400 text-sm">正在加载...</div>
  }

  if (!isAdmin(user)) {
    return <Navigate to="/" replace />
  }

  // ---- 题目编辑器操作 ----
  const updateQuestion = (key: number, patch: Partial<DraftQuestion>) => {
    setQuestions((prev) => prev.map((q) => (q.key === key ? { ...q, ...patch } : q)))
  }

  const moveQuestion = (index: number, delta: number) => {
    setQuestions((prev) => {
      const target = index + delta
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      const [item] = next.splice(index, 1)
      next.splice(target, 0, item)
      return next
    })
  }

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index))
  }

  const addQuestion = () => {
    setQuestions((prev) => [...prev, createDraftQuestion()])
  }

  // ---- 保存 ----
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('问卷标题不能为空')
      return
    }
    const payloadQuestions = questions
      .map((q, index) => ({
        title: q.title.trim(),
        type: q.type,
        required: q.required,
        options:
          q.type === 'single' || q.type === 'multi'
            ? q.options.map((o) => o.trim()).filter((o) => o !== '')
            : [],
        sort_order: index + 1,
      }))
      .filter((q) => q.title !== '')
    if (payloadQuestions.length === 0) {
      setError('请至少添加一道题目')
      return
    }

    setSaving(true)
    setError('')
    setNotice('')
    try {
      const body = {
        title: title.trim(),
        description: description.trim(),
        is_public: isPublic,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        questions: payloadQuestions,
      }
      if (isNew) {
        await createSurvey(body)
        navigate('/admin/surveys')
      } else {
        await updateSurvey(surveyId, body)
        setNotice('保存成功')
        setSaving(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
      setSaving(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    setError('')
    try {
      await exportSurveySubmissions(surveyId)
    } catch (err) {
      setError(err instanceof Error ? err.message : '导出失败')
    } finally {
      setExporting(false)
    }
  }

  const handleDeleteSubmission = async (submission: SurveySubmission) => {
    if (!window.confirm(`确认删除 ${submission.username} 的这条提交记录？`)) return
    setError('')
    try {
      await deleteSurveySubmission(surveyId, submission.id)
      const res = await fetchSurveySubmissions(surveyId, submissionsPage, SUBMISSION_PAGE_SIZE)
      setSubmissions(res.items ?? [])
      setSubmissionsTotal(res.total ?? 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败')
    }
  }

  const submissionsTotalPages = Math.max(1, Math.ceil(submissionsTotal / SUBMISSION_PAGE_SIZE))
  const questionsLocked = !isNew && submissionCount > 0

  return (
    <div className="py-7">
      <div className="flex items-end justify-between border-b border-[#e5e7eb] pb-2">
        <h2 className="inline-block text-xl pb-1.5 border-b-2 border-gray-800 font-semibold">
          {isNew ? '新建问卷' : '编辑问卷'}
        </h2>
        <div className="flex items-center gap-2">
          {!isNew && (
            <button
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center gap-1 text-[13px] px-3 py-1 rounded border border-gray-300 text-gray-600 hover:border-[#0f766e] hover:text-[#0f766e] transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {exporting ? '正在导出...' : '导出 CSV'}
            </button>
          )}
          <Link
            to="/admin/surveys"
            className="text-[13px] px-3 py-1 rounded border border-gray-300 text-gray-600 hover:border-gray-400 hover:no-underline"
          >
            返回列表
          </Link>
        </div>
      </div>

      {!isNew && (
        <div className="flex gap-1 mt-4 border-b border-[#e5e7eb]">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setSearchParams(t.key === 'edit' ? {} : { tab: t.key })}
              className={`px-4 py-2 text-[13.5px] border-b-2 -mb-px transition-colors cursor-pointer ${
                tab === t.key
                  ? 'border-[#0f766e] text-[#0f766e] font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="my-4 p-3 rounded bg-red-50 border border-red-200 text-red-600 text-xs">
          {error}
        </div>
      )}
      {notice && (
        <div className="my-4 p-3 rounded bg-[#f0fdfa] border border-[#99f6e4] text-[#0f766e] text-xs">
          {notice}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-gray-400 text-sm">正在加载问卷...</div>
      ) : tab === 'edit' ? (
        <form onSubmit={handleSave} className="flex flex-col gap-5 mt-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="survey-title" className="text-xs font-medium text-gray-600">
              问卷标题 *
            </label>
            <input
              id="survey-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入问卷标题..."
              required
              className="px-3 py-2 rounded border border-gray-300 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0f766e]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="survey-description" className="text-xs font-medium text-gray-600">
              问卷描述
            </label>
            <textarea
              id="survey-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="向填写者说明问卷用途..."
              className="w-full px-3 py-2 rounded border border-gray-300 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0f766e] leading-relaxed"
            />
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="accent-[#0f766e]"
              />
              公开问卷（未登录也可查看填写）
            </label>
            <div className="flex items-center gap-2">
              <label htmlFor="survey-deadline" className="text-[13px] text-gray-700">
                截止时间
              </label>
              <input
                id="survey-deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="px-3 py-1.5 rounded border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#0f766e]"
              />
              {deadline && (
                <button
                  type="button"
                  onClick={() => setDeadline('')}
                  className="text-[12px] text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  清除
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">题目（{questions.length}）</span>
              <button
                type="button"
                onClick={addQuestion}
                disabled={questionsLocked}
                className="inline-flex items-center gap-1 text-[12.5px] px-2.5 py-1 rounded border border-[#0f766e] text-[#0f766e] hover:bg-[#0f766e] hover:text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default"
              >
                <Plus className="w-3.5 h-3.5" />
                添加题目
              </button>
            </div>
            {questionsLocked && (
              <div className="p-3 rounded bg-amber-50 border border-amber-200 text-amber-700 text-xs">
                已有 {submissionCount} 份提交，题目已锁定：修改题目会使历史统计失真；如需改题请关闭后新建问卷。
              </div>
            )}
            <fieldset disabled={questionsLocked} className="contents">
            {questions.map((q, index) => (
              <div key={q.key} className="border border-[#e5e7eb] rounded p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-gray-700 w-14 shrink-0">
                    第 {index + 1} 题
                  </span>
                  <input
                    type="text"
                    value={q.title}
                    onChange={(e) => updateQuestion(q.key, { title: e.target.value })}
                    placeholder="题目标题..."
                    className="flex-1 px-3 py-1.5 rounded border border-gray-300 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0f766e]"
                  />
                  <button
                    type="button"
                    title="上移"
                    disabled={index === 0}
                    onClick={() => moveQuestion(index, -1)}
                    className="p-1.5 rounded border border-gray-300 text-gray-500 hover:border-[#0f766e] hover:text-[#0f766e] cursor-pointer disabled:opacity-30 disabled:cursor-default"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    title="下移"
                    disabled={index === questions.length - 1}
                    onClick={() => moveQuestion(index, 1)}
                    className="p-1.5 rounded border border-gray-300 text-gray-500 hover:border-[#0f766e] hover:text-[#0f766e] cursor-pointer disabled:opacity-30 disabled:cursor-default"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    title="删除本题"
                    onClick={() => removeQuestion(index)}
                    className="p-1.5 rounded border border-red-200 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-5">
                  <div className="flex items-center gap-2">
                    <label className="text-[12.5px] text-gray-500">题型</label>
                    <select
                      value={q.type}
                      onChange={(e) =>
                        updateQuestion(q.key, { type: e.target.value as QuestionType })
                      }
                      className="px-2.5 py-1.5 rounded border border-gray-300 text-[13px] text-gray-700 focus:outline-none focus:border-[#0f766e] cursor-pointer"
                    >
                      {QUESTION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <label className="flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={(e) => updateQuestion(q.key, { required: e.target.checked })}
                      className="accent-[#0f766e]"
                    />
                    必填
                  </label>
                </div>

                {(q.type === 'single' || q.type === 'multi') && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12.5px] text-gray-500">
                      选项（每行一个，留空的行会被忽略）
                    </label>
                    <textarea
                      value={q.options.join('\n')}
                      onChange={(e) =>
                        updateQuestion(q.key, { options: e.target.value.split('\n') })
                      }
                      rows={Math.max(3, q.options.length + 1)}
                      placeholder={'选项 1\n选项 2\n选项 3'}
                      className="w-full px-3 py-2 rounded border border-gray-300 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0f766e] leading-relaxed"
                    />
                  </div>
                )}
              </div>
            ))}
            </fieldset>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded bg-[#0f766e] hover:bg-[#0d5f59] text-sm font-semibold text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving ? '正在保存...' : isNew ? '创建问卷' : '保存修改'}
            </button>
          </div>
        </form>
      ) : tab === 'submissions' ? (
        <SubmissionsPanel
          submissions={submissions}
          loading={submissionsLoading}
          page={submissionsPage}
          totalPages={submissionsTotalPages}
          total={submissionsTotal}
          onPageChange={setSubmissionsPage}
          onDelete={handleDeleteSubmission}
        />
      ) : (
        <StatsPanel stats={stats} loading={statsLoading} />
      )}
    </div>
  )
}

// ---------- 回答 tab ----------

interface SubmissionsPanelProps {
  submissions: SurveySubmission[]
  loading: boolean
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
  onDelete: (submission: SurveySubmission) => void
}

function SubmissionsPanel({
  submissions,
  loading,
  page,
  totalPages,
  total,
  onPageChange,
  onDelete,
}: SubmissionsPanelProps) {
  if (loading) {
    return <div className="py-14 text-center text-gray-400 text-sm">正在加载提交列表...</div>
  }
  if (submissions.length === 0) {
    return <div className="py-14 text-center text-gray-400 text-sm">暂无提交记录</div>
  }
  return (
    <div className="mt-5">
      <ul className="list-none">
        {submissions.map((s) => (
          <li
            key={s.id}
            className="py-3 border-b border-[#e5e7eb] flex items-center justify-between gap-3 flex-wrap"
          >
            <div className="text-[13px] text-gray-700">
              <span className="font-medium">{s.username || '匿名'}</span>
              <span className="before:content-[' · '] text-gray-400">
                {formatDateTime(s.created_at)}
              </span>
              {s.submitter_ip && (
                <span className="before:content-[' · '] text-gray-400">IP {s.submitter_ip}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[12.5px]">
              <Link
                to={`submissions/${s.id}`}
                className="px-2.5 py-1 rounded border border-gray-300 text-gray-600 hover:border-[#0f766e] hover:text-[#0f766e] hover:no-underline transition-colors"
              >
                查看明细
              </Link>
              <button
                onClick={() => onDelete(s)}
                className="px-2.5 py-1 rounded border border-red-200 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors cursor-pointer"
              >
                删除
              </button>
            </div>
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 text-[13px] text-gray-500">
          <span>
            共 {total} 条 · 第 {page} / {totalPages} 页
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="px-3 py-1 rounded border border-gray-300 text-gray-600 cursor-pointer disabled:opacity-40 disabled:cursor-default hover:border-gray-400"
            >
              上一页
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 rounded border border-gray-300 text-gray-600 cursor-pointer disabled:opacity-40 disabled:cursor-default hover:border-gray-400"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------- 统计 tab（纯 CSS 条形图） ----------

function StatsPanel({ stats, loading }: { stats: SurveyStats | null; loading: boolean }) {
  if (loading) {
    return <div className="py-14 text-center text-gray-400 text-sm">正在加载统计数据...</div>
  }
  if (!stats) {
    return <div className="py-14 text-center text-gray-400 text-sm">统计数据不可用</div>
  }
  return (
    <div className="mt-5 flex flex-col gap-6">
      <p className="text-[13px] text-gray-500">共收集 {stats.total_submissions} 份提交。</p>
      {stats.questions.map((q, index) => (
        <QuestionStatsCard key={q.question_id} question={q} index={index} />
      ))}
    </div>
  )
}

function QuestionStatsCard({
  question,
  index,
}: {
  question: SurveyQuestionStat
  index: number
}) {
  const isChoice = question.type === 'single' || question.type === 'multi'
  return (
    <div className="border border-[#e5e7eb] rounded p-4">
      <h3 className="text-[14.5px] font-semibold text-gray-800">
        {index + 1}. {question.title}
        {question.required && <span className="text-red-500 ml-0.5">*</span>}
        <span className="ml-2 text-[11px] font-normal text-gray-400">
          {QUESTION_TYPES.find((t) => t.value === question.type)?.label ?? question.type}
        </span>
      </h3>

      {isChoice ? (
        <div className="flex flex-col gap-2 mt-3">
          {question.options.map((opt) => (
            <div key={opt.label} className="flex items-center gap-3 text-[13px]">
              <span className="w-36 shrink-0 truncate text-gray-700" title={opt.label}>
                {opt.label}
              </span>
              <div className="flex-1 h-4 rounded bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-[#0f766e] rounded transition-[width]"
                  style={{ width: `${Math.min(100, opt.percent)}%` }}
                />
              </div>
              <span className="w-20 shrink-0 text-right text-gray-500">
                {opt.count} 票 · {opt.percent}%
              </span>
            </div>
          ))}
          {question.options.length === 0 && (
            <p className="text-[13px] text-gray-400">本题暂无选项数据</p>
          )}
        </div>
      ) : (
        <div className="mt-3">
          {question.text_answers.length === 0 ? (
            <p className="text-[13px] text-gray-400">暂无回答</p>
          ) : (
            <ul className="list-none flex flex-col gap-1.5">
              {question.text_answers.map((answer, i) => (
                <li
                  key={i}
                  className="px-3 py-2 rounded bg-gray-50 border border-[#e5e7eb] text-[13px] text-gray-700 whitespace-pre-wrap"
                >
                  {answer}
                </li>
              ))}
            </ul>
          )}
          {question.text_truncated && (
            <p className="mt-2 text-[12px] text-gray-400">仅显示前 100 条，更多请导出 CSV 查看</p>
          )}
        </div>
      )}
    </div>
  )
}
