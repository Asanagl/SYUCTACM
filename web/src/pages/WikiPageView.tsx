import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchWikiPage, fetchWikiTree } from '../api/client'
import { MarkdownContent } from '../components/MarkdownContent'
import { WikiTree } from '../components/WikiTree'
import { formatDateTime } from '../lib/format'
import { canWrite } from '../lib/permissions'
import { extractToc } from '../lib/toc'
import { flattenWikiTree } from '../lib/wikiTree'
import type { User, WikiPage, WikiTreeItem } from '../types'

interface WikiPageViewProps {
  user: User | null
}

export function WikiPageView({ user }: WikiPageViewProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [page, setPage] = useState<WikiPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [treeItems, setTreeItems] = useState<WikiTreeItem[]>([])

  useEffect(() => {
    if (!id) return
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchWikiPage(Number(id))
        if (!cancelled) {
          setPage(data)
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
  }, [id])

  // 拉全量页面树：左侧高亮与底部上一页/下一页共用（失败不阻塞正文展示）
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetchWikiTree()
        if (!cancelled) {
          setTreeItems(res.items ?? [])
        }
      } catch {
        // 忽略：树仅用于导航，正文不依赖
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const toc = useMemo(() => (page ? extractToc(page.content) : []), [page])

  // 树的展平顺序：组按 group_name 字典序、组内按 title；「未分组」排最后
  const flatTree = useMemo(() => flattenWikiTree(treeItems), [treeItems])
  const currentIndex = page ? flatTree.findIndex((item) => item.id === page.id) : -1
  const prevPage = currentIndex > 0 ? flatTree[currentIndex - 1] : undefined
  const nextPage =
    currentIndex >= 0 && currentIndex < flatTree.length - 1
      ? flatTree[currentIndex + 1]
      : undefined

  if (loading) {
    return <div className="py-20 text-center text-gray-400 text-sm">正在加载页面...</div>
  }

  if (error || !page) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500 text-sm mb-4">{error || '页面不存在'}</p>
        <Link to="/wiki" className="text-[#0f766e] hover:underline text-sm">
          ← 返回 Wiki 列表
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-8 py-8 md:grid-cols-[240px_minmax(0,1fr)]">
      <WikiTree currentId={page.id} canCreate={canWrite(user)} items={treeItems} />
      <div className="min-w-0">
        <div className="border-b border-[#e5e7eb] pb-3 mb-5">
          <h1 className="text-2xl leading-[1.4] font-bold text-gray-800">{page.title}</h1>
          <div className="flex flex-wrap items-center justify-between gap-2 mt-1.5">
            <div className="text-[13px] text-gray-500">
              <span>最后编辑 {formatDateTime(page.updated_at)}</span>
              <span className="before:content-[' · ']">{page.updated_by}</span>
              <span className="before:content-[' · ']">共 {page.revision_count} 次修订</span>
            </div>
            <div className="flex gap-2">
              {canWrite(user) && (
                <button
                  onClick={() => navigate(`/wiki/${page.id}/edit`)}
                  className="text-[12.5px] px-3 py-0.5 border border-gray-200 rounded bg-gray-50 text-gray-700 hover:border-[#0f766e] hover:text-[#0f766e] transition-colors cursor-pointer"
                >
                  编辑
                </button>
              )}
              <button
                onClick={() => navigate(`/wiki/${page.id}/history`)}
                className="text-[12.5px] px-3 py-0.5 border border-gray-200 rounded bg-gray-50 text-gray-700 hover:border-[#0f766e] hover:text-[#0f766e] transition-colors cursor-pointer"
              >
                历史
              </button>
            </div>
          </div>
        </div>

        {toc.length > 0 && (
          <nav className="toc">
            <div className="toc-head">📑 目录</div>
            <ul>
              {toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={item.level === 3 ? 'pl-7' : ''}
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <MarkdownContent content={page.content} />

        {(prevPage || nextPage) && (
          <div className="prevnext">
            {prevPage ? (
              <Link
                to={`/wiki/${prevPage.id}`}
                className="text-[#0f766e] hover:underline break-all"
              >
                ← 上一页：{prevPage.title}
              </Link>
            ) : (
              <span />
            )}
            {nextPage ? (
              <Link
                to={`/wiki/${nextPage.id}`}
                className="next text-[#0f766e] hover:underline break-all text-right"
              >
                下一页：{nextPage.title} →
              </Link>
            ) : (
              <span />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
