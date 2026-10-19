import React from 'react'
import { Calendar, Eye, Pin, PlusCircle, Edit3, Trash2, Tag, BookOpen } from 'lucide-react'
import type { Article, User } from '../types'

interface ArticleStreamProps {
  articles: Article[]
  loading: boolean
  currentCategory: string
  user: User | null
  onSelectCategory: (cat: string) => void
  onReadArticle: (article: Article) => void
  onEditArticle: (article: Article) => void
  onDeleteArticle: (id: number) => void
  onCreateArticle: () => void
}

const CATEGORY_MAP: Record<string, { label: string; color: string }> = {
  news: { label: '新闻动态', color: 'bg-teal-500/10 text-teal-300 border-teal-500/30' },
  notice: { label: '集训通知', color: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
  contest: { label: '竞赛喜报', color: 'bg-rose-500/10 text-rose-300 border-rose-500/30' },
  senior: { label: '薪火相传', color: 'bg-sky-500/10 text-sky-300 border-sky-500/30' },
}

export const ArticleStream: React.FC<ArticleStreamProps> = ({
  articles,
  loading,
  currentCategory,
  user,
  onSelectCategory,
  onReadArticle,
  onEditArticle,
  onDeleteArticle,
  onCreateArticle,
}) => {
  const categories = [
    { key: '', label: '全部文章' },
    { key: 'news', label: '新闻动态' },
    { key: 'notice', label: '集训通知' },
    { key: 'contest', label: '竞赛喜报' },
    { key: 'senior', label: '薪火相传' },
  ]

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`
    } catch {
      return dateStr
    }
  }

  return (
    <section id="articles" className="max-w-6xl mx-auto px-4 py-12 relative z-10">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 font-serif">
            <BookOpen className="w-5 h-5 text-teal-400" />
            最新文章
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            沈阳化工大学 ACM 集训队实时动态、竞赛战报与学长经验沉淀
          </p>
        </div>

        {user?.role === 'admin' && (
          <button
            onClick={onCreateArticle}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium transition-colors cursor-pointer self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            发布新文章
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 mt-6">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => onSelectCategory(c.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              currentCategory === c.key
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Articles List */}
      <div className="mt-8 flex flex-col divide-y divide-slate-800/80">
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-sm">正在加载文章列表...</div>
        ) : articles.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">暂无该分类的文章</div>
        ) : (
          articles.map((article) => {
            const catInfo = CATEGORY_MAP[article.category] || {
              label: article.category,
              color: 'bg-slate-800 text-slate-300 border-slate-700',
            }

            return (
              <article key={article.id} className="py-6 group transition-colors">
                <div className="flex flex-col gap-2">
                  {/* Title & Actions */}
                  <div className="flex items-start justify-between gap-4">
                    <h3
                      onClick={() => onReadArticle(article)}
                      className="text-lg md:text-xl font-bold text-teal-400 hover:text-teal-300 transition-colors cursor-pointer flex items-center gap-2.5 flex-wrap"
                    >
                      {article.is_pinned && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          <Pin className="w-3 h-3" />
                          置顶
                        </span>
                      )}
                      <span>{article.title}</span>
                    </h3>

                    {/* Admin Actions */}
                    {user?.role === 'admin' && (
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => onEditArticle(article)}
                          title="编辑文章"
                          className="p-1 rounded text-slate-400 hover:text-sky-300 hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteArticle(article.id)}
                          title="删除文章"
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(article.created_at)}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] border ${catInfo.color}`}>
                      <Tag className="w-2.5 h-2.5 inline mr-1" />
                      {catInfo.label}
                    </span>
                    {article.author_name && (
                      <span>作者: {article.author_name}</span>
                    )}
                    <span className="flex items-center gap-1 text-slate-500">
                      <Eye className="w-3.5 h-3.5" />
                      {article.view_count} 次阅读
                    </span>
                  </div>

                  {/* Summary */}
                  {article.summary && (
                    <p
                      onClick={() => onReadArticle(article)}
                      className="text-xs md:text-sm text-slate-300 leading-relaxed mt-1 line-clamp-2 cursor-pointer font-light"
                    >
                      {article.summary}
                    </p>
                  )}
                </div>
              </article>
            )
          })
        )}
      </div>
    </section>
  )
}
