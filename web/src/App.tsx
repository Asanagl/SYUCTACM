import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { SiteHeader } from './layout/SiteHeader'
import { SiteFooter } from './layout/SiteFooter'
import { HomePage } from './pages/HomePage'
import { ArticlePage } from './pages/ArticlePage'
import { WikiListPage } from './pages/WikiListPage'
import { WikiPageView } from './pages/WikiPageView'
import { WikiEditPage } from './pages/WikiEditPage'
import { WikiHistoryPage } from './pages/WikiHistoryPage'
import { WikiRevisionPage } from './pages/WikiRevisionPage'
import { ArticleEditModal } from './components/ArticleEditModal'
import { AuthModal } from './components/AuthModal'
import { RecruitModal, HonorsModal, CalendarModal, LinksModal } from './components/InfoModals'
import { clearToken, createArticle, fetchMe, getToken, updateArticle } from './api/client'
import type { Article, User } from './types'

function SiteShell() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)

  // Modals state
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [editModalKey, setEditModalKey] = useState(0)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isRecruitOpen, setIsRecruitOpen] = useState(false)
  const [isHonorsOpen, setIsHonorsOpen] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isLinksOpen, setIsLinksOpen] = useState(false)

  // Load user profile if token exists
  useEffect(() => {
    if (!getToken()) return
    let cancelled = false
    fetchMe()
      .then((res) => {
        if (!cancelled) setUser(res.user)
      })
      .catch(() => clearToken())
    return () => {
      cancelled = true
    }
  }, [])

  const handleNavigateArticles = (category?: string) => {
    navigate('/', { state: { category: category ?? '', scrollToArticles: true } })
  }

  const openCreateArticle = () => {
    setEditingArticle(null)
    setEditModalKey((k) => k + 1)
    setIsEditModalOpen(true)
  }

  const openEditArticle = (article: Article) => {
    setEditingArticle(article)
    setEditModalKey((k) => k + 1)
    setIsEditModalOpen(true)
  }

  const handleSaveArticle = async (data: {
    title: string
    category: 'news' | 'notice' | 'senior' | 'contest'
    summary: string
    content: string
    is_pinned: boolean
    author_name?: string
  }) => {
    if (editingArticle) {
      await updateArticle(editingArticle.id, data)
    } else {
      await createArticle(data)
    }
  }

  const handleLogout = () => {
    clearToken()
    setUser(null)
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800 antialiased">
      <SiteHeader
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenCreateArticle={openCreateArticle}
        onLogout={handleLogout}
        onNavigateArticles={handleNavigateArticles}
      />

      <main className="flex-1 w-full">
        <div className="max-w-[880px] mx-auto px-5">
          <Routes>
            <Route path="/" element={<HomePage user={user} onEditArticle={openEditArticle} />} />
            <Route path="/article/:id" element={<ArticlePage />} />
            <Route path="/wiki" element={<WikiListPage user={user} />} />
            <Route path="/wiki/new" element={<WikiEditPage user={user} />} />
            <Route path="/wiki/:id" element={<WikiPageView user={user} />} />
            <Route path="/wiki/:id/edit" element={<WikiEditPage user={user} />} />
            <Route path="/wiki/:id/history" element={<WikiHistoryPage user={user} />} />
            <Route path="/wiki/:id/revisions/:rid" element={<WikiRevisionPage />} />
            <Route path="*" element={<HomePage user={user} onEditArticle={openEditArticle} />} />
          </Routes>
        </div>
      </main>

      <SiteFooter
        onOpenRecruit={() => setIsRecruitOpen(true)}
        onOpenHonors={() => setIsHonorsOpen(true)}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onOpenLinks={() => setIsLinksOpen(true)}
      />

      {/* Modals：key 保证每次打开时表单状态按 article 重新初始化 */}
      <ArticleEditModal
        key={editModalKey}
        article={editingArticle}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveArticle}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(u) => setUser(u)}
      />

      <RecruitModal isOpen={isRecruitOpen} onClose={() => setIsRecruitOpen(false)} />
      <HonorsModal isOpen={isHonorsOpen} onClose={() => setIsHonorsOpen(false)} />
      <CalendarModal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} />
      <LinksModal isOpen={isLinksOpen} onClose={() => setIsLinksOpen(false)} />
    </div>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <SiteShell />
    </BrowserRouter>
  )
}

export default App
