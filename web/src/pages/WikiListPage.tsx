import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { fetchWikiPages } from '../api/client'
import { formatDateTime } from '../lib/format'
import type { User, WikiPageSummary } from '../types'

interface WikiListPageProps {
  user: User | null
}

export function WikiListPage({ user }: WikiListPageProps) {
  const [pages, setPages] = useState<WikiPageSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetchWikiPages()
        if (!cancelled) {
          setPages(res.items ?? [])
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          setError('Wiki 列表加载失败，请稍后重试')
          setLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="py-7">
      <div className="flex items-end justify-between border-b border-[#e5e7eb] pb-2">
        <h2 className="inline-block text-xl pb-1.5 border-b-2 border-gray-800 font-semibold">
          Wiki
        </h2>
        {user && (
          <Link
            to="/wiki/new"
            className="inline-flex items-center gap-1 text-[13px] px-3 py-1 rounded border border-[#0f766e] text-[#0f766e] hover:bg-[#0f766e] hover:text-white hover:no-underline transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            新建页面
          </Link>
        )}
      </div>
      <p className="text-[13px] text-gray-500 my-2.5 mb-1">
        集训队知识库：算法模板、学习路线与培训资料。所有登录成员均可创建与编辑，修改留痕可回退。
      </p>

      {loading ? (
        <div className="py-14 text-center text-gray-400 text-sm">正在加载 Wiki 列表...</div>
      ) : error ? (
        <div className="py-14 text-center text-gray-400 text-sm">{error}</div>
      ) : pages.length === 0 ? (
        <div className="py-14 text-center text-gray-400 text-sm">
          暂无 Wiki 页面{user ? '，点击右上角「新建页面」创建第一篇' : '，登录后可创建'}
        </div>
      ) : (
        <ul className="list-none">
          {pages.map((page) => (
            <li key={page.id} className="py-3 border-b border-[#e5e7eb]">
              <h3 className="text-[15.5px] font-semibold inline">
                <Link
                  to={`/wiki/${page.id}`}
                  className="text-gray-800 hover:text-[#0f766e] hover:no-underline"
                >
                  {page.title}
                </Link>
              </h3>
              <div className="text-[12.5px] text-gray-500 mt-0.5">
                <span>最后编辑 {formatDateTime(page.updated_at)}</span>
                <span className="before:content-[' · ']">{page.updated_by}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
