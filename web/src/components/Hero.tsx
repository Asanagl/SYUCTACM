import React from 'react'
import { ExternalLink, Terminal } from 'lucide-react'

interface HeroProps {
  onLearnMore: () => void
}

export const Hero: React.FC<HeroProps> = ({ onLearnMore }) => {
  return (
    <section className="relative w-full h-[380px] md:h-[440px] flex items-center justify-center overflow-hidden border-b border-slate-800">
      {/* Background Graphic with Scenic Overlay */}
      <div className="absolute inset-0 bg-[#0d1c26]">
        {/* Subtle procedural gradient simulating landscape sunset and academic field */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1824]/90 via-[#0a2327]/80 to-[#0b141d]" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-r from-amber-500/10 via-teal-500/15 to-emerald-500/10 blur-3xl opacity-60" />
      </div>

      {/* Grid texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-wider text-white font-serif uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
          SYUCT @ ACM
        </h1>

        <p className="mt-3 text-lg md:text-2xl font-light tracking-wide text-slate-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          中国 · 沈阳化工大学 ACM-ICPC 集训队
        </p>

        <p className="mt-2 text-xs md:text-sm text-teal-300/90 font-mono tracking-widest">
          CODE WITH PASSION · PURSUE EXCELLENCE
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={onLearnMore}
            className="px-6 py-2 rounded border border-white/60 hover:border-white bg-black/30 hover:bg-black/50 text-white text-sm font-medium backdrop-blur-sm transition-all cursor-pointer shadow-md"
          >
            了解更多
          </button>
          <a
            href="https://oj.syuctacm.cn"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-2 rounded bg-teal-600/90 hover:bg-teal-500 text-white text-sm font-medium backdrop-blur-sm transition-all flex items-center gap-1.5 shadow-md shadow-teal-950/40"
          >
            <Terminal className="w-4 h-4" />
            进入 Hydro OJ
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>
      </div>
    </section>
  )
}
