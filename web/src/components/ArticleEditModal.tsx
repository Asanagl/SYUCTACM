import React, { useState, useEffect } from 'react'
import { X, Save, Eye, Edit3 } from 'lucide-react'
import { marked } from 'marked'
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

export const ArticleEditModal: React.FC<ArticleEditModalProps> = ({
  article,
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<'news' | 'notice' | 'senior' | 'contest'>('news')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [isPinned, setIsPinned] = useState(false)
  const [authorName, setAuthorName] = useState('')
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (article) {
      setTitle(article.title || '')
      setCategory(article.category || 'news')
      setSummary(article.summary || '')
      setContent(article.content || '')
      setIsPinned(article.is_pinned || false)
      setAuthorName(article.author_name || '')
    } else {
      setTitle('')
      setCategory('news')
      setSummary('')
      setContent('')
      setIsPinned(false)
      setAuthorName('')
    }
    setError('')
  }, [article, isOpen])

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

  const previewHtml = marked.parse(content || '*暂无内容*') as string

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0c141d] border border-slate-700/80 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0e1823]">
          <h2 className="font-bold text-base text-white flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-teal-400" />
            {article ? '编辑文章' : '发布新文章'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
          {error && (
            <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Title & Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3 flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-300">文章标题 *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="请输入文章标题..."
                className="px-3 py-2 rounded-md bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-300">分类</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as 'news' | 'notice' | 'senior' | 'contest')}
                className="px-3 py-2 rounded-md bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-teal-500"
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
              <label className="text-xs font-medium text-slate-300">署名作者</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="例如：集训队新闻组、14届 陈明"
                className="px-3 py-2 rounded-md bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isPinnedCheck"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="isPinnedCheck" className="text-xs font-medium text-slate-300 cursor-pointer">
                置顶该文章到首页顶部
              </label>
            </div>
          </div>

          {/* Summary */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">摘要简介 (1~2 句话)</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
              placeholder="简要概括文章主要内容..."
              className="px-3 py-2 rounded-md bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Content (Editor / Preview Tabs) */}
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300">正文内容 (支持 Markdown) *</label>
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeTab === 'edit' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  编辑
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                    activeTab === 'preview' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
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
                className="w-full px-3 py-2.5 rounded-md bg-slate-900 border border-slate-700 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 leading-relaxed"
                required
              />
            ) : (
              <div
                className="w-full p-4 rounded-md bg-slate-950 border border-slate-800 text-sm text-slate-300 min-h-[280px] overflow-y-auto space-y-3 font-light"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            )}
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-md bg-teal-600 hover:bg-teal-500 text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-50"
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
