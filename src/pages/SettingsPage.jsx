import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useWardrobeStore } from '../store/wardrobeStore'
import { useOutfitsStore } from '../store/outfitsStore'
import { cloudHabilitado, dbObtenerNombre, dbGuardarNombre } from '../lib/db'

const LS_NAME = 'closia.name.v1'

function Card({ titulo, descripcion, children }) {
  return (
    <section className="card p-5 sm:p-6">
      <h3 className="text-[16px] font-bold text-ink">{titulo}</h3>
      {descripcion && <p className="text-[12.5px] text-muted mt-1 mb-4">{descripcion}</p>}
      {children}
    </section>
  )
}

export function SettingsPage() {
  const { categories, addCategory, removeCategory, items, vaciarPrendas } = useWardrobeStore()
  const outfits = useOutfitsStore((s) => s.outfits)
  const [nombre, setNombre] = useState(() => localStorage.getItem(LS_NAME) ?? 'Carolina')
  const [nuevaCat, setNuevaCat] = useState('')

  // Trae el nombre desde la nube al entrar.
  useEffect(() => {
    if (!cloudHabilitado) return
    dbObtenerNombre().then((n) => { if (n) { setNombre(n); localStorage.setItem(LS_NAME, n) } }).catch(() => {})
  }, [])

  const guardarNombre = () => {
    const limpio = nombre.trim() || 'Carolina'
    localStorage.setItem(LS_NAME, limpio)
    if (cloudHabilitado) dbGuardarNombre(limpio).catch((e) => console.warn('[CLOSIA] Guardar nombre:', e?.message ?? e))
    toast.success('Perfil guardado')
  }

  const agregarCat = () => {
    if (!nuevaCat.trim()) return
    addCategory(nuevaCat)
    setNuevaCat('')
  }

  const vaciarArmario = () => {
    if (!confirm('¿Eliminar todas las prendas? No se puede deshacer.')) return
    vaciarPrendas()
    toast.success('Armario vaciado')
  }

  const borrarTodo = () => {
    if (!confirm('¿Borrar TODO (prendas, looks y categorías)? No se puede deshacer.')) return
    Object.keys(localStorage).filter((k) => k.startsWith('closia.')).forEach((k) => localStorage.removeItem(k))
    location.reload()
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-5">
        <header>
          <p className="eyebrow">Preferencias</p>
          <h1 className="title-xl text-ink mt-1.5">Ajustes</h1>
        </header>

        {/* Perfil */}
        <Card titulo="Perfil" descripcion="Tu nombre dentro de closia.">
          <div className="flex gap-2">
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="field flex-1" placeholder="Tu nombre" />
            <button onClick={guardarNombre} className="btn btn-primary flex-shrink-0">Guardar</button>
          </div>
        </Card>

        {/* Categorías */}
        <Card titulo="Categorías" descripcion="Organiza tus prendas. Se usan al añadir una nueva.">
          <div className="flex flex-wrap gap-2 mb-3">
            {categories.length === 0 && <p className="text-[12.5px] text-faint">No hay categorías aún.</p>}
            {categories.map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 pl-3.5 pr-1.5 h-9 rounded-full bg-tinted border border-hairline text-[12.5px] font-medium text-ink-soft">
                {c}
                <button onClick={() => removeCategory(c)} className="w-5 h-5 rounded-full hover:bg-danger-soft hover:text-danger flex items-center justify-center text-muted">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 3l6 6M9 3l-6 6" /></svg>
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={nuevaCat} onChange={(e) => setNuevaCat(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') agregarCat() }}
              className="field flex-1" placeholder="Nueva categoría…"
            />
            <button onClick={agregarCat} disabled={!nuevaCat.trim()} className="btn btn-accent flex-shrink-0">Añadir</button>
          </div>
        </Card>

        {/* Datos */}
        <Card titulo="Tus datos" descripcion={`${items.length} prendas · ${outfits.length} looks guardados.`}>
          <div className="flex flex-wrap gap-2">
            <button onClick={vaciarArmario} className="btn btn-outline">Vaciar armario</button>
            <button onClick={borrarTodo} className="btn btn-danger">Borrar todo</button>
          </div>
        </Card>

        <p className="text-center text-[11.5px] text-faint pt-2">closia · armario virtual · v0.4</p>
      </div>
    </div>
  )
}
