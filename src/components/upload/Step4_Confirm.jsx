const CHECKER = 'repeating-conic-gradient(#E7DFD1 0% 25%, #FBF8F2 0% 50%) 0 0 / 16px 16px'

const ZONA_LABEL = {
  torso: 'Torso', legs: 'Piernas', dress: 'Vestido', outer: 'Abrigo',
  feet: 'Calzado', head: 'Cabeza', neck: 'Cuello', wrist: 'Muñeca', accessory: 'Bolso',
}

export function Step4Confirm({ datos, urlProcesada }) {
  return (
    <div className="px-7 sm:px-10 pb-8 pt-1 space-y-4">
      <div className="flex items-center gap-1.5 text-success text-[12px] font-semibold">
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3 3 7-7" /></svg>
        Todo listo para guardar
      </div>

      <div className="card p-5 flex gap-5 items-start">
        <div className="w-32 h-32 rounded-[14px] overflow-hidden flex-shrink-0 border border-hairline shadow-[var(--shadow-xs)]" style={{ background: CHECKER }}>
          {urlProcesada && <img src={urlProcesada} alt="Prenda" className="w-full h-full object-contain" />}
        </div>

        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <h3 className="font-display text-[20px] font-semibold text-ink leading-tight truncate">{datos.name}</h3>
            <p className="text-[12.5px] text-muted mt-1">
              {ZONA_LABEL[datos.body_zone] ?? datos.body_zone}
            </p>
          </div>

          <span className="inline-block px-2.5 py-1 rounded-full bg-accent-soft text-accent-deep text-[11.5px] font-semibold">
            {datos.category}
          </span>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted">
            {datos.brand && <span><span className="text-faint">Marca:</span> {datos.brand}</span>}
            {datos.size && <span><span className="text-faint">Talla:</span> {datos.size}</span>}
            {datos.favorite && <span className="text-accent-deep font-semibold">★ Favorita</span>}
          </div>

          {(datos.styles ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {datos.styles.map((s) => (
                <span key={s} className="px-2.5 py-0.5 bg-tinted text-ink-soft text-[10.5px] rounded-full capitalize font-medium">{s}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {datos.notes && (
        <p className="text-[12.5px] text-ink-soft bg-canvas border border-hairline rounded-[14px] p-4 leading-relaxed">{datos.notes}</p>
      )}
    </div>
  )
}
