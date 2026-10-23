import { useState } from 'react'
import { X, Save, Eye, Edit3 } from 'lucide-react'
import { MarkdownContent } from './MarkdownContent'
import type { Article } from '../types'

interface ArticleEditModalProps {
  article: Article | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    title: string
    category: 'news' | 'notice' | 'senior' | 'contest'
    summary: string
    content: string
    is_pinned: boolean
    author_name?: string
  }) => Promise<void>
}

export function ArticleEditModal({ article, isOpen, onClose, onSave }: ArticleEditModalProps) {
  const [title, setTitle] = useState(article?.title ?? '')
  const [category, setCategory] = useState<'news' | 'notice' | 'senior' | 'contest'>(
    article?.category ?? 'news'
  )
  const [summary, setSummary] = useState(article?.summary ?? '')
  const [content, setContent] = useState(article?.content ?? '')
  const [isPinned, setIsPinned] = useState(article?.is_pinned ?? false)
  const [authorName, setAuthorName] = useState(article?.author_name ?? '')
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

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

    try {
      setSaving(true)
      setError('')
      await onSave({
        title,
        category,
        summary,
        content,
        is_pinned: isPinned,
        author_name: authorName,
      })
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'px-3 py-2 rounded border border-gray-300 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0f766e]'
  const labelClass = 'text-xs font-medium text-gray-600'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white border border-[#e5e7eb] rounded-lg shadow-2xl flex flex-col overflow-hidden text-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
          <h2 className="font-bold text-base text-gray-800 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-[#0f766e]" />
            {article ? '编辑文章' : '发布新文章'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
          {error && (
            <div className="p-3 rounded bg-red-50 border border-red-200 text-red-600 text-xs">
              {error}
            </div>
          )}

          {/* Title & Category Row */}
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
                onChange={(e) => setCategory(e.target.value as 'news' | 'notice' | 'senior' | 'contest')}
                className={inputClass}
              >
                <option value="news">新闻动态</option>
                <option value="notice">集训通知</option>
                <option value="contest">竞赛喜报</option>
                <option value="senior">薪火相传</option>
              </select>
            </div>
          </div>

          {/* Author & Pin Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>署名作者</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="例如：集训队新闻组、14届 陈明"
                className={inputClass}
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
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

          {/* Summary */}
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

          {/* Content (Editor / Preview Tabs) */}
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="flex items-center justify-between">
              <label className={labelClass}>正文内容 (支持 Markdown) *</label>
              <div className="flex items-center gap-1 bg-gray-50 p-0.5 rounded border border-[#e5e7eb] text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    activeTab === 'edit' ? 'bg-[#0f766e] text-white' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  编辑
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer ${
                    activeTab === 'preview' ? 'bg-[#0f766e] text-white' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  预览
                </button>
              </div>
            </div>

            {activeTab === 'edit' ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                placeholder="在此输入 Markdown 正文内容..."
                className="w-full px-3 py-2.5 rounded border border-gray-300 text-sm font-mono text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0f766e] leading-relaxed"
                required
              />
            ) : (
              <div className="w-full p-4 rounded border border-[#e5e7eb] text-sm min-h-[280px] overflow-y-auto bg-gray-50">
                {content.trim() ? (
                  <MarkdownContent content={content} />
                ) : (
                  <span className="text-gray-400">暂无内容</span>
                )}
              </div>
            )}
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e5e7eb]">
            <button
              type="button"
              onClick={onClose}
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
    </div>
  )
}
