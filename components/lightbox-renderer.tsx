'use client'

import NextImage from 'next/image'
import Lightbox, { type RenderSlideProps, type SlideImage } from 'yet-another-react-lightbox'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/captions.css'

type CustomSlide = SlideImage & { unoptimized?: boolean }

type LightboxRendererProps = {
  open: boolean
  close: () => void
  slides: CustomSlide[]
  index: number
}

export default function LightboxRenderer({ open, close, slides, index }: LightboxRendererProps) {
  return (
    <Lightbox
      open={open}
      close={close}
      slides={slides}
      index={index}
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
  )
}
