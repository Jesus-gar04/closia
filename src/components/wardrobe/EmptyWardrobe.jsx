import { useUIStore } from '../../store/uiStore'
import { Button } from '../ui/Button'

export function EmptyWardrobe() {
  const { openUpload } = useUIStore()
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-16 px-8">
      <div className="relative w-32 h-32 mb-6">
        <div className="absolute inset-0 rounded-full bg-accent-soft" />
        <div className="absolute inset-3 rounded-full bg-accent-soft" />
        <div className="absolute inset-6 rounded-full bg-sage-soft flex items-center justify-center text-accent-deep">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 6a2 2 0 0 1 2 2c0 1-1 1.6-1 2.4L21 15H3l8-4.6c0-.8-1-1.4-1-2.4a2 2 0 0 1 2-2z" />
            <path d="M3 15v3.5A1.5 1.5 0 0 0 4.5 20h15a1.5 1.5 0 0 0 1.5-1.5V15" />
          </svg>
        </div>
      </div>
      <h3 className="text-[22px] font-bold text-ink tracking-tight mb-2">Tu armario está vacío</h3>
      <p className="text-muted text-[13.5px] mb-6 max-w-xs">
        Sube tu primera prenda y empieza a combinar looks en 3D.
      </p>
      <Button variante="acento" onClick={openUpload}>Agregar primera prenda</Button>
    </div>
  )
}
