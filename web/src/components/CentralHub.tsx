import React from 'react'
import {
  Terminal,
  Trophy,
  BookOpen,
  GraduationCap,
  Calendar,
  UserPlus,
  Medal,
  Link2,
  CloudSun,
  Activity,
} from 'lucide-react'

interface CentralHubProps {
  onSelectCategory: (cat: 'news' | 'notice' | 'senior' | 'contest') => void
  onOpenRecruit: () => void
  onOpenHonors: () => void
  onOpenCalendar: () => void
  onOpenLinks: () => void
}

export const CentralHub: React.FC<CentralHubProps> = ({
  onSelectCategory,
  onOpenRecruit,
  onOpenHonors,
  onOpenCalendar,
  onOpenLinks,
}) => {
  return (
    <section id="hub" className="max-w-6xl mx-auto px-4 -mt-8 relative z-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left 4-Box Grid (4 Cols on lg) */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-2">
          {/* Box 1: HydroOJ */}
          <a
            href="https://oj.syuctacm.cn"
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-[#2a1e24] hover:bg-[#382630] border border-rose-900/40 text-rose-200 transition-all group shadow-sm text-center"
          >
            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform text-rose-300">
              <Terminal className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold tracking-wide">Hydro OJ</span>
            <span className="text-[10px] text-rose-300/70 mt-0.5">校内核心评测</span>
          </a>

          {/* Box 2: 题目标签榜 */}
          <a
            href="https://oj.syuctacm.cn/p"
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-[#192b23] hover:bg-[#20392d] border border-emerald-900/40 text-emerald-200 transition-all group shadow-sm text-center"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform text-emerald-300">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold tracking-wide">题目标签榜</span>
            <span className="text-[10px] text-emerald-300/70 mt-0.5">过题榜单检索</span>
          </a>

          {/* Box 3: 薪火相传 / 算法模板 */}
          <button
            onClick={() => onSelectCategory('senior')}
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-[#182836] hover:bg-[#213547] border border-sky-900/40 text-sky-200 transition-all group shadow-sm text-center cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform text-sky-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold tracking-wide">薪火相传</span>
            <span className="text-[10px] text-sky-300/70 mt-0.5">学长经验与路线</span>
          </button>

          {/* Box 4: 选拔赛题集 */}
          <button
            onClick={() => onSelectCategory('contest')}
            className="flex flex-col items-center justify-center p-4 rounded-lg bg-[#2d2719] hover:bg-[#3d3422] border border-amber-900/40 text-amber-200 transition-all group shadow-sm text-center cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform text-amber-300">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold tracking-wide">历届选拔赛</span>
            <span className="text-[10px] text-amber-300/70 mt-0.5">竞赛喜报与题集</span>
          </button>
        </div>

        {/* Middle Card: Intro + Weather / Live Status (5 Cols on lg) */}
        <div className="lg:col-span-5 rounded-lg bg-slate-900/95 border border-slate-700/80 p-5 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center gap-2 mb-2 text-teal-400 font-semibold text-xs tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              集训队简介 · About SYUCT ACM
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              沈阳化工大学 ACM-ICPC 集训队是由全校程序设计与算法竞赛爱好者自发组织、教练组统一指导的竞技团队，旨在联合全校计算机与数学爱好者，搭建思维与代码交流共享的平台，宣传算法之美，选拔培育代表学校出战 ICPC、CCPC 及各省高校程序设计大赛的优秀梯队。
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-1.5 text-teal-300">
              <CloudSun className="w-3.5 h-3.5 text-amber-400" />
              <span>当前天气: 沈阳 16.5°C 多云</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-400">
                <Activity className="w-3.5 h-3.5" />
                OJ 运行中
              </span>
              <span className="text-slate-400">选手: 530+</span>
            </div>
          </div>
        </div>

        {/* Right 4-Box Grid: Service Entry Icons (3 Cols on lg) */}
        <div className="lg:col-span-3 grid grid-cols-2 gap-2">
          {/* Item 1: 活动日历 */}
          <button
            onClick={onOpenCalendar}
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all group shadow-sm text-center cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium">活动日历</span>
          </button>

          {/* Item 2: 招新报名 */}
          <button
            onClick={onOpenRecruit}
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all group shadow-sm text-center cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <UserPlus className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-emerald-400 font-semibold">招新报名</span>
          </button>

          {/* Item 3: 荣誉殿堂 */}
          <button
            onClick={onOpenHonors}
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all group shadow-sm text-center cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Medal className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium">荣誉殿堂</span>
          </button>

          {/* Item 4: 友情链接 */}
          <button
            onClick={onOpenLinks}
            className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all group shadow-sm text-center cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <Link2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium">友情链接</span>
          </button>
        </div>
      </div>
    </section>
  )
}
