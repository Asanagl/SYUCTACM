import type { WikiTreeItem } from '../types'

export interface WikiTreeGroup {
  // 空串表示「未分组」，展示层负责渲染为「未分组」
  group: string
  pages: WikiTreeItem[]
}

function compareText(a: string, b: string): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

// 按 group_name 字典序分组（空串组排最后），组内按 title 字典序
export function groupWikiTree(items: WikiTreeItem[]): WikiTreeGroup[] {
  const namedGroups = [...new Set(items.map((i) => i.group_name).filter((g) => g !== ''))].sort(
    compareText
  )
  const groups: WikiTreeGroup[] = namedGroups.map((group) => ({
    group,
    pages: items
      .filter((i) => i.group_name === group)
      .slice()
      .sort((a, b) => compareText(a.title, b.title)),
  }))
  const ungrouped = items
    .filter((i) => i.group_name === '')
    .slice()
    .sort((a, b) => compareText(a.title, b.title))
  if (ungrouped.length > 0) {
    groups.push({ group: '', pages: ungrouped })
  }
  return groups
}

// 树的展平顺序：组按 group_name 字典序、组内按 title；「未分组」排最后
export function flattenWikiTree(items: WikiTreeItem[]): WikiTreeItem[] {
  return groupWikiTree(items).flatMap((g) => g.pages)
}
