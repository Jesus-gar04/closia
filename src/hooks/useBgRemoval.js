import { useState, useCallback } from 'react'

export function precargarModeloRecorte() {
  return Promise.resolve()
}

export function useBgRemoval() {
  const [procesando, setProcesando] = useState(false)
  const [progreso, setProgreso] = useState(0)
  const [etapa, setEtapa] = useState('')

  const procesar = useCallback(async (archivoImagen) => {
    setProcesando(true)
    setProgreso(10)
    setEtapa('Enviando imagen…')

    const formData = new FormData()
    formData.append('image_file', archivoImagen)

    let status = null

    try {
      setProgreso(40)
      setEtapa('Quitando el fondo…')

      const res = await fetch('https://clipdrop-api.co/remove-background/v1', {
        method: 'POST',
        headers: { 'x-api-key': import.meta.env.VITE_CLIPDROP_API_KEY },
        body: formData,
      })

      status = res.status

      if (!res.ok) {
        const texto = await res.text().catch(() => '')
        throw new Error(`Error ${res.status}${texto ? `: ${texto}` : ''}`)
      }

      setProgreso(90)
      setEtapa('Finalizando…')

      return await res.blob()
    } catch (error) {
      if (status === 402) {
        throw new Error('Créditos agotados. Revisa tu cuenta de Clipdrop.', { cause: error })
      }
      throw new Error(error?.message || 'No se pudo quitar el fondo de la imagen.', { cause: error })
    } finally {
      setProcesando(false)
      setProgreso(0)
      setEtapa('')
    }
  }, [])

  return { procesar, procesando, progreso, etapa }
}