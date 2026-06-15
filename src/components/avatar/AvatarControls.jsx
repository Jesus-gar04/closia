import { useAvatarStore } from '../../store/avatarStore'
import { useUIStore } from '../../store/uiStore'
import clsx from 'clsx'

const POSES = [
  {
    id: 'idle', label: 'Reposo',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="7" r="2.5" /><path d="M9 21l1.5-9 1.5 3 1.5-3L15 21M12 11v3" /></svg>,
  },
  {
    id: 'fashion', label: 'Pose',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="6" r="2.5" /><path d="M12 9v6M8 13l4 2 4-2M9 21l3-6 3 6" /></svg>,
  },
  {
    id: 'walk', label: 'Caminar',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="13" cy="5" r="2" /><path d="M9 21l2-5 1-3 3 3 3-2M11 13l-3 3" /></svg>,
  },
]

function IcnCamera() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 15a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h2L8 4h4l2 2h2a1 1 0 0 1 1 1z" />
      <circle cx="10" cy="11" r="2.5" />
    </svg>
  )
}
function IcnSave() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 18H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h9L17 6V17a1 1 0 0 1-1 1z" />
      <path d="M13 2v5H6V2M6 18v-6h8v6" />
    </svg>
  )
}
export function AvatarControls({ onScreenshot }) {
  const { pose, setPose, currentOutfit } = useAvatarStore()
  const { openSaveOutfit } = useUIStore()
  const tienePrendas = Object.values(currentOutfit).some(Boolean)

  return (
    <div className="flex items-center justify-between gap-3 px-4 md:px-7 py-3 bg-surface/85 backdrop-blur-xl border-t border-hairline flex-shrink-0">
      {/* Pose segmented */}
      <div className="segmented">
        {POSES.map((p) => (
          <button key={p.id} onClick={() => setPose(p.id)} data-on={pose === p.id}>
            <span className="opacity-90">{p.icon}</span>
            <span className="hidden sm:inline">{p.label}</span>
          </button>
        ))}
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2">
        <button onClick={onScreenshot} title="Descargar captura" className="btn btn-outline btn-icon btn-sm">
          <IcnCamera />
        </button>
        <button onClick={openSaveOutfit} disabled={!tienePrendas} className="btn btn-accent btn-sm">
          <IcnSave />
          <span className="hidden sm:inline">Guardar look</span>
        </button>
      </div>
    </div>
  )
}
