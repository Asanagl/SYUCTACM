import React from 'react'
import { CloudSun, ExternalLink, GitBranch, Mail, MapPin } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0d2a27] text-teal-100 border-t border-teal-900/60 mt-20 relative z-10">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left: Summary + Weather (6 Cols) */}
        <div className="md:col-span-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <img src="/logo.png" alt="SYUCT ACM" className="w-6 h-6 object-contain" />
            <span>沈阳化工大学 ACM-ICPC 集训队</span>
          </div>
          <p className="text-xs text-teal-200/80 leading-relaxed font-light max-w-lg">
            沈阳化工大学 ACM 集训队是由全校程序设计与算法竞赛爱好者组成的学术型竞技团体，旨在联合全校算法与开发爱好者，搭建思维共享与技术成长的平台，推广算法设计与计算机科学的应用。
          </p>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-300/90 mt-1">
            <CloudSun className="w-4 h-4 text-amber-300" />
            <span>当前天气: 沈阳 16.5°C ⛅ 多云</span>
          </div>
        </div>

        {/* Middle: Links (3 Cols) */}
        <div className="md:col-span-3 flex flex-col gap-2">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
            快速导航与支持
          </h4>
          <ul className="text-xs text-teal-200/80 space-y-1.5 font-light">
            <li>
              <a
                href="https://oj.syuctacm.cn"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                Hydro OJ 评测系统
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </li>
            <li>
              <a
                href="https://github.com/syuctacm"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                GitHub 组织 (@syuctacm)
                <GitBranch className="w-3 h-3 opacity-60" />
              </a>
            </li>
            <li className="flex items-center gap-1 text-teal-200/70">
              <Mail className="w-3 h-3 opacity-60" />
              <span>官方邮箱: noreply@mail.syuctacm.cn</span>
            </li>
            <li className="flex items-center gap-1 text-teal-200/70">
              <MapPin className="w-3 h-3 opacity-60" />
              <span>活动室: 信息学院 计算机机房</span>
            </li>
          </ul>
        </div>

        {/* Right: Mascot & Copyright (3 Cols) */}
        <div className="md:col-span-3 flex flex-col items-center md:items-end justify-center gap-2 text-right">
          <img
            src="/logo.png"
            alt="SYUCT ACM Mascot"
            className="w-16 h-16 object-contain drop-shadow-[0_0_16px_rgba(45,212,191,0.25)] opacity-90"
          />
          <div className="text-[11px] text-teal-300/60 font-mono text-center md:text-right mt-1">
            © {new Date().getFullYear()} SYUCT ACM
            <br />
            沈阳化工大学 ACM 集训队
          </div>
        </div>
      </div>
    </footer>
  )
}
