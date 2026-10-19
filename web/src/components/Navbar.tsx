import React from 'react'
import { ExternalLink, LogIn, LogOut, PlusCircle, ShieldCheck, User as UserIcon } from 'lucide-react'
import type { User } from '../types'

interface NavbarProps {
  user: User | null
  onOpenAuth: () => void
  onOpenCreateArticle: () => void
  onLogout: () => void
  onNavigateSection: (sectionId: string) => void
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onOpenCreateArticle,
  onLogout,
  onNavigateSection,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0d141e]/90 backdrop-blur-md border-b border-slate-800 text-slate-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Left */}
        <div
          onClick={() => onNavigateSection('hero')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <img
            src="/logo.png"
            alt="SYUCT ACM"
            className="w-9 h-9 object-contain drop-shadow-[0_0_10px_rgba(56,189,248,0.3)] group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              SYUCT <span className="text-teal-400">@ ACM</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider">
              沈阳化工大学 ACM 集训队
            </span>
          </div>
        </div>

        {/* Navigation Center */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300 font-medium">
          <button
            onClick={() => onNavigateSection('hero')}
            className="hover:text-teal-300 transition-colors cursor-pointer"
          >
            首页
          </button>
          <button
            onClick={() => onNavigateSection('hub')}
            className="hover:text-teal-300 transition-colors cursor-pointer"
          >
            核心服务
          </button>
          <button
            onClick={() => onNavigateSection('articles')}
            className="hover:text-teal-300 transition-colors cursor-pointer"
          >
            最新文章
          </button>
          <button
            onClick={() => onNavigateSection('heritage')}
            className="hover:text-teal-300 transition-colors cursor-pointer"
          >
            薪火相传
          </button>
          <a
            href="https://oj.syuctacm.cn"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-slate-300 hover:text-teal-300 transition-colors"
          >
            训练 OJ
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </nav>

        {/* User Right */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {user.role === 'admin' && (
                <button
                  onClick={onOpenCreateArticle}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-teal-600 hover:bg-teal-500 text-white transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  发文章
                </button>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200">
                {user.role === 'admin' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <UserIcon className="w-3.5 h-3.5 text-teal-400" />
                )}
                <span className="font-medium max-w-[100px] truncate">{user.nickname || user.username}</span>
                {user.role === 'admin' && (
                  <span className="px-1 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    管理员
                  </span>
                )}
              </div>
              <button
                onClick={onLogout}
                title="退出登录"
                className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-900/30 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              登录 / 注册
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
