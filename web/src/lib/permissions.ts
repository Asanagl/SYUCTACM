import type { User } from '../types'

// Wiki 写操作要求 member/admin；guest 仅可读（后端 MemberPlus 会拒绝 guest 写入）
export function canWrite(user: User | null): boolean {
  return user !== null && user.role !== 'guest'
}
