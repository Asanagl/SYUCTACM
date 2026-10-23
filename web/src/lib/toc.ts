import { marked } from 'marked'

export interface TocItem {
  id: string
  text: string
  level: 2 | 3
}

// 标题 slug 规则：小写；空格与连续非字母数字（含下划线等）统一转为单个 -；
// 保留中文（\p{L} 涵盖 CJK 字母），去掉首尾多余的 -
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
}

// 每次渲染/提取时新建，重复标题依次追加 -2、-3……保证 id 唯一
export function createSlugger(): (text: string) => string {
  const counts = new Map<string, number>()
  return (text: string): string => {
    const base = slugifyHeading(text)
    const seen = counts.get(base) ?? 0
    counts.set(base, seen + 1)
    return seen === 0 ? base : `${base}-${seen + 1}`
  }
}

// 从 Markdown 正文提取 h2/h3 标题生成目录（h1 不收，与渲染器 permalink 规则一致）
export function extractToc(markdown: string): TocItem[] {
  const slugger = createSlugger()
  const items: TocItem[] = []
  for (const token of marked.lexer(markdown)) {
    if (token.type === 'heading' && (token.depth === 2 || token.depth === 3)) {
      items.push({ id: slugger(token.text), text: token.text, level: token.depth })
    }
  }
  return items
}
