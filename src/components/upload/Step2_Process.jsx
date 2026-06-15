import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useBgRemoval } from '../../hooks/useBgRemoval'

const CHECKER = 'repeating-conic-gradient(#E7DFD1 0% 25%, #FBF8F2 0% 50%) 0 0 / 18px 18px'

const MENSAJES = [
  'Preparando el modelo…',
  'Analizando la prenda…',
  'Separando del fondo…',
  'Afinando los bordes…',
  'Casi listo…',
]

export function Step2Process({ archivoOriginal, onProcesado, onReintentar }) {
  const { procesar } = useBgRemoval()
  const archivoProcesadoRef = useRef(null)
  const [urlOriginal, setUrlOriginal] = useState(null)
  const [urlProcesada, setUrlProcesada] = useState(null)
  const [procesando, setProcesando] = useState(true)
  const [error, setError] = useState(null)
  const [msgIdx, setMsgIdx] = useState(0)

  useEffect(() => {
    if (!archivoOriginal) return
    const url = URL.createObjectURL(archivoOriginal)
    setUrlOriginal(url)
    return () => URL.revokeObjectURL(url)
  }, [archivoOriginal])

  // Mensajes rotatorios mientras procesa (progreso real no es fiable)
  useEffect(() => {
    if (!procesando) return
    const t = setInterval(() => setMsgIdx((i) => (i + 1) % MENSAJES.length), 2200)
    return () => clearInterval(t)
  }, [procesando])

  useEffect(() => {
    if (!archivoOriginal) return
    // Procesar UNA sola vez por archivo. StrictMode invoca el efecto dos veces en dev;
    // sin esto se llamaría a la API por duplicado (gasta créditos). Usamos el ref como
    // compuerta: en el .then comprobamos que seguimos en el mismo archivo, en vez de un
    // flag cancelado por-efecto (ese descartaba el ÚNICO resultado real bajo StrictMode
    // y dejaba el recorte "cargando" para siempre).
    if (archivoProcesadoRef.current === archivoOriginal) return
    archivoProcesadoRef.current = archivoOriginal
    setError(null)
    setProcesando(true)
    procesar(archivoOriginal)
      .then((blob) => {
        if (archivoProcesadoRef.current !== archivoOriginal) return // archivo obsoleto
        setUrlProcesada(URL.createObjectURL(blob))
        onProcesado(blob)
        setProcesando(false)
      })
      .catch((e) => {
        console.error(e)
        if (archivoProcesadoRef.current !== archivoOriginal) return
        setError(e?.message || 'No pudimos quitar el fondo. Prueba con otra foto.')
        setProcesando(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [archivoOriginal])

  if (error) {
    return (
      <div className="px-7 sm:px-10 py-14 text-center space-y-5">
        <div className="w-16 h-16 mx-auto rounded-[20px] bg-danger-soft flex items-center justify-center text-danger">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M12 8v5M12 16.5h.01" /><circle cx="12" cy="12" r="9" /></svg>
        </div>
        <div className="space-y-1.5">
          <p className="font-display text-[18px] font-semibold text-ink">No pudimos quitar el fondo</p>
          <p className="text-muted text-[13px]">Prueba con una foto sobre fondo más claro y uniforme.</p>
        </div>
        <button onClick={onReintentar} className="btn btn-primary">
          Elegir otra foto
        </button>
      </div>
    )
  }

  if (procesando) {
    return (
      <div className="px-7 sm:px-10 py-16 flex flex-col items-center text-center">
        {/* preview difuminado con anillo */}
        <div className="relative w-28 h-28 mb-7">
          {urlOriginal && (
            <img src={urlOriginal} alt="" className="w-full h-full object-cover rounded-2xl blur-[1px] opacity-70" />
          )}
          <span className="absolute -inset-1.5 rounded-2xl border-2 border-accent/40" style={{ animation: 'pulse-ring 1.8s ease-out infinite' }} />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-9 h-9 rounded-full border-[3px] border-white/70 border-t-accent" style={{ animation: 'spin 0.8s linear infinite' }} />
          </span>
        </div>

        <p className="text-ink text-[15px] font-semibold">Quitando el fondo</p>
        <motion.p
          key={msgIdx}
          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="text-muted text-[12.5px] mt-1.5 h-4"
        >
          {MENSAJES[msgIdx]}
        </motion.p>

        {/* barra indeterminada */}
        <div className="w-44 h-1.5 bg-tinted rounded-full overflow-hidden mt-6">
          <motion.div
            className="h-full w-1/3 bg-accent rounded-full"
            animate={{ x: ['-110%', '320%'] }}
            transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="px-7 sm:px-10 pb-8 pt-1 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-soft text-success text-[11.5px] font-semibold">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3 3 7-7" /></svg>
          Fondo eliminado
        </div>
        <p className="font-display text-[18px] font-semibold text-ink">¿Quedó bien el recorte?</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <figure className="space-y-2.5">
          <figcaption className="text-[10.5px] text-faint text-center uppercase tracking-[0.18em] font-semibold">Original</figcaption>
          <img src={urlOriginal} alt="Original" className="w-full rounded-[14px] object-cover aspect-square border border-hairline shadow-[var(--shadow-xs)]" />
        </figure>
        <figure className="space-y-2.5">
          <figcaption className="text-[10.5px] text-accent-deep text-center uppercase tracking-[0.18em] font-semibold">Sin fondo</figcaption>
          <div className="w-full rounded-[14px] aspect-square overflow-hidden border-[1.5px] border-accent-soft shadow-[var(--shadow-sm)]" style={{ background: CHECKER }}>
            <img src={urlProcesada} alt="Procesada" className="w-full h-full object-contain" />
          </div>
        </figure>
      </div>
      <button onClick={onReintentar} className="btn btn-ghost btn-block">
        No me convence — usar otra foto
      </button>
    </div>
  )
}
