import React, { useMemo } from 'react'
import { X, Calendar, User, Eye, Tag, BookOpen, ListOrdered } from 'lucide-react'
import { marked } from 'marked'
import type { Article } from '../types'

interface ArticleDetailModalProps {
  article: Article | null
  onClose: () => void
}

interface TocItem {
  id: string
  text: string
  level: number
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({
  article,
  onClose,
}) => {
  if (!article) return null

  // Parse HTML and extract headings for Table of Contents
  const { html, toc } = useMemo(() => {
    if (!article.content) return { html: '', toc: [] }

    const tocList: TocItem[] = []
    const renderer = new marked.Renderer()

    renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
      const cleanText = text.replace(/<[^>]*>?/gm, '')
      const id = `heading-${cleanText.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')}`
      if (depth <= 3) {
        tocList.push({ id, text: cleanText, level: depth })
      }
      return `<h${depth} id="${id}" class="scroll-mt-20 font-bold ${
        depth === 1 ? 'text-2xl mt-8 mb-4 border-b border-slate-700 pb-2 text-white' : depth === 2 ? 'text-xl mt-6 mb-3 text-teal-300' : 'text-base mt-4 mb-2 text-slate-200'
      }">${text}</h${depth}>`
    }

    marked.setOptions({ renderer, breaks: true, gfm: true })
    const parsed = marked.parse(article.content) as string

    return { html: parsed, toc: tocList }
  }, [article.content])

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`
    } catch {
      return dateStr
    }
  }

  const handleTocClick = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#0c141d] border border-slate-700/80 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0e1823]">
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400">
            <BookOpen className="w-4 h-4" />
            <span>文章详情 · 文档阅读</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 2-column or 3-column Layout */}
        <div className="flex-1 overflow-y-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Article Content (8 or 9 cols) */}
          <div className="lg:col-span-9 flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight leading-snug">
              {article.title}
            </h1>

            {/* Meta tags */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono mt-4 pb-4 border-b border-slate-800">
              <span className="flex items-center gap-1.5 text-teal-300">
                <Tag className="w-3.5 h-3.5" />
                {article.category}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(article.created_at)}
              </span>
              {article.author_name && (
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  {article.author_name}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-slate-500">
                <Eye className="w-3.5 h-3.5" />
                {article.view_count} 次阅读
              </span>
            </div>

            {/* Summary callout */}
            {article.summary && (
              <div className="my-5 p-4 rounded-lg bg-slate-900/80 border-l-4 border-teal-500 text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                {article.summary}
              </div>
            )}

            {/* Markdown Rendered Content */}
            <div
              className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed space-y-4 font-light [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_blockquote]:border-l-4 [&_blockquote]:border-teal-500/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-400 [&_code]:bg-slate-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-teal-300 [&_code]:text-xs [&_pre]:bg-slate-950 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_a]:text-teal-400 [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>

          {/* Right TOC Sidebar (3 cols on lg) */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-4 p-4 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-teal-400 uppercase tracking-wider mb-3">
                <ListOrdered className="w-4 h-4" />
                目录大纲 (TOC)
              </div>
              {toc.length === 0 ? (
                <span className="text-slate-500">无标题导航</span>
              ) : (
                <nav className="flex flex-col gap-1.5 max-h-[60vh] overflow-y-auto pr-1">
                  {toc.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTocClick(item.id)}
                      className={`text-left text-slate-300 hover:text-teal-300 transition-colors truncate cursor-pointer ${
                        item.level === 1 ? 'font-semibold text-white' : item.level === 2 ? 'pl-2 text-slate-300' : 'pl-4 text-slate-400'
                      }`}
                    >
                      {item.text}
                    </button>
                  ))}
                </nav>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#0e1823] flex items-center justify-between text-xs text-slate-400">
          <span>沈阳化工大学 ACM-ICPC 集训队文档系统</span>
          <button
            onClick={onClose}
            className="px-4 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}
