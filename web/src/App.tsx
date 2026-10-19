import { useEffect, useState, useCallback } from 'react'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { CentralHub } from './components/CentralHub'
import { ArticleStream } from './components/ArticleStream'
import { Footer } from './components/Footer'
import { ArticleDetailModal } from './components/ArticleDetailModal'
import { ArticleEditModal } from './components/ArticleEditModal'
import { AuthModal } from './components/AuthModal'
import { RecruitModal, HonorsModal, CalendarModal, LinksModal } from './components/InfoModals'
import {
  fetchArticles,
  fetchMe,
  createArticle,
  updateArticle,
  deleteArticle,
  clearToken,
  getToken,
} from './api/client'
import type { Article, User } from './types'

export function App() {
  const [user, setUser] = useState<User | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [currentCategory, setCurrentCategory] = useState<string>('')

  // Modals state
  const [readingArticle, setReadingArticle] = useState<Article | null>(null)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isRecruitOpen, setIsRecruitOpen] = useState(false)
  const [isHonorsOpen, setIsHonorsOpen] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isLinksOpen, setIsLinksOpen] = useState(false)

  // Load user profile if token exists
  useEffect(() => {
    if (getToken()) {
      fetchMe()
        .then((res) => setUser(res.user))
        .catch(() => clearToken())
    }
  }, [])

  // Load articles
  const loadArticles = useCallback(async (cat: string) => {
    setLoading(true)
    try {
      const res = await fetchArticles(cat)
      setArticles(res.items || [])
    } catch (err) {
      console.error('Failed to load articles:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadArticles(currentCategory)
  }, [currentCategory, loadArticles])

  // Handlers
  const handleNavigateSection = (sectionId: string) => {
    if (sectionId === 'heritage') {
      setCurrentCategory('senior')
      const el = document.getElementById('articles')
      el?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    const el = document.getElementById(sectionId)
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSelectCategory = (cat: string) => {
    setCurrentCategory(cat)
    const el = document.getElementById('articles')
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleCreateArticle = () => {
    setEditingArticle(null)
    setIsEditModalOpen(true)
  }

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article)
    setIsEditModalOpen(true)
  }

  const handleDeleteArticle = async (id: number) => {
    if (!window.confirm('确定要删除这篇内容吗？此操作不可逆。')) return
    try {
      await deleteArticle(id)
      await loadArticles(currentCategory)
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除失败')
    }
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
    await loadArticles(currentCategory)
  }

  const handleLogout = () => {
    clearToken()
    setUser(null)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0b141d] text-slate-100 antialiased selection:bg-teal-600 selection:text-white">
      {/* Navbar */}
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenCreateArticle={handleCreateArticle}
        onLogout={handleLogout}
        onNavigateSection={handleNavigateSection}
      />

      {/* Main Flow */}
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <div id="hero">
          <Hero onLearnMore={() => handleNavigateSection('hub')} />
        </div>

        {/* Central 3-Column Hub */}
        <CentralHub
          onSelectCategory={(cat) => handleSelectCategory(cat)}
          onOpenRecruit={() => setIsRecruitOpen(true)}
          onOpenHonors={() => setIsHonorsOpen(true)}
          onOpenCalendar={() => setIsCalendarOpen(true)}
          onOpenLinks={() => setIsLinksOpen(true)}
        />

        {/* Latest Articles Stream */}
        <ArticleStream
          articles={articles}
          loading={loading}
          currentCategory={currentCategory}
          user={user}
          onSelectCategory={handleSelectCategory}
          onReadArticle={(a) => setReadingArticle(a)}
          onEditArticle={handleEditArticle}
          onDeleteArticle={handleDeleteArticle}
          onCreateArticle={handleCreateArticle}
        />
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <ArticleDetailModal
        article={readingArticle}
        onClose={() => setReadingArticle(null)}
      />

      <ArticleEditModal
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

export default App
