import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CloudSun } from 'lucide-react'
import { fetchArticles } from '../api/client'
import { CATEGORY_FILTER_OPTIONS as CATEGORIES, CATEGORY_LABELS } from '../lib/categories'
import { formatDate } from '../lib/format'
import type { Article } from '../types'

interface ArticlesLocationState {
  category?: string
  scrollToArticles?: boolean
}

export function HomePage() {
  const location = useLocation()
  const [category, setCategory] = useState<string>(
    () => (location.state as ArticlesLocationState | null)?.category ?? ''
  )
  const [prevLocationState, setPrevLocationState] = useState(location.state)

  // React 文档推荐的「渲染期间调整 state」模式：响应导航 location.state 变化
  if (location.state !== prevLocationState) {
    setPrevLocationState(location.state)
    const state = location.state as ArticlesLocationState | null
    if (state?.category !== undefined) {
      setCategory(state.category)
    }
  }

  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetchArticles({ category: category || undefined })
        if (!cancelled) {
          setArticles(res.items ?? [])
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
  }, [category])

  // 「最新文章 / 薪火相传」导航跳转后滚动到文章区块
  useEffect(() => {
    const state = location.state as ArticlesLocationState | null
    if (state?.scrollToArticles) {
      requestAnimationFrame(() => {
        document.getElementById('articles')?.scrollIntoView({ behavior: 'smooth' })
      })
    }
  }, [location.state])

  return (
    <div className="py-7">
      {/* 组织简介 */}
      <section className="text-justify">
        <p className="text-[15px] leading-[1.85] text-gray-800">
          沈阳化工大学 ACM-ICPC 集训队是由全校程序设计与算法竞赛爱好者自发组织、教练组统一指导的竞技团队，旨在联合全校计算机与数学爱好者，搭建思维与代码交流共享的平台，宣传算法之美，选拔培育代表学校出战 ICPC、CCPC
          及各省高校程序设计大赛的优秀梯队。
        </p>
        <p className="mt-2.5 text-[13px] text-gray-500 flex flex-wrap items-center gap-1.5">
          <CloudSun className="w-3.5 h-3.5" />
          <span>当前天气：沈阳 16.5°C 多云　|　</span>
          <a
            href="https://oj.syuctacm.cn"
            target="_blank"
            rel="noreferrer"
            className="text-[#0f766e] hover:underline"
          >
            Hydro OJ 评测系统
          </a>
          <span>运行中</span>
        </p>
      </section>

      {/* 最新文章 */}
      <section id="articles" className="scroll-mt-20">
        <div className="border-b border-[#e5e7eb] mb-1">
          <h2 className="inline-block text-xl pb-1.5 border-b-2 border-gray-800 font-semibold">
            最新文章
          </h2>
        </div>

        <div className="flex flex-wrap gap-4 text-[13px] py-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`pb-0.5 border-b-2 transition-colors cursor-pointer ${
                category === c.key
                  ? 'text-[#0f766e] font-semibold border-[#0f766e]'
                  : 'text-gray-500 border-transparent hover:text-[#0f766e]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="list-none">
          {loading ? (
            <div className="py-14 text-center text-gray-400 text-sm">正在加载文章列表...</div>
          ) : error ? (
            <div className="py-14 text-center text-gray-400 text-sm">{error}</div>
          ) : articles.length === 0 ? (
            <div className="py-14 text-center text-gray-400 text-sm">暂无该分类的文章</div>
          ) : (
            articles.map((article) => (
              <article key={article.id} className="py-[18px] border-b border-[#e5e7eb]">
                <h3 className="text-[17px] font-semibold flex items-start gap-2 flex-wrap">
                  {article.is_pinned && (
                    <span className="shrink-0 mt-1 inline-block text-[11px] text-[#0f766e] border border-[#0f766e] rounded px-1.5 py-0">
                      置顶
                    </span>
                  )}
                  <Link
                    to={`/article/${article.id}`}
                    className="text-gray-800 hover:text-[#0f766e] hover:no-underline"
                  >
                    {article.title}
                  </Link>
                </h3>
                <div className="text-[12.5px] text-gray-500 mt-1 mb-1.5">
                  <span>{formatDate(article.created_at)}</span>
                  <span className="before:content-[' · ']">
                    {CATEGORY_LABELS[article.category] ?? article.category}
                  </span>
                  {article.author_name && (
                    <span className="before:content-[' · ']">{article.author_name}</span>
                  )}
                </div>
                {article.summary && (
                  <Link
                    to={`/article/${article.id}`}
                    className="text-sm text-gray-600 hover:no-underline hover:text-gray-800"
                  >
                    {article.summary}
                  </Link>
                )}
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
