import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError, fetchMySurveySubmission, fetchSurvey, getToken, submitSurvey } from '../api/client'
import { formatDateTime } from '../lib/format'
import type { MySurveySubmission, Question, SurveyDetail } from '../types'

interface AnswerState {
  text: string
  options: string[]
}

function emptyAnswers(questions: Question[]): Record<number, AnswerState> {
  const map: Record<number, AnswerState> = {}
  for (const q of questions) {
    map[q.id] = { text: '', options: [] }
  }
  return map
}

interface SurveyFillPageProps {
  authReady: boolean
}

export function SurveyFillPage({ authReady }: SurveyFillPageProps) {
  const { id } = useParams<{ id: string }>()
  const surveyId = Number(id)

  const [detail, setDetail] = useState<SurveyDetail | null>(null)
  const [existing, setExisting] = useState<MySurveySubmission | null>(null)
  const [answers, setAnswers] = useState<Record<number, AnswerState>>({})
  const [loading, setLoading] = useState(true)
  const [needLogin, setNeedLogin] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submittedOnce, setSubmittedOnce] = useState(false)
  const [now, setNow] = useState(0)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchSurvey(surveyId)
        if (cancelled) return
        setDetail(data)
        setNow(Date.now())
        setAnswers(emptyAnswers(data.questions))
        if (getToken()) {
          try {
            const mine = await fetchMySurveySubmission(surveyId)
            if (cancelled) return
            if (mine) {
              setExisting(mine)
              setAnswers((prev) => {
                const next = { ...prev }
                for (const a of mine.answers) {
                  const q = data.questions.find((qq) => qq.id === a.question_id)
                  if (q && q.type === 'single') {
                    // 单选答案走 value_text，映射回 radio 选中态
                    next[a.question_id] = { text: '', options: a.value_text ? [a.value_text] : [] }
                  } else {
                    next[a.question_id] = {
                      text: a.value_text ?? '',
                      options: a.value_options ?? [],
                    }
                  }
                }
                return next
              })
            }
          } catch {
            // 查询自己的提交失败不阻塞填写
          }
        }
        setLoading(false)
      } catch (err) {
        if (cancelled) return
        if (
          err instanceof ApiError &&
          (err.status === 401 || err.status === 403) &&
          !getToken()
        ) {
          setNeedLogin(true)
        } else if (err instanceof ApiError && err.status === 404) {
          setNotFound(true)
        } else {
          setError(err instanceof Error ? err.message : '问卷加载失败')
        }
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [surveyId])

  const isReadonly = useMemo(() => {
    if (!detail) return false
    if (detail.status !== 'published') return true
    if (now > 0 && detail.deadline && new Date(detail.deadline).getTime() < now) return true
    return false
  }, [detail, now])

  // 认证未就绪前不渲染登录提示/问卷内容，避免「请登录」闪现
  if (!authReady) {
    return <div className="py-20 text-center text-gray-400 text-sm">正在加载...</div>
  }

  if (loading) {
    return <div className="py-20 text-center text-gray-400 text-sm">正在加载问卷...</div>
  }

  if (needLogin) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-600 text-sm">这份问卷仅对登录成员开放。</p>
        <p className="text-gray-400 text-[13px] mt-2">请点击右上角「登录 / 注册」后重新访问本页。</p>
        <Link to="/surveys" className="inline-block mt-5 text-[13px] text-[#0f766e] hover:underline">
          返回问卷列表
        </Link>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-600 text-sm">问卷不存在或已删除。</p>
        <Link to="/surveys" className="inline-block mt-5 text-[13px] text-[#0f766e] hover:underline">
          返回问卷列表
        </Link>
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-500 text-sm">{error || '问卷加载失败'}</p>
        <Link to="/surveys" className="inline-block mt-5 text-[13px] text-[#0f766e] hover:underline">
          返回问卷列表
        </Link>
      </div>
    )
  }

  const setText = (questionId: number, text: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { ...prev[questionId], text } }))
  }

  const toggleSingle = (questionId: number, option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], options: [option] },
    }))
  }

  const toggleMulti = (questionId: number, option: string) => {
    setAnswers((prev) => {
      const current = prev[questionId].options
      const options = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option]
      return { ...prev, [questionId]: { ...prev[questionId], options } }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isReadonly) return

    for (const q of detail.questions) {
      const a = answers[q.id] ?? { text: '', options: [] }
      if (!q.required) continue
      if ((q.type === 'text' || q.type === 'textarea') && !a.text.trim()) {
        setError(`「${q.title}」为必填项`)
        return
      }
      if ((q.type === 'single' || q.type === 'multi') && a.options.length === 0) {
        setError(`「${q.title}」为必填项`)
        return
      }
    }

    setSubmitting(true)
    setError('')
    try {
      const payload = detail.questions.map((q) => {
        const a = answers[q.id] ?? { text: '', options: [] }
        // 单选协议：选中项放 value_text；多选：value_options 数组；填空：value_text
        if (q.type === 'single') {
          return { question_id: q.id, value_text: a.options[0] ?? '' }
        }
        if (q.type === 'text' || q.type === 'textarea') {
          return { question_id: q.id, value_text: a.text.trim() }
        }
        return { question_id: q.id, value_options: a.options }
      })
      const res = await submitSurvey(surveyId, payload)
      setNotice(res.message || '提交成功，感谢参与！')
      setSubmittedOnce(true)
      window.scrollTo({ top: 0 })
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="py-7">
      <div className="border-b border-[#e5e7eb] pb-3 mb-5">
        <h1 className="text-2xl font-bold text-gray-800">{detail.title}</h1>
        {detail.description && (
          <p className="text-[13px] text-gray-500 mt-1.5 whitespace-pre-wrap">{detail.description}</p>
        )}
        <div className="text-[12.5px] text-gray-400 mt-1.5">
          {detail.deadline ? <>截止时间 {formatDateTime(detail.deadline)}</> : <>长期有效</>}
        </div>
      </div>

      {isReadonly && (
        <div className="mb-5 p-3 rounded bg-gray-50 border border-gray-200 text-gray-500 text-[13px]">
          本问卷{detail.status === 'closed' ? '已关闭' : '已过截止时间'}，当前为只读模式，无法提交。
        </div>
      )}

      {!isReadonly && (existing || submittedOnce) && (
        <div className="mb-5 p-3 rounded bg-[#f0fdfa] border border-[#99f6e4] text-[#0f766e] text-[13px]">
          {existing
            ? `你已提交过本问卷（提交于 ${formatDateTime(existing.created_at)}${
                existing.updated_at !== existing.created_at
                  ? `，更新于 ${formatDateTime(existing.updated_at)}`
                  : ''
              }），可修改答案后重新提交。`
            : '你已提交过本问卷，可修改答案后重新提交。'}
        </div>
      )}

      {notice && (
        <div className="mb-5 p-3 rounded bg-[#f0fdfa] border border-[#99f6e4] text-[#0f766e] text-[13px]">
          {notice}
        </div>
      )}

      {error && (
        <div className="mb-5 p-3 rounded bg-red-50 border border-red-200 text-red-600 text-[13px]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {detail.questions.map((q, index) => {
          const a = answers[q.id] ?? { text: '', options: [] }
          return (
            <fieldset
              key={q.id}
              className="border border-[#e5e7eb] rounded p-4 flex flex-col gap-2.5"
            >
              <legend className="text-[14.5px] font-semibold text-gray-800 px-1">
                {index + 1}. {q.title}
                {q.required && <span className="text-red-500 ml-0.5">*</span>}
              </legend>

              {(q.type === 'single' || q.type === 'multi') &&
                q.options.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-2 text-[13.5px] text-gray-700 cursor-pointer"
                  >
                    <input
                      type={q.type === 'single' ? 'radio' : 'checkbox'}
                      name={`q-${q.id}`}
                      value={option}
                      checked={a.options.includes(option)}
                      disabled={isReadonly}
                      onChange={() =>
                        q.type === 'single' ? toggleSingle(q.id, option) : toggleMulti(q.id, option)
                      }
                      className="accent-[#0f766e]"
                    />
                    <span>{option}</span>
                  </label>
                ))}

              {q.type === 'text' && (
                <input
                  type="text"
                  value={a.text}
                  disabled={isReadonly}
                  onChange={(e) => setText(q.id, e.target.value)}
                  placeholder="请输入..."
                  className="w-full px-3 py-2 rounded border border-gray-300 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0f766e] disabled:bg-gray-50"
                />
              )}

              {q.type === 'textarea' && (
                <textarea
                  value={a.text}
                  disabled={isReadonly}
                  onChange={(e) => setText(q.id, e.target.value)}
                  rows={4}
                  placeholder="请输入..."
                  className="w-full px-3 py-2 rounded border border-gray-300 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0f766e] disabled:bg-gray-50 leading-relaxed"
                />
              )}
            </fieldset>
          )
        })}

        {!isReadonly && (
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded bg-[#0f766e] hover:bg-[#0d5f59] text-sm font-semibold text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? '正在提交...' : existing || submittedOnce ? '更新提交' : '提交问卷'}
            </button>
            <Link
              to="/surveys"
              className="px-4 py-2 rounded border border-gray-300 text-[13px] text-gray-600 hover:border-gray-400 hover:no-underline"
            >
              返回列表
            </Link>
          </div>
        )}
      </form>
    </div>
  )
}
