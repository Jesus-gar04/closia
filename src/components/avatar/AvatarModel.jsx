import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────
   Avatar femenino — usa /models/avatar.glb
   Auto-escalado a 1.7m, recentrado con pies en Y=0.
   Si el GLB no trae animaciones, simulamos pose con transforms.
   ───────────────────────────────────────────────────────────── */

const AVATAR_PATH = '/models/avatar.glb'
const TARGET_HEIGHT = 1.7
const MAT_SKIN_OVERRIDE = '#DED3C4'

function AvatarFromGLB({ url, pose }) {
  const grupoRef = useRef()
  const innerRef = useRef()
  const gltf = useGLTF(url)
  const { actions } = useAnimations(gltf.animations ?? [], grupoRef)

  /* Clonar y normalizar tamaño */
  const { scene, offsetY, scale } = useMemo(() => {
    const cloned = gltf.scene.clone(true)
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        const mat = new THREE.MeshStandardMaterial({
          color: MAT_SKIN_OVERRIDE,
          roughness: 0.62,
          metalness: 0.02,
        })
        child.material = mat
      }
    })
    const box = new THREE.Box3().setFromObject(cloned)
    const size = new THREE.Vector3()
    box.getSize(size)
    const s = size.y > 0 ? TARGET_HEIGHT / size.y : 1
    const offY = -box.min.y * s
    return { scene: cloned, offsetY: offY, scale: s }
  }, [gltf.scene])

  /* Animaciones reales si el GLB las trae */
  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return
    const map = { idle: 'Idle', fashion: 'Standing', walk: 'Walking' }
    const want = map[pose] ?? 'Idle'
    const found = actions[want] ?? Object.values(actions)[0]
    if (found) {
      Object.values(actions).forEach((a) => a.fadeOut?.(0.25))
      found.reset().fadeIn(0.25).play()
    }
  }, [pose, actions])

  /* Si no hay animaciones, simulamos pose con rotación + balanceo idle */
  const hasAnimations = !!gltf.animations?.length
  const baseRotY = pose === 'fashion' ? 0.35 : pose === 'walk' ? -0.18 : 0
  const baseTilt = pose === 'fashion' ? 0.06 : 0

  useFrame((state) => {
    if (!innerRef.current || hasAnimations) return
    const t = state.clock.elapsedTime
    if (pose === 'idle') {
      innerRef.current.rotation.y = Math.sin(t * 0.7) * 0.04
      innerRef.current.position.y = Math.sin(t * 1.2) * 0.008
    } else if (pose === 'walk') {
      // Balanceo suave + leve avance-retroceso simulando paso en sitio
      innerRef.current.rotation.y = baseRotY + Math.sin(t * 2.4) * 0.08
      innerRef.current.position.y = Math.abs(Math.sin(t * 3.2)) * 0.025
      innerRef.current.rotation.z = Math.sin(t * 2.4) * 0.025
    } else if (pose === 'fashion') {
      innerRef.current.rotation.y = baseRotY + Math.sin(t * 0.5) * 0.05
      innerRef.current.rotation.z = baseTilt
      innerRef.current.position.y = 0
    }
  })

  return (
    <group ref={grupoRef} position={[0, -1 + offsetY, 0]}>
      <group ref={innerRef} scale={[scale, scale, scale]}>
        <primitive object={scene} />
      </group>
    </group>
  )
}

export function AvatarModel({ pose, avatarUrl = AVATAR_PATH }) {
  return <AvatarFromGLB url={avatarUrl} pose={pose} />
}

useGLTF.preload(AVATAR_PATH)
