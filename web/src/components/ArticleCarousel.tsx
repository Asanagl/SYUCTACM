import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Article } from '../types'

interface ArticleCarouselProps {
  articles: Article[]
}

const AUTOPLAY_INTERVAL_MS = 5000
const MAX_SLIDES = 5

export function ArticleCarousel({ articles }: ArticleCarouselProps) {
  const [index, setIndex] = useState(0)
  const [failedIds, setFailedIds] = useState<number[]>([])
  const [hoverPaused, setHoverPaused] = useState(false)

  const slides = articles
    .filter((article) => article.cover_image !== '')
    .slice(0, MAX_SLIDES)
    .filter((article) => !failedIds.includes(article.id))
  const count = slides.length

  // React 文档推荐的「渲染期间调整 state」模式：图片加载失败导致 slides 收缩时收敛 index
  if (count > 0 && index >= count) {
    setIndex(count - 1)
  }

  useEffect(() => {
    if (count <= 1 || hoverPaused) return
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % count)
    }, AUTOPLAY_INTERVAL_MS)
    return () => {
      window.clearInterval(timer)
    }
  }, [count, hoverPaused])

  const handleImageError = (id: number) => {
    setFailedIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  if (count === 0) {
    return (
      <div className="rounded-lg overflow-hidden border border-[#e5e7eb] bg-gray-50">
        <div className="h-[220px] flex items-center justify-center animate-pulse">
          <h2 className="px-4 text-center font-bold tracking-[0.2em] bg-gradient-to-r from-[#0f766e] to-[#14b8a6] bg-clip-text text-transparent text-2xl md:text-4xl">
            沈阳化工大学算法与程序设计协会
          </h2>
        </div>
      </div>
    )
  }

  const goPrev = () => {
    setIndex((i) => (i - 1 + count) % count)
  }

  const goNext = () => {
    setIndex((i) => (i + 1) % count)
  }

  return (
    <div
      className="relative rounded-lg overflow-hidden group"
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
    >
      <div
        className="flex h-[220px] transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((article) => (
          <Link
            key={article.id}
            to={`/article/${article.id}`}
            className="relative block w-full h-full shrink-0"
          >
            <img
              src={article.cover_image}
              alt={article.title}
              className="w-full h-full object-cover"
              onError={() => handleImageError(article.id)}
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 pt-8 pb-3">
              <span className="text-[15px] font-medium text-white">{article.title}</span>
            </div>
          </Link>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="上一张"
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 flex w-8 h-8 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="下一张"
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex w-8 h-8 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {slides.map((article, i) => (
              <button
                key={article.id}
                type="button"
                aria-label={`第 ${i + 1} 张`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  i === index ? 'w-4 bg-[#0f766e]' : 'w-1.5 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
