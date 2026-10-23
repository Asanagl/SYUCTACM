import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { createWikiPage, fetchWikiPage, updateWikiPage } from '../api/client'
import { canWrite } from '../lib/permissions'
import type { User } from '../types'

interface WikiEditPageProps {
  user: User | null
  authReady: boolean
}

export function WikiEditPage({ user, authReady }: WikiEditPageProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = id === undefined

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isNew) return
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchWikiPage(Number(id))
        if (!cancelled) {
          setTitle(data.title)
          setContent(data.content)
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
  }, [id, isNew])

  // 认证未就绪前不判定守卫，避免误判跳转
  if (!authReady) {
    return <div className="py-20 text-center text-gray-400 text-sm">正在加载...</div>
  }

  if (!canWrite(user)) {
    // 未登录与 guest 均无写权限，统一跳回 Wiki 列表
    return <Navigate to="/wiki" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('标题不能为空')
      return
    }
    if (!content.trim()) {
      setError('内容不能为空')
      return
    }
    setSaving(true)
    setError('')
    try {
      const saved = isNew
        ? await createWikiPage({ title: title.trim(), content })
        : await updateWikiPage(Number(id), { title: title.trim(), content })
      navigate(`/wiki/${saved.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="py-20 text-center text-gray-400 text-sm">正在加载页面...</div>
  }

  return (
    <div className="py-8">
      <div className="border-b border-[#e5e7eb] pb-3 mb-5">
        <h1 className="text-2xl font-bold text-gray-800">{isNew ? '新建 Wiki 页面' : '编辑 Wiki 页面'}</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-600 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="wiki-title" className="text-xs font-medium text-gray-600">
            页面标题 *
          </label>
          <input
            id="wiki-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="请输入页面标题..."
            required
            className="px-3 py-2 rounded border border-gray-300 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0f766e]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="wiki-content" className="text-xs font-medium text-gray-600">
            正文内容 (支持 Markdown) *
          </label>
          <textarea
            id="wiki-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            placeholder="在此输入 Markdown 正文内容..."
            required
            className="w-full px-3 py-2.5 rounded border border-gray-300 text-sm font-mono text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0f766e] leading-relaxed"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-1.5 rounded bg-[#0f766e] hover:bg-[#0d5f59] text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? '正在保存...' : '保存'}
          </button>
          <Link
            to={isNew ? '/wiki' : `/wiki/${id}`}
            className="px-4 py-1.5 rounded border border-gray-300 text-xs text-gray-600 hover:border-gray-400 hover:no-underline"
          >
            取消
          </Link>
        </div>
      </form>
    </div>
  )
}
