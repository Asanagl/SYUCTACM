import { X, Trophy, Calendar, Link2, UserPlus, ExternalLink } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
}

const overlayClass = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm'
const panelClass = 'relative w-full max-w-lg bg-white border border-[#e5e7eb] rounded-lg shadow-2xl p-6 text-gray-800'

const cardClass = 'p-2.5 rounded bg-gray-50 border border-[#e5e7eb] flex items-center justify-between'

export function RecruitModal({ isOpen, onClose }: ModalProps) {
  if (!isOpen) return null
  return (
    <div className={overlayClass}>
      <div className={panelClass}>
        <div className="flex items-center justify-between pb-4 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-2 text-[#0f766e] font-bold">
            <UserPlus className="w-5 h-5" />
            <span>招新纳新通道</span>
          </div>
          <button onClick={onClose} className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-4 space-y-3 text-xs leading-relaxed text-gray-600">
          <p className="font-semibold text-gray-800">欢迎加入沈阳化工大学 ACM-ICPC 集训队！</p>
          <div className="p-3 rounded bg-gray-50 border border-[#e5e7eb] space-y-2">
            <p className="text-[#0f766e] font-medium">1. 报名资格：</p>
            <p>全校大一、大二本科生，不限专业，对算法、编程充满热情。</p>
            <p className="text-[#0f766e] font-medium">2. 训练与考核：</p>
            <p>注册校内 Hydro OJ（oj.syuctacm.cn），完成基础题单；参加 10 月底举行的全校新生上机选拔赛。</p>
            <p className="text-[#0f766e] font-medium">3. 答疑与交流群：</p>
            <p>关注学院群公告或联系集训队队员了解最新考核排期。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function HonorsModal({ isOpen, onClose }: ModalProps) {
  if (!isOpen) return null
  return (
    <div className={overlayClass}>
      <div className={panelClass}>
        <div className="flex items-center justify-between pb-4 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-2 text-[#0f766e] font-bold">
            <Trophy className="w-5 h-5" />
            <span>荣誉殿堂 · 战绩与历史</span>
          </div>
          <button onClick={onClose} className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-4 space-y-3 text-xs leading-relaxed text-gray-600">
          <ul className="space-y-2">
            <li className={cardClass}>
              <span className="font-medium text-gray-800">第 50 届 ICPC 国际大学生程序设计竞赛区域赛</span>
              <span className="px-2 py-0.5 rounded text-[11px] border border-[#0f766e] text-[#0f766e] font-mono">奖牌</span>
            </li>
            <li className={cardClass}>
              <span className="font-medium text-gray-800">辽宁省普通高等学校大学生程序设计竞赛</span>
              <span className="px-2 py-0.5 rounded text-[11px] border border-[#0f766e] text-[#0f766e] font-mono">省一等奖多项</span>
            </li>
            <li className={cardClass}>
              <span className="font-medium text-gray-800">中国大学生程序设计竞赛 (CCPC)</span>
              <span className="px-2 py-0.5 rounded text-[11px] border border-[#0f766e] text-[#0f766e] font-mono">优胜奖</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export function CalendarModal({ isOpen, onClose }: ModalProps) {
  if (!isOpen) return null
  return (
    <div className={overlayClass}>
      <div className={panelClass}>
        <div className="flex items-center justify-between pb-4 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-2 text-[#0f766e] font-bold">
            <Calendar className="w-5 h-5" />
            <span>训练与活动日历</span>
          </div>
          <button onClick={onClose} className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-4 space-y-2 text-xs text-gray-600">
          <div className="p-3 rounded bg-gray-50 border border-[#e5e7eb] flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-800">每周固定训练赛</div>
              <div className="text-gray-500 text-[11px] mt-0.5">每周六 / 周日 14:00 - 19:00</div>
            </div>
            <span className="text-[11px] text-[#0f766e] font-mono">例行</span>
          </div>
          <div className="p-3 rounded bg-gray-50 border border-[#e5e7eb] flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-800">新生算法入门分享</div>
              <div className="text-gray-500 text-[11px] mt-0.5">每周三晚 18:30 - 20:30</div>
            </div>
            <span className="text-[11px] text-[#0f766e] font-mono">授课</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LinksModal({ isOpen, onClose }: ModalProps) {
  if (!isOpen) return null
  const links = [
    { name: 'Hydro OJ', url: 'https://oj.syuctacm.cn', desc: '校内核心日常评测' },
    { name: 'Codeforces', url: 'https://codeforces.com', desc: '全球高水平在线排位赛' },
    { name: 'AtCoder', url: 'https://atcoder.jp', desc: '日本知名高质量算法竞赛' },
    { name: 'NowCoder 牛客竞赛', url: 'https://ac.nowcoder.com', desc: '国内优质算法练习与寒暑假多校训练' },
    { name: 'Luogu 洛谷', url: 'https://www.luogu.com.cn', desc: '国内算法学习社区与综合题库' },
  ]

  return (
    <div className={overlayClass}>
      <div className={panelClass}>
        <div className="flex items-center justify-between pb-4 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-2 text-[#0f766e] font-bold">
            <Link2 className="w-5 h-5" />
            <span>友情链接与常用竞赛平台</span>
          </div>
          <button onClick={onClose} className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer">
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
              className="p-3 rounded bg-gray-50 hover:bg-gray-100 border border-[#e5e7eb] flex items-center justify-between transition-colors group hover:no-underline"
            >
              <div>
                <div className="font-semibold text-gray-800 group-hover:text-[#0f766e] transition-colors">{link.name}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{link.desc}</div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#0f766e]" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
