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
import { SurveyListPage } from './pages/SurveyListPage'
import { SurveyFillPage } from './pages/SurveyFillPage'
import { AdminSurveyListPage } from './pages/AdminSurveyListPage'
import { AdminSurveyEditPage } from './pages/AdminSurveyEditPage'
import { AdminSurveySubmissionPage } from './pages/AdminSurveySubmissionPage'
import { AdminArticleListPage } from './pages/AdminArticleListPage'
import { AdminArticleEditPage } from './pages/AdminArticleEditPage'
import { AuthModal } from './components/AuthModal'
import { RecruitModal, HonorsModal, CalendarModal, LinksModal } from './components/InfoModals'
import { clearToken, fetchMe, getToken } from './api/client'
import type { User } from './types'

function SiteShell() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  // 认证就绪标志：fetchMe settle（或无 token）后置 true，守卫须等就绪后再判定
  const [authReady, setAuthReady] = useState(() => getToken() === null)

  // Modals state
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
      .finally(() => {
        if (!cancelled) setAuthReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleNavigateArticles = (category?: string) => {
    navigate('/', { state: { category: category ?? '', scrollToArticles: true } })
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
        onLogout={handleLogout}
        onNavigateArticles={handleNavigateArticles}
      />

      <main className="flex-1 w-full">
        <div className="max-w-[880px] mx-auto px-5">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/article/:id" element={<ArticlePage />} />
            <Route path="/wiki" element={<WikiListPage user={user} />} />
            <Route path="/wiki/new" element={<WikiEditPage user={user} authReady={authReady} />} />
            <Route path="/wiki/:id" element={<WikiPageView user={user} />} />
            <Route
              path="/wiki/:id/edit"
              element={<WikiEditPage user={user} authReady={authReady} />}
            />
            <Route path="/wiki/:id/history" element={<WikiHistoryPage user={user} />} />
            <Route path="/wiki/:id/revisions/:rid" element={<WikiRevisionPage />} />
            <Route path="/surveys" element={<SurveyListPage />} />
            <Route path="/surveys/:id" element={<SurveyFillPage authReady={authReady} />} />
            <Route
              path="/admin/surveys"
              element={<AdminSurveyListPage user={user} authReady={authReady} />}
            />
            <Route
              path="/admin/surveys/new"
              element={<AdminSurveyEditPage user={user} authReady={authReady} />}
            />
            <Route
              path="/admin/surveys/:id"
              element={<AdminSurveyEditPage user={user} authReady={authReady} />}
            />
            <Route
              path="/admin/surveys/:id/submissions/:sid"
              element={<AdminSurveySubmissionPage user={user} authReady={authReady} />}
            />
            <Route
              path="/admin/articles"
              element={<AdminArticleListPage user={user} authReady={authReady} />}
            />
            <Route
              path="/admin/articles/new"
              element={<AdminArticleEditPage user={user} authReady={authReady} />}
            />
            <Route
              path="/admin/articles/:id/edit"
              element={<AdminArticleEditPage user={user} authReady={authReady} />}
            />
            <Route
              path="*"
              element={<HomePage />}
            />
          </Routes>
        </div>
      </main>

      <SiteFooter
        onOpenRecruit={() => setIsRecruitOpen(true)}
        onOpenHonors={() => setIsHonorsOpen(true)}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onOpenLinks={() => setIsLinksOpen(true)}
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
