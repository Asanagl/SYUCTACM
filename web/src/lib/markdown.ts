import DOMPurify from 'dompurify'
import { Marked, type RendererObject, type Tokens } from 'marked'
import { createSlugger } from './toc'

const PURIFY_CONFIG = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
}

export function renderMarkdown(content: string): string {
  // 与 extractToc 共用同一套 slug 规则与去重顺序：仅 h2/h3 参与编号
  const slugger = createSlugger()
  const renderer: RendererObject = {
    heading({ tokens, depth, text }: Tokens.Heading) {
      const body = this.parser.parseInline(tokens)
      if (depth !== 2 && depth !== 3) {
        return `<h${depth}>${body}</h${depth}>`
      }
      const slug = slugger(text)
      return `<h${depth} id="${slug}">${body}<a class="permalink" href="#${slug}" aria-hidden="true" tabindex="-1">#</a></h${depth}>`
    },
  }
  // 每次渲染新建实例，保证 slugger 与本次渲染一一对应
  const html = new Marked({ breaks: true, gfm: true, renderer }).parse(content) as string
  return DOMPurify.sanitize(html, PURIFY_CONFIG)
}
