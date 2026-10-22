import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { FilePenLine, Pin, PinOff, Plus, Trash2 } from 'lucide-react'
import { deleteArticle, fetchArticles, updateArticle } from '../api/client'
import { formatDateTime } from '../lib/format'
import { isAdmin } from '../lib/permissions'
import type { Article, User } from '../types'

const PAGE_SIZE = 20

const CATEGORIES = [
  { key: '', label: '全部' },
  { key: 'news', label: '新闻' },
  { key: 'notice', label: '通知' },
  { key: 'senior', label: '薪火相传' },
  { key: 'contest', label: '选拔赛' },
]

const CATEGORY_LABELS: Record<string, string> = {
  news: '新闻',
  notice: '通知',
  senior: '薪火相传',
  contest: '选拔赛',
}

interface AdminArticleListPageProps {
  user: User | null
  authReady: boolean
}

export function AdminArticleListPage({ user, authReady }: AdminArticleListPageProps) {
  const [category, setCategory] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [articles, setArticles] = useState<Article[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')

  // 标题搜索 300ms 防抖
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 300)
    return () => {
      window.clearTimeout(timer)
    }
  }, [searchInput])

  useEffect(() => {
    if (!isAdmin(user)) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetchArticles({
          category: category || undefined,
          search: search || undefined,
          page,
          page_size: PAGE_SIZE,
        })
        if (!cancelled) {
          setArticles(res.items ?? [])
          setTotal(res.total ?? 0)
          setError('')
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          setError('文章列表加载失败，请稍后重试')
          setLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user, category, search, page])

  // 认证未就绪前不判定角色守卫，避免 admin 被误判弹回首页
  if (!authReady) {
    return <div className="py-20 text-center text-gray-400 text-sm">正在加载...</div>
  }

  if (!isAdmin(user)) {
    return <Navigate to="/" replace />
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const handleTogglePin = async (article: Article) => {
    setActionError('')
    try {
      await updateArticle(article.id, { ...article, is_pinned: !article.is_pinned })
      setArticles((prev) =>
        prev.map((a) => (a.id === article.id ? { ...a, is_pinned: !a.is_pinned } : a))
      )
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '置顶状态切换失败')
    }
  }

  const handleDelete = async (article: Article) => {
    if (!window.confirm(`确定要删除文章「${article.title}」吗？此操作不可逆。`)) return
    setActionError('')
    try {
      await deleteArticle(article.id)
      if (articles.length === 1 && page > 1) {
        setPage(page - 1)
      } else {
        setArticles((prev) => prev.filter((a) => a.id !== article.id))
        setTotal((t) => Math.max(0, t - 1))
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '删除失败')
    }
  }

  return (
    <div className="py-7">
      <div className="flex items-end justify-between border-b border-[#e5e7eb] pb-2">
        <h2 className="inline-block text-xl pb-1.5 border-b-2 border-gray-800 font-semibold">
          文章管理
        </h2>
        <Link
          to="/admin/articles/new"
          className="inline-flex items-center gap-1 text-[13px] px-3 py-1 rounded border border-[#0f766e] text-[#0f766e] hover:bg-[#0f766e] hover:text-white hover:no-underline transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          新建文章
        </Link>
      </div>
      <p className="text-[13px] text-gray-500 my-2.5 mb-1">
        创建、编辑、置顶与删除文章，管理首页文章列表内容。
      </p>

      {/* 工具条：分类筛选 + 标题搜索 */}
      <div className="flex items-center gap-3 my-3 flex-wrap">
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value)
            setPage(1)
          }}
          className="px-3 py-1.5 rounded border border-gray-300 text-[13px] text-gray-700 focus:outline-none focus:border-[#0f766e]"
        >
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="按标题搜索..."
          className="flex-1 min-w-[200px] px-3 py-1.5 rounded border border-gray-300 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0f766e]"
        />
      </div>

      {actionError && (
        <div className="my-3 p-3 rounded bg-red-50 border border-red-200 text-red-600 text-xs">
          {actionError}
        </div>
      )}

      {loading ? (
        <div className="py-14 text-center text-gray-400 text-sm">正在加载文章列表...</div>
      ) : error ? (
        <div className="py-14 text-center text-gray-400 text-sm">{error}</div>
      ) : articles.length === 0 ? (
        <div className="py-14 text-center text-gray-400 text-sm">
          {search ? '没有匹配的文章' : '暂无文章，点击右上角「新建文章」创建'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="text-left text-gray-400 border-b border-[#e5e7eb]">
                <th className="py-2 pr-3 font-normal">标题</th>
                <th className="py-2 pr-3 font-normal w-20">分类</th>
                <th className="py-2 pr-3 font-normal w-14">置顶</th>
                <th className="py-2 pr-3 font-normal w-28">作者</th>
                <th className="py-2 pr-3 font-normal w-32">创建时间</th>
                <th className="py-2 font-normal w-44">操作</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="border-b border-[#e5e7eb] align-top">
                  <td className="py-2.5 pr-3">
                    <Link
                      to={`/article/${article.id}`}
                      className="text-gray-800 font-medium hover:text-[#0f766e] hover:no-underline"
                    >
                      {article.title}
                    </Link>
                  </td>
                  <td className="py-2.5 pr-3 text-gray-500">
                    {CATEGORY_LABELS[article.category] ?? article.category}
                  </td>
                  <td className="py-2.5 pr-3">
                    {article.is_pinned ? (
                      <span className="inline-block text-[11px] text-[#0f766e] border border-[#0f766e] rounded px-1.5 py-0">
                        置顶
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-3 text-gray-500">{article.author_name || '—'}</td>
                  <td className="py-2.5 pr-3 text-gray-500">
                    {formatDateTime(article.created_at)}
                  </td>
                  <td className="py-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Link
                        to={`/admin/articles/${article.id}/edit`}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-300 text-gray-600 hover:border-[#0f766e] hover:text-[#0f766e] hover:no-underline transition-colors"
                      >
                        <FilePenLine className="w-3 h-3" />
                        编辑
                      </Link>
                      <button
                        onClick={() => handleTogglePin(article)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-300 text-gray-600 hover:border-[#0f766e] hover:text-[#0f766e] transition-colors cursor-pointer"
                      >
                        {article.is_pinned ? (
                          <>
                            <PinOff className="w-3 h-3" />
                            取消置顶
                          </>
                        ) : (
                          <>
                            <Pin className="w-3 h-3" />
                            置顶
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(article)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded border border-red-200 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && articles.length > 0 && (
        <div className="flex items-center justify-between pt-4 text-[13px] text-gray-500">
          <span>
            共 {total} 条 · 第 {page} / {totalPages} 页
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="px-3 py-1 rounded border border-gray-300 text-gray-600 cursor-pointer disabled:opacity-40 disabled:cursor-default hover:border-gray-400"
            >
              上一页
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
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
