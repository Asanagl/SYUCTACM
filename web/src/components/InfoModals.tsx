import React from 'react'
import { X, Trophy, Calendar, Link2, UserPlus, ExternalLink } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
}

export const RecruitModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0c141d] border border-slate-700/80 rounded-xl shadow-2xl p-6 text-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-teal-400 font-bold">
            <UserPlus className="w-5 h-5" />
            <span>招新纳新通道</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-4 space-y-3 text-xs leading-relaxed text-slate-300 font-light">
          <p className="font-semibold text-white">欢迎加入沈阳化工大学 ACM-ICPC 集训队！</p>
          <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-2">
            <p className="text-teal-300 font-medium">1. 报名资格：</p>
            <p>全校大一、大二本科生，不限专业，对算法、编程充满热情。</p>
            <p className="text-teal-300 font-medium">2. 训练与考核：</p>
            <p>注册校内 Hydro OJ（oj.syuctacm.cn），完成基础题单；参加 10 月底举行的全校新生上机选拔赛。</p>
            <p className="text-teal-300 font-medium">3. 答疑与交流群：</p>
            <p>关注学院群公告或联系集训队队员了解最新考核排期。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export const HonorsModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0c141d] border border-slate-700/80 rounded-xl shadow-2xl p-6 text-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-sky-400 font-bold">
            <Trophy className="w-5 h-5" />
            <span>荣誉殿堂 · 战绩与历史</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-4 space-y-3 text-xs leading-relaxed text-slate-300">
          <ul className="space-y-2">
            <li className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="font-medium text-white">第 50 届 ICPC 国际大学生程序设计竞赛区域赛</span>
              <span className="px-2 py-0.5 rounded text-[11px] bg-amber-500/20 text-amber-300 font-mono">奖牌</span>
            </li>
            <li className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="font-medium text-white">辽宁省普通高等学校大学生程序设计竞赛</span>
              <span className="px-2 py-0.5 rounded text-[11px] bg-sky-500/20 text-sky-300 font-mono">省一等奖多项</span>
            </li>
            <li className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="font-medium text-white">中国大学生程序设计竞赛 (CCPC)</span>
              <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/20 text-emerald-300 font-mono">优胜奖</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export const CalendarModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0c141d] border border-slate-700/80 rounded-xl shadow-2xl p-6 text-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-rose-400 font-bold">
            <Calendar className="w-5 h-5" />
            <span>训练与活动日历</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-4 space-y-2 text-xs text-slate-300">
          <div className="p-3 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-white">每周固定训练赛</div>
              <div className="text-slate-400 text-[11px] mt-0.5">每周六 / 周日 14:00 - 19:00</div>
            </div>
            <span className="text-[11px] text-teal-400 font-mono">例行</span>
          </div>
          <div className="p-3 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-white">新生算法入门分享</div>
              <div className="text-slate-400 text-[11px] mt-0.5">每周三晚 18:30 - 20:30</div>
            </div>
            <span className="text-[11px] text-sky-400 font-mono">授课</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export const LinksModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null
  const links = [
    { name: 'Hydro OJ', url: 'https://oj.syuctacm.cn', desc: '校内核心日常评测' },
    { name: 'Codeforces', url: 'https://codeforces.com', desc: '全球高水平在线排位赛' },
    { name: 'AtCoder', url: 'https://atcoder.jp', desc: '日本知名高质量算法竞赛' },
    { name: 'NowCoder 牛客竞赛', url: 'https://ac.nowcoder.com', desc: '国内优质算法练习与寒暑假多校训练' },
    { name: 'Luogu 洛谷', url: 'https://www.luogu.com.cn', desc: '国内算法学习社区与综合题库' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0c141d] border border-slate-700/80 rounded-xl shadow-2xl p-6 text-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <Link2 className="w-5 h-5" />
            <span>友情链接与常用竞赛平台</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2">
          {links.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 flex items-center justify-between transition-colors group"
            >
              <div>
                <div className="font-semibold text-white group-hover:text-amber-300 transition-colors">{link.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{link.desc}</div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-300" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
