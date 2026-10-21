import { useMemo } from 'react'
import { renderMarkdown } from '../lib/markdown'

interface MarkdownContentProps {
  content: string
  className?: string
}

export function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  const html = useMemo(() => renderMarkdown(content), [content])

  return (
    <div
      className={`text-[15px] leading-[1.85] text-gray-800 [&_p]:mb-4 [&_p]:text-justify [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4 [&_h2]:text-[19px] [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-2.5 [&_h3]:text-base [&_h3]:font-bold [&_h3]:mt-5 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-teal-700/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-500 [&_a]:text-[#0f766e] [&_a:hover]:underline [&_strong]:font-semibold [&_hr]:border-gray-200 [&_hr]:my-6 [&_img]:max-w-full [&_table]:w-full [&_table]:text-sm [&_th]:border [&_th]:border-gray-200 [&_th]:px-3 [&_th]:py-1.5 [&_th]:bg-gray-50 [&_td]:border [&_td]:border-gray-200 [&_td]:px-3 [&_td]:py-1.5 [&_pre]:bg-[#f6f8fa] [&_pre]:border [&_pre]:border-[#e5e7eb] [&_pre]:rounded-md [&_pre]:px-4 [&_pre]:py-3 [&_pre]:overflow-x-auto [&_pre]:mb-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_code]:font-mono [&_code]:text-[13px] [&_p_code]:bg-gray-100 [&_p_code]:px-1.5 [&_p_code]:py-0.5 [&_p_code]:rounded [&_li_code]:bg-gray-100 [&_li_code]:px-1.5 [&_li_code]:py-0.5 [&_li_code]:rounded ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
