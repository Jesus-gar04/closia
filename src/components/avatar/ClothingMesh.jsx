import { useEffect, useRef } from 'react'
import { construirMesh, aplicarTextura } from '../../utils/ProceduralMeshes'

/* Render de una prenda como mesh procedural sobre el avatar.
   Limpia geometría/materiales/texturas al desmontar para evitar leaks. */
export function ClothingMesh({ tipoSilueta, bodyZone, texturaUrl, fit }) {
  const grupoRef = useRef()
  const meshRef = useRef(null)

  // Ajuste fino por prenda — desestructurado a primitivas para deps estables.
  const fitScaleX = fit?.scaleX
  const fitScaleY = fit?.scaleY
  const fitOffsetX = fit?.offsetX
  const fitOffsetY = fit?.offsetY

  useEffect(() => {
    if (!grupoRef.current) return
    // Desmontar anterior
    if (meshRef.current) {
      grupoRef.current.remove(meshRef.current)
      meshRef.current.traverse?.((hijo) => {
        if (hijo.isMesh) {
          hijo.geometry?.dispose()
          if (hijo.material?.map) hijo.material.map.dispose()
          hijo.material?.dispose()
        }
      })
      meshRef.current = null
    }
    const nuevo = construirMesh(tipoSilueta, bodyZone, {
      scaleX: fitScaleX,
      scaleY: fitScaleY,
      offsetX: fitOffsetX,
      offsetY: fitOffsetY,
    })
    if (!nuevo) return
    meshRef.current = nuevo
    grupoRef.current.add(nuevo)
  }, [tipoSilueta, bodyZone, fitScaleX, fitScaleY, fitOffsetX, fitOffsetY])

  useEffect(() => {
    if (!meshRef.current || !texturaUrl) return
    aplicarTextura(meshRef.current, texturaUrl)
  }, [texturaUrl, tipoSilueta, bodyZone, fitScaleX, fitScaleY, fitOffsetX, fitOffsetY])

  useEffect(() => () => {
    if (!meshRef.current) return
    meshRef.current.traverse?.((hijo) => {
      if (hijo.isMesh) {
        hijo.geometry?.dispose()
        if (hijo.material?.map) hijo.material.map.dispose()
        hijo.material?.dispose()
      }
    })
  }, [])

  return <group ref={grupoRef} />
}
