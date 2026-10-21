import { useState } from 'react'
import { X, LogIn, UserPlus } from 'lucide-react'
import { loginUser, registerUser } from '../api/client'
import type { User } from '../types'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: User) => void
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [studentNumber, setStudentNumber] = useState('')
  const [grade, setGrade] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'login') {
        const res = await loginUser({ username, password })
        onSuccess(res.user)
        onClose()
      } else {
        const res = await registerUser({
          username,
          password,
          nickname: nickname || username,
          student_number: studentNumber,
          grade,
        })
        onSuccess(res.user)
        onClose()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '操作失败')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'px-3 py-2 rounded border border-gray-300 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0f766e]'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white border border-[#e5e7eb] rounded-lg shadow-2xl p-6 text-gray-800">
        <div className="flex items-center justify-between pb-4 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
            <span className="font-bold text-base text-gray-800">SYUCT ACM 账号</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-2 mt-4 p-1 rounded-md bg-gray-50 border border-[#e5e7eb]">
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setError('')
            }}
            className={`py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
              mode === 'login' ? 'bg-[#0f766e] text-white shadow' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            登录账号
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register')
              setError('')
            }}
            className={`py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
              mode === 'register' ? 'bg-[#0f766e] text-white shadow' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            注册新成员
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded bg-red-50 border border-red-200 text-red-600 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              required
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              required
              className={inputClass}
            />
          </div>

          {mode === 'register' && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">真实姓名 / 昵称</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="例如：张三"
                  required
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">学号 (选填)</label>
                  <input
                    type="text"
                    value={studentNumber}
                    onChange={(e) => setStudentNumber(e.target.value)}
                    placeholder="2501..."
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500">年级 (选填)</label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="例如：2025"
                    className={inputClass}
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-3 py-2 rounded bg-[#0f766e] hover:bg-[#0d5f59] text-white text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {loading ? '正在处理...' : mode === 'login' ? '立即登录' : '立即注册'}
          </button>
        </form>
      </div>
    </div>
  )
}
