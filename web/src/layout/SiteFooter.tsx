const COPYRIGHT_YEAR = new Date().getFullYear()

interface SiteFooterProps {
  onOpenRecruit: () => void
  onOpenHonors: () => void
  onOpenCalendar: () => void
  onOpenLinks: () => void
}

export function SiteFooter({
  onOpenRecruit,
  onOpenHonors,
  onOpenCalendar,
  onOpenLinks,
}: SiteFooterProps) {
  const linkClass = 'text-gray-500 hover:text-[#0f766e] transition-colors cursor-pointer'

  return (
    <footer className="border-t border-[#e5e7eb] py-[18px] pb-8 text-[13px] text-gray-500 mt-10">
      <div className="max-w-[880px] mx-auto px-5">
        <div className="flex flex-wrap gap-4 mb-2">
          <button onClick={onOpenRecruit} className={linkClass}>
            招新报名
          </button>
          <button onClick={onOpenHonors} className={linkClass}>
            荣誉殿堂
          </button>
          <button onClick={onOpenCalendar} className={linkClass}>
            活动日历
          </button>
          <button onClick={onOpenLinks} className={linkClass}>
            友情链接
          </button>
        </div>
        <div>© {COPYRIGHT_YEAR} 沈阳化工大学 ACM-ICPC 集训队</div>
      </div>
    </footer>
  )
}
