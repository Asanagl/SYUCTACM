import { useEffect, useState } from 'react'
import {
  ExternalLink,
  Code2,
  Trophy,
  BookOpen,
  Users,
  Terminal,
  Activity,
  CheckCircle2,
  Server
} from 'lucide-react'

interface ServerInfo {
  name: string
  englishName: string
  ojUrl: string
  githubOrg: string
  stats?: {
    ojUsers: number
    establishedYear: number
  }
}

interface HealthStatus {
  status: string
  service: string
  database: string
  timestamp: string
}

export function App() {
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null)
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/info').then((res) => (res.ok ? res.json() : null)),
      fetch('/api/v1/health').then((res) => (res.ok ? res.json() : null)),
    ])
      .then(([infoData, healthData]) => {
        if (infoData) setServerInfo(infoData)
        if (healthData) setHealth(healthData)
      })
      .catch((err) => console.log('Backend not connected yet:', err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 antialiased selection:bg-blue-500 selection:text-white">
      {/* Background radial highlights */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-blue-600/15 via-cyan-500/10 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-[40%] -left-40 w-96 h-96 bg-indigo-600/10 blur-3xl rounded-full" />
        <div className="absolute top-[60%] -right-40 w-96 h-96 bg-sky-600/10 blur-3xl rounded-full" />
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#090d16]/80 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="SYUCT ACM Logo"
              className="w-9 h-9 object-contain drop-shadow-[0_0_12px_rgba(59,130,246,0.3)]"
            />
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-white flex items-center gap-1.5 text-base">
                SYUCT<span className="text-blue-400">ACM</span>
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                Team Portal
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            <a href="#hub" className="hover:text-blue-400 transition-colors">
              服务中枢
            </a>
            <a href="#stats" className="hover:text-blue-400 transition-colors">
              技术与数据
            </a>
            <a
              href="https://oj.syuctacm.cn"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-blue-400 transition-colors"
            >
              Hydro OJ
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
            <a
              href="https://github.com/syuctacm"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-blue-400 transition-colors"
            >
              GitHub Org
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="https://oj.syuctacm.cn"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <Terminal className="w-3.5 h-3.5" />
              进入训练 OJ
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12 md:py-16 relative z-10 flex flex-col gap-16">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center max-w-3xl mx-auto pt-4 md:pt-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>React + Go + PostgreSQL 架构初始化完成</span>
          </div>

          <div className="relative mb-6">
            <img
              src="/logo.png"
              alt="SYUCT ACM"
              className="w-24 h-24 md:w-28 md:h-28 object-contain drop-shadow-[0_0_24px_rgba(59,130,246,0.35)]"
            />
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            代码筑基 · 算法登峰
          </h1>
          <p className="text-base md:text-lg text-slate-300 leading-relaxed max-w-2xl">
            {(serverInfo?.name || "沈阳化工大学 ACM-ICPC 集训队") + "官方网站与综合服务平台。"}
            连接校内评测集群、传承历届学长经验、支撑日常训练与成员线上服务。
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://oj.syuctacm.cn"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2"
            >
              <Code2 className="w-4 h-4" />
              开始刷题 (Hydro OJ)
              <ExternalLink className="w-4 h-4 text-blue-200" />
            </a>
            <a
              href="https://github.com/syuctacm"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-2.5 rounded-xl text-sm font-medium border border-slate-700 hover:border-slate-600 bg-slate-900/60 hover:bg-slate-850 text-slate-200 transition-all flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-slate-400" />
              GitHub 组织与开源
            </a>
          </div>

          {/* Core Metric Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mt-12 pt-8 border-t border-slate-800/80">
            <div className="flex flex-col items-center p-3 rounded-lg bg-slate-900/40 border border-slate-800/60">
              <span className="text-2xl font-bold font-mono text-blue-400">530+</span>
              <span className="text-xs text-slate-400 mt-1">OJ 注册选手</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-slate-900/40 border border-slate-800/60">
              <span className="text-2xl font-bold font-mono text-cyan-400">10+</span>
              <span className="text-xs text-slate-400 mt-1">届技术传承</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-slate-900/40 border border-slate-800/60">
              <span className="text-2xl font-bold font-mono text-emerald-400">300+</span>
              <span className="text-xs text-slate-400 mt-1">分类精选题目</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-slate-900/40 border border-slate-800/60">
              <span className="text-2xl font-bold font-mono text-indigo-400">24/7</span>
              <span className="text-xs text-slate-400 mt-1">专线评测集群</span>
            </div>
          </div>
        </section>

        {/* Service Hub Section */}
        <section id="hub" className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                服务中枢与导航
              </h2>
              <p className="text-xs md:text-sm text-slate-400 mt-1">
                统一连接竞赛训练基础设施与社团数字化资源
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: HydroOJ */}
            <a
              href="https://oj.syuctacm.cn"
              target="_blank"
              rel="noreferrer"
              className="group p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850/60 transition-all flex flex-col justify-between"
            >
              <div className="flex flex-col gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Terminal className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors flex items-center justify-between">
                  SYUCT Hydro OJ
                  <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  集训队核心评测系统，包含主域题库、选拔赛与年度竞赛域，已上线过题日历与标签排行榜插件。
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                在线运行 · oj.syuctacm.cn
              </div>
            </a>

            {/* Card 2: Knowledge & Heritage */}
            <div className="group p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850/60 transition-all flex flex-col justify-between">
              <div className="flex flex-col gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                  薪火相传与知识文库
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  整理收录 13 届、14 届、15 届及历代集训队学长经验总结、学习路线图、退役感言与算法专题模板。
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center gap-1.5 text-[11px] text-cyan-400 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                文档与文章中心规划中
              </div>
            </div>

            {/* Card 3: Member Services */}
            <div className="group p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850/60 transition-all flex flex-col justify-between">
              <div className="flex flex-col gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Trophy className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                  成员服务与天梯榜
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  支撑招新纳新通道、集训考勤与周报，后续支持队员 Codeforces、AtCoder、牛客多平台战绩汇聚追踪。
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center gap-1.5 text-[11px] text-indigo-400 font-mono">
                <Server className="w-3.5 h-3.5" />
                Go + PostgreSQL 支撑
              </div>
            </div>
          </div>
        </section>

        {/* Backend Connectivity & Architecture Info */}
        <section id="stats" className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-400" />
                架构与联调状态 (Live Backend Check)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                前端 React 与后端 Go API (`/api/v1`) 实时状态探针
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">后端服务:</span>
              {health?.status === 'healthy' ? (
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Healthy
                </span>
              ) : loading ? (
                <span className="text-slate-500">检测中...</span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  待启动 (运行 `go run ./cmd/server`)
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/70">
              <div className="text-slate-400 mb-1">Frontend Stack</div>
              <div className="text-slate-200 font-semibold">React 19 + TypeScript + Vite 8 + Tailwind</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/70">
              <div className="text-slate-400 mb-1">Backend Stack</div>
              <div className="text-slate-200 font-semibold">Go 1.24+ (Gin + GORM + pgx)</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/70">
              <div className="text-slate-400 mb-1">Database & Infrastructure</div>
              <div className="text-slate-200 font-semibold">PostgreSQL 16 + Caddy + WireGuard</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070a11] mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
            <span>© {new Date().getFullYear()} 沈阳化工大学 ACM-ICPC 集训队 (SYUCT ACM)</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://oj.syuctacm.cn"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              Hydro OJ 评测
            </a>
            <a
              href="https://github.com/syuctacm"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              GitHub 组织
            </a>
            <span className="text-slate-400 font-mono">syuctacm.cn</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
