import { useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { precargarModeloRecorte } from '../../hooks/useBgRemoval'

const MAX_BYTES = 10 * 1024 * 1024

export function Step1Photo({ onFotoSeleccionada }) {
  // Calienta el modelo de recorte mientras el usuario elige la foto, para que el
  // procesado posterior sea casi instantáneo.
  useEffect(() => {
    precargarModeloRecorte().catch(() => {})
  }, [])

  const onDrop = useCallback((archivos) => {
    const archivo = archivos[0]
    if (!archivo) return
    if (archivo.size > MAX_BYTES) { toast.error('La imagen supera 10 MB'); return }
    onFotoSeleccionada(archivo)
  }, [onFotoSeleccionada])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, multiple: false, maxSize: MAX_BYTES,
  })

  return (
    <div className="px-7 sm:px-10 pb-8 pt-1 space-y-5">
      <p className="text-[13.5px] text-muted leading-relaxed">
        Sube una foto de la prenda sobre fondo claro. Quitaremos el fondo automáticamente.
      </p>

      <div
        {...getRootProps()}
        className={clsx(
          'relative rounded-[18px] border-2 border-dashed px-6 py-14 text-center cursor-pointer transition-all overflow-hidden',
          isDragActive
            ? 'border-accent bg-accent-tint scale-[0.99]'
            : 'border-line-strong bg-canvas/40 hover:border-accent/60 hover:bg-accent-tint/40'
        )}
      >
        <input {...getInputProps()} />
        <div className={clsx(
          'w-[68px] h-[68px] mx-auto mb-5 rounded-[20px] flex items-center justify-center transition-all',
          isDragActive ? 'bg-accent text-white scale-110' : 'bg-gradient-to-b from-accent-soft to-accent-tint text-accent-deep'
        )}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 16V4M7 9l5-5 5 5" />
            <path d="M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
          </svg>
        </div>
        <p className="text-ink text-[16px] font-semibold">
          {isDragActive ? 'Suelta para subir' : 'Arrastra una foto aquí'}
        </p>
        <p className="text-muted text-[13px] mt-1.5">o haz clic para elegir del dispositivo</p>
        <p className="inline-block text-faint text-[11px] mt-5 px-3 py-1 rounded-full bg-tinted/60 tracking-wide">JPG · PNG · WEBP — hasta 10 MB</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-hairline" />
        <span className="text-[11px] text-faint font-medium">o</span>
        <div className="flex-1 h-px bg-hairline" />
      </div>

      <label className="btn btn-outline btn-block btn-lg cursor-pointer">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 17a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h2.5L9 5h6l1.5 2H19a1 1 0 0 1 1 1z" />
          <circle cx="12" cy="12.5" r="3" />
        </svg>
        Usar la cámara
        <input
          type="file" accept="image/*" capture="environment" className="hidden"
          onChange={(e) => { const a = e.target.files?.[0]; if (a) onFotoSeleccionada(a) }}
        />
      </label>
    </div>
  )
}
