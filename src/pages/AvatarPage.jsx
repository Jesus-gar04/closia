import { useRef, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { AvatarScene } from '../components/avatar/AvatarScene'
import { AvatarControls } from '../components/avatar/AvatarControls'
import { FitEditor } from '../components/avatar/FitEditor'
import { BodyPanel } from '../components/body-panel/BodyPanel'
import { SaveOutfitModal } from '../components/outfits/SaveOutfitModal'
import clsx from 'clsx'

export function AvatarPage() {
  const canvasRef = useRef()
  const [isMobile, setIsMobile] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const c = () => setIsMobile(window.innerWidth < 920)
    c(); window.addEventListener('resize', c)
    return () => window.removeEventListener('resize', c)
  }, [])

  const capturar = () => {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    try {
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = `closia-look-${Date.now()}.png`
      a.click()
      toast.success('Captura descargada')
    } catch {
      toast.error('No se pudo capturar')
    }
  }

  return (
    <div className="flex w-full h-full overflow-hidden bg-canvas">
      <div ref={canvasRef} className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <div className="flex-1 overflow-hidden">
          <AvatarScene />
        </div>
        <FitEditor />
        <AvatarControls onScreenshot={capturar} />

        {isMobile && (
          <button
            onClick={() => setDrawerOpen(true)}
            className="absolute bottom-24 right-5 w-14 h-14 rounded-full bg-ink text-canvas shadow-lift flex items-center justify-center active:scale-95 z-20"
            aria-label="Vestir"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6a2 2 0 0 1 2 2c0 1-1 1.6-1 2.4L21 15H3l8-4.6c0-.8-1-1.4-1-2.4a2 2 0 0 1 2-2z" />
            </svg>
          </button>
        )}
      </div>

      {!isMobile && (
        <div className="w-[340px] flex-shrink-0 h-full overflow-hidden">
          <BodyPanel />
        </div>
      )}

      {isMobile && (
        <>
          <div
            onClick={() => setDrawerOpen(false)}
            className={clsx(
              'fixed inset-0 bg-ink/35 z-30',
              drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
          />
          <div className={clsx(
            'fixed bottom-0 left-0 right-0 max-h-[82vh] bg-surface rounded-t-2xl shadow-lift z-40 flex flex-col',
            drawerOpen ? 'translate-y-0' : 'translate-y-full'
          )} style={{ transition: 'transform .3s' }}>
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1.5 rounded-full bg-hairline" />
            </div>
            <div className="flex-1 overflow-hidden">
              <BodyPanel onClose={() => setDrawerOpen(false)} />
            </div>
          </div>
        </>
      )}

      <SaveOutfitModal canvasRef={canvasRef} />
    </div>
  )
}
