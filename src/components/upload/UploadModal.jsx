import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Modal } from '../ui/Modal'
import { Step1Photo } from './Step1_Photo'
import { Step2Process } from './Step2_Process'
import { Step3Details } from './Step3_Details'
import { Step4Confirm } from './Step4_Confirm'
import { useUIStore } from '../../store/uiStore'
import { useWardrobe } from '../../hooks/useWardrobe'
import { blobADataUrl, thumbnailDesdeBlob, extraerColorDominante } from '../../utils/imageProcessor'
import { SILUETAS_POR_ZONA } from '../../utils/ProceduralMeshes'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const PASOS = ['Foto', 'Recorte', 'Detalles', 'Listo']

const DATOS_INICIALES = {
  name: '', body_zone: '', silhouette_type: '', category: '',
  styles: [], size: '', brand: '', notes: '', favorite: false,
}

export function UploadModal() {
  const { uploadModalOpen, closeUpload } = useUIStore()
  const { guardarPrenda } = useWardrobe()

  const [paso, setPaso] = useState(0)
  const [dir, setDir] = useState(1)
  const [archivoOriginal, setArchivoOriginal] = useState(null)
  const [blobProcesado, setBlobProcesado] = useState(null)
  const [urlProcesadaPreview, setUrlProcesadaPreview] = useState(null)
  const [datos, setDatos] = useState(DATOS_INICIALES)
  const [guardando, setGuardando] = useState(false)

  const actualizarDato = (campo, valor) => setDatos((d) => ({ ...d, [campo]: valor }))

  const reiniciar = () => {
    if (urlProcesadaPreview) URL.revokeObjectURL(urlProcesadaPreview)
    setPaso(0); setDir(1)
    setArchivoOriginal(null)
    setBlobProcesado(null)
    setUrlProcesadaPreview(null)
    setDatos(DATOS_INICIALES)
  }
  const cerrar = () => { reiniciar(); closeUpload() }

  const ir = (n) => { setDir(n > paso ? 1 : -1); setPaso(n) }

  const onFotoSeleccionada = (archivo) => { setArchivoOriginal(archivo); ir(1) }
  const onProcesado = (blob) => {
    setBlobProcesado(blob)
    setUrlProcesadaPreview(URL.createObjectURL(blob))
  }

  const puedeAvanzar = () => {
    if (paso === 1) return !!blobProcesado
    if (paso === 2) {
      // Si la zona tiene siluetas disponibles, exigir elegir una: sin silueta la
      // prenda no se puede posicionar en el avatar (causa del "puesto pero no sale").
      const exigeSilueta = (SILUETAS_POR_ZONA[datos.body_zone]?.length ?? 0) > 0
      return Boolean(
        datos.name.trim() && datos.body_zone && datos.category &&
        (!exigeSilueta || datos.silhouette_type)
      )
    }
    return true
  }

  const guardar = async () => {
    setGuardando(true)
    try {
      const processed = await blobADataUrl(blobProcesado)
      const thumb = await thumbnailDesdeBlob(blobProcesado, 360)
      const color = await extraerColorDominante(processed).catch(() => '#B9AE9C')
      await guardarPrenda({
        ...datos,
        name: datos.name.trim(),
        image_processed_url: processed,
        image_original_url: processed,
        thumbnail_url: thumb,
        dominant_color: color,
      })
      toast.success('Prenda añadida a tu armario')
      cerrar()
    } catch (e) {
      console.error(e)
      toast.error('No se pudo guardar la prenda')
    } finally {
      setGuardando(false)
    }
  }

  const avanzar = () => { if (paso === 3) guardar(); else ir(paso + 1) }

  return (
    <Modal
      abierto={uploadModalOpen}
      onCerrar={cerrar}
      titulo="Añadir prenda"
      subtitulo={`Paso ${paso + 1} de 4 · ${PASOS[paso]}`}
      ancho="md"
    >
      {/* Stepper */}
      <div className="px-7 sm:px-10 pt-6 pb-6 flex-shrink-0">
        <div className="relative flex justify-between">
          {/* Track de fondo + progreso */}
          <div className="absolute top-[15px] left-3 right-3 h-[2px] rounded-full bg-tinted" />
          <div
            className="absolute top-[15px] left-3 h-[2px] rounded-full bg-accent transition-all duration-500"
            style={{ width: `calc((100% - 1.5rem) * ${paso / (PASOS.length - 1)})` }}
          />
          {PASOS.map((nombre, idx) => (
            <div key={idx} className="relative flex flex-col items-center gap-2 bg-surface px-2">
              <div className={clsx(
                'flex items-center justify-center w-[30px] h-[30px] rounded-full text-[12px] font-bold flex-shrink-0 transition-all',
                idx < paso ? 'bg-accent text-white shadow-[var(--shadow-accent)]'
                : idx === paso ? 'bg-ink text-white shadow-[var(--shadow-sm)] ring-4 ring-ink/10'
                : 'bg-tinted text-faint'
              )}>
                {idx < paso ? (
                  <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6.5l2.5 2.5L10 3.5" /></svg>
                ) : idx + 1}
              </div>
              <span className={clsx(
                'text-[11px] font-semibold tracking-wide transition-colors',
                idx === paso ? 'text-ink' : idx < paso ? 'text-accent-deep' : 'text-faint'
              )}>
                {nombre}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Contenido animado */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={paso}
            custom={dir}
            initial={{ opacity: 0, x: dir * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -28 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            {paso === 0 && <Step1Photo onFotoSeleccionada={onFotoSeleccionada} />}
            {paso === 1 && (
              <Step2Process archivoOriginal={archivoOriginal} onProcesado={onProcesado} onReintentar={reiniciar} />
            )}
            {paso === 2 && <Step3Details datos={datos} onChange={actualizarDato} />}
            {paso === 3 && <Step4Confirm datos={datos} urlProcesada={urlProcesadaPreview} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-7 sm:px-10 py-5 border-t border-hairline flex items-center justify-between gap-3 flex-shrink-0 bg-surface">
        <button
          onClick={() => paso === 0 ? cerrar() : ir(paso - 1)}
          disabled={guardando || paso === 1}
          className="btn btn-ghost"
        >
          {paso === 0 ? 'Cancelar' : 'Atrás'}
        </button>
        {paso > 0 && (
          <button
            onClick={avanzar}
            disabled={!puedeAvanzar() || guardando}
            className={clsx('btn', paso === 3 ? 'btn-accent' : 'btn-primary')}
          >
            {guardando && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {paso === 3 ? (guardando ? 'Guardando' : 'Guardar prenda') : 'Continuar'}
          </button>
        )}
      </div>
    </Modal>
  )
}
