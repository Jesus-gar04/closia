import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows, SoftShadows } from '@react-three/drei'
import { Suspense } from 'react'
import * as THREE from 'three'
import { useAvatarStore } from '../../store/avatarStore'
import { AvatarModel } from './AvatarModel'
import { ClothingMesh } from './ClothingMesh'
import { WalkingCloset } from './WalkingCloset'

// El avatar se auto-escala a 1.7m y apoya los pies en world Y=-1 (ver AvatarModel).
const AVATAR_FEET_Y = -1

// Guías de calibración: barras horizontales en las alturas de referencia del cuerpo
// (espacio "pies en Y=0", igual que las prendas). Poner en true para recalibrar ZONAS
// a ojo; dejar en false en producción.
const MOSTRAR_GUIAS = false

// Alturas de referencia MEDIDAS sobre avatar.glb (ver comentario en ProceduralMeshes.js).
const GUIAS = [
  { y: 1.48, color: '#9C27B0', etiqueta: 'cuello' },
  { y: 1.40, color: '#F44336', etiqueta: 'hombros' },
  { y: 1.10, color: '#2196F3', etiqueta: 'cintura/pretina' },
  { y: 0.98, color: '#4CAF50', etiqueta: 'cadera' },
  { y: 0.70, color: '#FF9800', etiqueta: 'rodillas' },
  { y: 0.45, color: '#00BCD4', etiqueta: 'tobillos' },
  { y: 0.00, color: '#9E9E9E', etiqueta: 'pies' },
]

function GuiasCalibracion() {
  return (
    <>
      {GUIAS.map(({ y, color }) => (
        <mesh key={y} position={[0, y, 0.32]}>
          <boxGeometry args={[1, 0.008, 0.008]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      ))}
    </>
  )
}

function Escena() {
  const { currentOutfit, pose } = useAvatarStore()

  return (
    <>
      {/* Luz de cielo/suelo — relleno natural, suave y neutro */}
      <hemisphereLight args={['#FBF8F2', '#D8CFC0', 0.85]} />

      {/* Luz ambiente baja para levantar sombras sin lavar */}
      <ambientLight intensity={0.25} color="#FFFFFF" />

      {/* Key light — única direccional, neutra, intensidad contenida */}
      <directionalLight
        position={[2.5, 4.5, 3]}
        intensity={0.85}
        color="#FFFDF8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={20}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={5}
        shadow-camera-bottom={-2}
        shadow-bias={-0.00025}
        shadow-normalBias={0.02}
      />

      {/* Relleno frontal muy tenue para modelar el rostro */}
      <directionalLight position={[-2, 2.5, 2.5]} intensity={0.22} color="#F3EEE6" />

      <ContactShadows
        position={[0, -0.985, 0]}
        opacity={0.28}
        scale={5}
        blur={3.2}
        far={3}
        color="#36322C"
      />

      <WalkingCloset />
      <AvatarModel pose={pose} />

      {/* Las prendas se construyen en espacio "pies en Y=0", pero el avatar
          apoya los pies en world Y=-1 (sobre el suelo). Desplazamos el grupo
          para que la ropa caiga sobre el cuerpo y no flote sobre las baldas. */}
      <group position={[0, AVATAR_FEET_Y, 0]}>
        {MOSTRAR_GUIAS && <GuiasCalibracion />}
        {Object.entries(currentOutfit).map(([slot, prenda]) => {
          if (!prenda) return null
          return (
            <ClothingMesh
              key={`${slot}-${prenda.id}`}
              tipoSilueta={prenda.silhouette_type}
              bodyZone={prenda.body_zone}
              texturaUrl={prenda.image_processed_url}
              fit={{
                scaleX: prenda.fit_scale_x,
                scaleY: prenda.fit_scale_y,
                offsetX: prenda.fit_offset_x,
                offsetY: prenda.fit_offset_y,
              }}
            />
          )
        })}
      </group>

      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={1.8}
        maxDistance={5.0}
        maxPolarAngle={Math.PI / 1.85}
        minPolarAngle={Math.PI / 4}
        target={[0, 0.55, 0]}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  )
}

export function AvatarScene() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0.95, 3.6], fov: 38 }}
        shadows
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 0.82
        }}
        dpr={[1, 2]}
        style={{
          background: 'linear-gradient(180deg, #EDE7DD 0%, #E2D9C9 55%, #D4C9B5 100%)',
        }}
      >
        <SoftShadows samples={10} size={14} />
        <Suspense fallback={null}>
          <Escena />
        </Suspense>
      </Canvas>
    </div>
  )
}
