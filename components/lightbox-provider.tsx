'use client'

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import dynamic from 'next/dynamic'
import type { SlideImage } from 'yet-another-react-lightbox'

const LightboxRenderer = dynamic(() => import('./lightbox-renderer'), {
  ssr: false,
})

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
      {openState !== null && (
        <LightboxRenderer
          open
          close={() => setOpenState(null)}
          slides={openState.slides}
          index={openState.index}
        />
      )}
    </ctx.Provider>
  )
}

export function useLightboxRegister(): LightboxCtx | null {
  return useContext(ctx)
}
