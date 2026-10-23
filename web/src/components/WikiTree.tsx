import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { fetchWikiTree } from '../api/client'
import { groupWikiTree } from '../lib/wikiTree'
import type { WikiTreeItem } from '../types'

interface WikiTreeProps {
  currentId?: number
  canCreate: boolean
  // 传入则由外部（如正文页的 prev/next 计算）负责拉取；不传则自行拉取
  items?: WikiTreeItem[]
}

export function WikiTree({ currentId, canCreate, items }: WikiTreeProps) {
  // 外部传入 items 时直接用（父组件可能异步到达）；未传入才自行拉取，避免把 props 镜像进 state 后不同步
  const [fetchedTree, setFetchedTree] = useState<WikiTreeItem[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (items) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetchWikiTree()
        if (!cancelled) {
          setFetchedTree(res.items ?? [])
        }
      } catch {
        if (!cancelled) {
          setError('页面树加载失败')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [items])

  const tree = items ?? fetchedTree

  if (error) {
    return <div className="py-4 text-[13px] text-gray-400">{error}</div>
  }
  if (tree === null) {
    return <div className="py-4 text-[13px] text-gray-400">正在加载页面树...</div>
  }

  const groups = groupWikiTree(tree)

  return (
    <aside className="wiki-tree border-b border-[#e5e7eb] pb-3.5 md:border-b-0 md:pb-0">
      {groups.map((g) => (
        <details key={g.group || '__ungrouped'} open>
          <summary>{g.group === '' ? '未分组' : g.group}</summary>
          <ul>
            {g.pages.map((page) => (
              <li key={page.id}>
                <Link to={`/wiki/${page.id}`} className={page.id === currentId ? 'current' : ''}>
                  {page.title}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      ))}
      {canCreate && (
        <Link to="/wiki/new" className="new-page">
          <Plus className="inline-block h-3.5 w-3.5 -mt-0.5 mr-0.5" />
          新建页面
        </Link>
      )}
    </aside>
  )
}
