import { Phone } from 'lucide-react'
import { siteConfig } from '@/lib/site-config'

/**
 * 手機/平板右下角浮動 CTA。lg(≥1024px) 桌面隱藏，僅顯示於行動裝置。
 * 紅色電話直撥，綠色 LINE 開官方帳號。LINE URL 為空時自動省略綠色按鈕。
 */
export function FloatingCta() {
  return (
    <div
      className="fixed right-4 z-40 flex flex-col gap-3 lg:hidden"
      style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
    >
      <a
        href={siteConfig.contact.phoneTel}
        aria-label={`撥打電話 ${siteConfig.contact.phone}`}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E53935] text-white shadow-lg shadow-black/20 active:scale-95 transition"
      >
        <Phone className="h-6 w-6" strokeWidth={2.4} />
      </a>

      {siteConfig.contact.lineFriendUrl && (
        <a
          href={siteConfig.contact.lineFriendUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="加 LINE 官方帳號免費估價"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#06C755] text-white shadow-lg shadow-black/20 active:scale-95 transition"
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
            <path
              fill="white"
              d="M12 3C6.5 3 2 6.6 2 11c0 3.9 3.6 7.2 8.4 7.9.3.1.8.2.9.5.1.3.1.7 0 1l-.1.9c0 .3-.2 1.1 1 .6 1.2-.5 6.4-3.8 8.7-6.5 1.6-1.7 2.1-3.5 2.1-4.4 0-4.4-4.5-8-10-8z"
            />
            <text
              x="12"
              y="13"
              textAnchor="middle"
              fontSize="5.5"
              fontWeight="900"
              fill="#06C755"
              fontFamily="-apple-system, system-ui, sans-serif"
            >
              LINE
            </text>
          </svg>
        </a>
      )}
    </div>
  )
}
