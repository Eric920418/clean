'use client'

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import NextImage from 'next/image'
import Lightbox, { type RenderSlideProps, type SlideImage } from 'yet-another-react-lightbox'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/captions.css'

type SlideData = {
  src: string
  alt: string
  caption?: string
  unoptimized?: boolean
}

type LightboxCtx = {
  register: (id: string, data: SlideData, el: HTMLElement | null) => () => void
  open: (id: string) => void
}

const ctx = createContext<LightboxCtx | null>(null)

type CustomSlide = SlideImage & { unoptimized?: boolean }

export function LightboxProvider({ children }: { children: ReactNode }) {
  const slidesRef = useRef<Map<string, { data: SlideData; el: HTMLElement | null }>>(
    new Map(),
  )
  const [openState, setOpenState] = useState<{ slides: CustomSlide[]; index: number } | null>(
    null,
  )

  const register = useCallback<LightboxCtx['register']>((id, data, el) => {
    slidesRef.current.set(id, { data, el })
    return () => {
      slidesRef.current.delete(id)
    }
  }, [])

  const open = useCallback<LightboxCtx['open']>((id) => {
    const entries = [...slidesRef.current.entries()].filter(([, v]) => v.el)
    entries.sort(([, a], [, b]) => {
      const pos = a.el!.compareDocumentPosition(b.el!)
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1
      return 0
    })
    const slides: CustomSlide[] = entries.map(([, v]) => ({
      src: v.data.src,
      alt: v.data.alt,
      description: v.data.caption,
      unoptimized: v.data.unoptimized,
    }))
    const index = Math.max(
      0,
      entries.findIndex(([entryId]) => entryId === id),
    )
    setOpenState({ slides, index })
  }, [])

  return (
    <ctx.Provider value={{ register, open }}>
      {children}
      <Lightbox
        open={openState !== null}
        close={() => setOpenState(null)}
        slides={openState?.slides ?? []}
        index={openState?.index ?? 0}
        plugins={[Captions, Zoom]}
        captions={{ descriptionTextAlign: 'center', showToggle: false }}
        zoom={{ maxZoomPixelRatio: 4, scrollToZoom: true }}
        carousel={{ finite: true, padding: 0 }}
        controller={{ closeOnBackdropClick: true, closeOnPullDown: true }}
        styles={{
          root: { zIndex: 9999 },
          container: { backgroundColor: '#000' },
        }}
        render={{
          slide: ({ slide, rect }: RenderSlideProps) => {
            const s = slide as CustomSlide
            if (!s.src) return null
            return (
              <div style={{ position: 'relative', width: rect.width, height: rect.height }}>
                <NextImage
                  src={s.src}
                  alt={s.alt ?? ''}
                  fill
                  sizes="100vw"
                  unoptimized={s.unoptimized}
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
            )
          },
        }}
      />
    </ctx.Provider>
  )
}

export function useLightboxRegister(): LightboxCtx | null {
  return useContext(ctx)
}
