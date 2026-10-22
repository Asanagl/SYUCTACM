import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Eye, Save } from 'lucide-react'
import { createArticle, fetchArticle, updateArticle } from '../api/client'
import { MarkdownContent } from '../components/MarkdownContent'
import { isAdmin } from '../lib/permissions'
import type { User } from '../types'

type ArticleCategory = 'news' | 'notice' | 'senior' | 'contest'

interface AdminArticleEditPageProps {
  user: User | null
  authReady: boolean
}

const inputClass =
  'px-3 py-2 rounded border border-gray-300 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0f766e]'
const labelClass = 'text-xs font-medium text-gray-600'

export function AdminArticleEditPage({ user, authReady }: AdminArticleEditPageProps) {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const editingId = id ? Number(id) : null

  const [loaded, setLoaded] = useState(editingId === null)
  const [loadError, setLoadError] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<ArticleCategory>('news')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [isPinned, setIsPinned] = useState(false)
  const [authorName, setAuthorName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // 编辑模式：按 :id 拉取文章回填
  useEffect(() => {
    if (editingId === null || !isAdmin(user)) return
    let cancelled = false
    ;(async () => {
      try {
        const article = await fetchArticle(editingId)
        if (!cancelled) {
          setTitle(article.title)
          setCategory(article.category)
          setSummary(article.summary)
          setContent(article.content)
          setIsPinned(article.is_pinned)
          setAuthorName(article.author_name ?? '')
          setLoaded(true)
        }
      } catch {
        if (!cancelled) {
          setLoadError('文章加载失败，请稍后重试')
          setLoaded(true)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [editingId, user])

  // 认证未就绪前不判定角色守卫，避免 admin 被误判弹回首页
  if (!authReady) {
    return <div className="py-20 text-center text-gray-400 text-sm">正在加载...</div>
  }

  if (!isAdmin(user)) {
    return <Navigate to="/" replace />
  }

  if (!loaded) {
    return <div className="py-20 text-center text-gray-400 text-sm">正在加载文章...</div>
  }

  if (loadError) {
    return <div className="py-20 text-center text-gray-400 text-sm">{loadError}</div>
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

    const payload = {
      title,
      category,
      summary,
      content,
      is_pinned: isPinned,
      author_name: authorName,
    }

    try {
      setSaving(true)
      setError('')
      if (editingId !== null) {
        await updateArticle(editingId, payload)
      } else {
        await createArticle(payload)
      }
      navigate('/admin/articles')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="py-7">
      <div className="border-b border-[#e5e7eb] pb-2">
        <h2 className="inline-block text-xl pb-1.5 border-b-2 border-gray-800 font-semibold">
          {editingId !== null ? '编辑文章' : '新建文章'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        {error && (
          <div className="p-3 rounded bg-red-50 border border-red-200 text-red-600 text-xs">
            {error}
          </div>
        )}

        {/* 标题 & 分类 */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-3 flex flex-col gap-1.5">
            <label className={labelClass}>文章标题 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入文章标题..."
              className={inputClass}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>分类</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ArticleCategory)}
              className={inputClass}
            >
              <option value="news">新闻动态</option>
              <option value="notice">集训通知</option>
              <option value="contest">竞赛喜报</option>
              <option value="senior">薪火相传</option>
            </select>
          </div>
        </div>

        {/* 作者 & 置顶 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>署名作者</label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="留空则默认当前用户，例如：集训队新闻组、14届 陈明"
              className={inputClass}
            />
          </div>
          <div className="flex items-center gap-2 sm:pt-6">
            <input
              type="checkbox"
              id="isPinnedCheck"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 rounded accent-[#0f766e]"
            />
            <label htmlFor="isPinnedCheck" className="text-xs font-medium text-gray-600 cursor-pointer">
              置顶该文章到首页顶部
            </label>
          </div>
        </div>

        {/* 摘要 */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>摘要简介 (1~2 句话)</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
            placeholder="简要概括文章主要内容..."
            className={inputClass}
          />
        </div>

        {/* 正文：左侧编辑，右侧实时预览 */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>正文内容 (支持 Markdown) *</label>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={16}
              placeholder="在此输入 Markdown 正文内容..."
              className="w-full px-3 py-2.5 rounded border border-gray-300 text-sm font-mono text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0f766e] leading-relaxed resize-y"
              required
            />
            <div className="w-full p-4 rounded border border-[#e5e7eb] text-sm min-h-[280px] max-h-[480px] overflow-y-auto bg-gray-50">
              <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-2">
                <Eye className="w-3 h-3" />
                实时预览
              </div>
              {content.trim() ? (
                <MarkdownContent content={content} />
              ) : (
                <span className="text-gray-400">暂无内容</span>
              )}
            </div>
          </div>
        </div>

        {/* 提交 */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e5e7eb]">
          <button
            type="button"
            onClick={() => navigate('/admin/articles')}
            className="px-4 py-2 rounded border border-gray-300 text-xs text-gray-600 hover:border-gray-400 transition-colors cursor-pointer"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2 rounded bg-[#0f766e] hover:bg-[#0d5f59] text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? '正在保存...' : '保存并发布'}
          </button>
        </div>
      </form>
    </div>
  )
}
