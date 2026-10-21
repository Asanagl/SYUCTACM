import { Link, NavLink } from 'react-router-dom'
import { ExternalLink, LogIn, LogOut, PlusCircle, ShieldCheck, User as UserIcon } from 'lucide-react'
import type { User } from '../types'

interface SiteHeaderProps {
  user: User | null
  onOpenAuth: () => void
  onOpenCreateArticle: () => void
  onLogout: () => void
  onNavigateArticles: (category?: string) => void
}

export function SiteHeader({
  user,
  onOpenAuth,
  onOpenCreateArticle,
  onLogout,
  onNavigateArticles,
}: SiteHeaderProps) {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `transition-colors hover:text-[#0f766e] hover:no-underline ${
      isActive ? 'text-[#0f766e] font-semibold' : 'text-gray-800'
    }`

  return (
    <header className="border-b border-[#e5e7eb] bg-white">
      <div className="max-w-[880px] mx-auto px-5 h-[60px] flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 hover:no-underline">
          <img src="/logo.png" alt="SYUCT ACM Logo" className="w-[34px] h-[34px] object-contain" />
          <span className="font-bold text-base text-gray-800 leading-tight">
            SYUCT ACM
            <small className="block text-[11px] font-normal text-gray-500">
              沈阳化工大学 ACM-ICPC 集训队
            </small>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-5 text-sm">
          <NavLink to="/" end className={navLinkClass}>
            首页
          </NavLink>
          <button
            onClick={() => onNavigateArticles()}
            className="text-gray-800 hover:text-[#0f766e] transition-colors cursor-pointer text-sm"
          >
            最新文章
          </button>
          <button
            onClick={() => onNavigateArticles('senior')}
            className="text-gray-800 hover:text-[#0f766e] transition-colors cursor-pointer text-sm"
          >
            薪火相传
          </button>
          <NavLink to="/wiki" className={navLinkClass}>
            Wiki
          </NavLink>
          <a
            href="https://oj.syuctacm.cn"
            target="_blank"
            rel="noreferrer"
            className="text-gray-800 hover:text-[#0f766e] transition-colors flex items-center gap-1"
          >
            训练 OJ
            <ExternalLink className="w-3 h-3 text-gray-500" />
          </a>
        </nav>

        {/* User Area */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              {user.role === 'admin' && (
                <button
                  onClick={onOpenCreateArticle}
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded border border-[#0f766e] text-[13px] text-[#0f766e] hover:bg-[#0f766e] hover:text-white transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  发文章
                </button>
              )}
              <div className="flex items-center gap-1.5 text-xs text-gray-700">
                {user.role === 'admin' ? (
                  <ShieldCheck className="w-4 h-4 text-[#0f766e]" />
                ) : (
                  <UserIcon className="w-4 h-4 text-gray-500" />
                )}
                <span className="font-medium max-w-[120px] truncate">
                  {user.nickname || user.username}
                </span>
                {user.role === 'admin' && (
                  <span className="px-1 rounded text-[10px] border border-[#0f766e] text-[#0f766e]">
                    管理员
                  </span>
                )}
              </div>
              <button
                onClick={onLogout}
                title="退出登录"
                className="p-1 rounded text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-1 rounded border border-[#0f766e] text-[13px] text-[#0f766e] hover:bg-[#0f766e] hover:text-white transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              登录 / 注册
            </button>
          )}
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden border-t border-[#e5e7eb]">
        <div className="max-w-[880px] mx-auto px-5 py-2 flex items-center gap-4 text-[13px] overflow-x-auto">
          <NavLink to="/" end className={navLinkClass}>
            首页
          </NavLink>
          <button onClick={() => onNavigateArticles()} className="text-gray-800 whitespace-nowrap">
            最新文章
          </button>
          <button onClick={() => onNavigateArticles('senior')} className="text-gray-800 whitespace-nowrap">
            薪火相传
          </button>
          <NavLink to="/wiki" className={navLinkClass}>
            Wiki
          </NavLink>
          <a
            href="https://oj.syuctacm.cn"
            target="_blank"
            rel="noreferrer"
            className="text-gray-800 hover:text-[#0f766e] whitespace-nowrap"
          >
            训练 OJ
          </a>
        </div>
      </div>
    </header>
  )
}
