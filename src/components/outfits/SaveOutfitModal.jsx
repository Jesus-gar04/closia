import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { useUIStore } from '../../store/uiStore'
import { useAvatarStore } from '../../store/avatarStore'
import { useOutfits } from '../../hooks/useOutfits'
import toast from 'react-hot-toast'

export function SaveOutfitModal({ canvasRef }) {
  const { saveOutfitModalOpen, closeSaveOutfit } = useUIStore()
  const { currentOutfit } = useAvatarStore()
  const { guardarOutfit } = useOutfits()

  const [nombre, setNombre] = useState('')
  const [tags, setTags] = useState('')
  const [guardando, setGuardando] = useState(false)

  const cerrar = () => { setNombre(''); setTags(''); closeSaveOutfit() }

  const guardar = async () => {
    if (!nombre.trim()) { toast.error('Ponle un nombre al look'); return }
    setGuardando(true)
    try {
      let screenshotUrl = null
      const canvas = canvasRef?.current?.querySelector('canvas')
      if (canvas) {
        try { screenshotUrl = canvas.toDataURL('image/jpeg', 0.82) } catch { /* noop */ }
      }
      const clothingIds = Object.values(currentOutfit).filter(Boolean).map((p) => p.id)
      await guardarOutfit({
        nombre: nombre.trim(),
        clothingIds,
        screenshotUrl,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      })
      toast.success('Look guardado')
      cerrar()
    } catch {
      toast.error('No se pudo guardar')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal abierto={saveOutfitModalOpen} onCerrar={cerrar} titulo="Guardar look" subtitulo="Dale un nombre y etiquétalo" ancho="sm">
      <div className="px-6 sm:px-8 py-6 space-y-5">
        <div>
          <label className="block text-[11.5px] font-medium text-ink-soft mb-2">Nombre del look *</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Lunes de oficina"
            autoFocus
            className="field"
          />
        </div>
        <div>
          <label className="block text-[11.5px] font-medium text-ink-soft mb-2">Etiquetas <span className="text-faint font-normal">(opcional)</span></label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="casual, verano, favorito"
            className="field"
          />
          <p className="text-[11px] text-faint mt-1.5">Separa con comas</p>
        </div>
      </div>
      <div className="px-6 sm:px-8 pb-6 flex gap-2">
        <Button variante="secundario" className="flex-1" onClick={cerrar} disabled={guardando}>Cancelar</Button>
        <Button variante="acento" className="flex-1" onClick={guardar} cargando={guardando}>Guardar</Button>
      </div>
    </Modal>
  )
}
