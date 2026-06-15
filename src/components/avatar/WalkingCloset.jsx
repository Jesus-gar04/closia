import { useMemo } from 'react'
import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────
   Walking closet minimalista cálido
   Paredes crema, madera clara, herrajes oro envejecido,
   ropa colgada en tonos tierra (sin colores brillantes).
   ───────────────────────────────────────────────────────────── */

const COL = {
  piso:        '#D9C6A6',
  pisoVeta:    '#C6B08C',
  paredFondo:  '#EFE3CE',
  paredLado:   '#E8DAC1',
  techo:       '#F2E7D2',
  panel:       '#FBF5E8',
  zocalo:      '#A88E6B',
  estante:     '#C9AE89',
  oro:         '#B98E5C',
  oroSuave:    '#D4AB7B',
}

/* Colores neutros apagados para las prendas decorativas */
const TONOS_ROPA = [
  '#C2B19C', '#B0A48F', '#C8BBA6', '#AD9C88',
  '#9CA293', '#BCAE99', '#C9BDA8', '#A89B88',
]

function Prenda({ x, y, z, color, alto = 0.5, ancho = 0.32 }) {
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.05, 0]}>
        <torusGeometry args={[0.020, 0.003, 8, 12, Math.PI]} />
        <meshStandardMaterial color={COL.oro} roughness={0.3} metalness={0.85} />
      </mesh>
      <mesh position={[0, -alto / 2 + 0.02, 0]} castShadow>
        <cylinderGeometry args={[ancho * 0.55, ancho * 0.42, alto, 12, 1, true]} />
        <meshStandardMaterial color={color} roughness={0.88} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function Barra({ x, y, z, ancho = 4, capsulas = 8 }) {
  const items = useMemo(() => {
    const arr = []
    const step = ancho / (capsulas + 1)
    for (let i = 1; i <= capsulas; i++) {
      arr.push({
        x: x - ancho / 2 + step * i,
        color: TONOS_ROPA[(i * 5) % TONOS_ROPA.length],
        alto: 0.46 + (i % 3) * 0.05,
      })
    }
    return arr
  }, [x, ancho, capsulas])

  return (
    <group>
      <mesh position={[x, y, z]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, ancho, 18]} />
        <meshStandardMaterial color={COL.oro} roughness={0.22} metalness={0.92} />
      </mesh>
      <mesh position={[x - ancho / 2, y + 0.04, z]}>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshStandardMaterial color={COL.oroSuave} roughness={0.25} metalness={0.85} />
      </mesh>
      <mesh position={[x + ancho / 2, y + 0.04, z]}>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshStandardMaterial color={COL.oroSuave} roughness={0.25} metalness={0.85} />
      </mesh>
      {items.map((p, i) => (
        <Prenda key={i} x={p.x} y={y - 0.04} z={z + 0.005} color={p.color} alto={p.alto} />
      ))}
    </group>
  )
}

function CajitasEstante({ x, y, z, ancho = 1.5 }) {
  return (
    <group>
      <mesh position={[x, y, z]} receiveShadow>
        <boxGeometry args={[ancho, 0.022, 0.34]} />
        <meshStandardMaterial color={COL.estante} roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh position={[x - ancho * 0.30, y + 0.09, z]} castShadow>
        <boxGeometry args={[0.22, 0.16, 0.22]} />
        <meshStandardMaterial color="#E5BFA0" roughness={0.85} />
      </mesh>
      <mesh position={[x + 0.02, y + 0.08, z]} castShadow>
        <boxGeometry args={[0.28, 0.13, 0.24]} />
        <meshStandardMaterial color="#D4AB7B" roughness={0.85} />
      </mesh>
      <mesh position={[x + ancho * 0.30, y + 0.10, z]} castShadow>
        <boxGeometry args={[0.20, 0.18, 0.20]} />
        <meshStandardMaterial color="#BD9876" roughness={0.85} />
      </mesh>
    </group>
  )
}

export function WalkingCloset() {
  return (
    <group>
      {/* ── PISO con vetas sutiles ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, -0.4]} receiveShadow>
        <planeGeometry args={[14, 12]} />
        <meshStandardMaterial color={COL.piso} roughness={0.45} metalness={0.04} />
      </mesh>
      {[-2.4, -1.2, 0, 1.2, 2.4].map((i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[i, -0.999, -0.4]}>
          <planeGeometry args={[0.015, 12]} />
          <meshStandardMaterial color={COL.pisoVeta} transparent opacity={0.4} />
        </mesh>
      ))}

      {/* ── TECHO ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.0, -1]}>
        <planeGeometry args={[14, 12]} />
        <meshStandardMaterial color={COL.techo} roughness={1} />
      </mesh>

      {/* ── PARED TRASERA ── */}
      <mesh position={[0, 1.0, -3.0]} receiveShadow>
        <planeGeometry args={[9, 8.5]} />
        <meshStandardMaterial color={COL.paredFondo} roughness={0.75} />
      </mesh>
      {/* Panel central elegante */}
      <mesh position={[0, 0.6, -2.97]}>
        <boxGeometry args={[2.6, 2.6, 0.03]} />
        <meshStandardMaterial color={COL.panel} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.6, -2.955]}>
        <boxGeometry args={[2.5, 2.5, 0.012]} />
        <meshStandardMaterial color="#F8EFDC" roughness={0.45} />
      </mesh>

      {/* Zócalo y moldura */}
      <mesh position={[0, -0.88, -2.98]}>
        <boxGeometry args={[9, 0.12, 0.04]} />
        <meshStandardMaterial color={COL.zocalo} roughness={0.45} />
      </mesh>
      <mesh position={[0, 2.78, -2.98]}>
        <boxGeometry args={[9, 0.08, 0.04]} />
        <meshStandardMaterial color={COL.zocalo} roughness={0.45} />
      </mesh>

      {/* ── PAREDES LATERALES ── */}
      <mesh position={[-3.5, 1.0, -1.0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[7, 8.5]} />
        <meshStandardMaterial color={COL.paredLado} roughness={0.75} />
      </mesh>
      <mesh position={[3.5, 1.0, -1.0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[7, 8.5]} />
        <meshStandardMaterial color={COL.paredLado} roughness={0.75} />
      </mesh>

      {/* ── BARRAS DE ROPA ── (laterales pared fondo) */}
      <Barra x={-2.45} y={2.20} z={-2.85} ancho={1.7} capsulas={5} />
      <Barra x={ 2.45} y={2.20} z={-2.85} ancho={1.7} capsulas={5} />

      {/* Estantes inferiores */}
      <CajitasEstante x={-2.45} y={1.30} z={-2.85} ancho={1.6} />
      <CajitasEstante x={-2.45} y={0.65} z={-2.85} ancho={1.6} />
      <CajitasEstante x={ 2.45} y={1.30} z={-2.85} ancho={1.6} />
      <CajitasEstante x={ 2.45} y={0.65} z={-2.85} ancho={1.6} />

      {/* ── BARRAS LATERALES ── */}
      <group rotation={[0, Math.PI / 2, 0]} position={[-3.45, 0, -1.0]}>
        <Barra x={0} y={2.10} z={0} ancho={3.0} capsulas={6} />
      </group>
      <group rotation={[0, -Math.PI / 2, 0]} position={[3.45, 0, -1.0]}>
        <Barra x={0} y={2.10} z={0} ancho={3.0} capsulas={6} />
      </group>

      {/* ── TARIMA del avatar ── */}
      <mesh position={[0, -0.985, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.72, 0.78, 0.03, 64]} />
        <meshStandardMaterial color="#EFE0C2" roughness={0.45} />
      </mesh>
      <mesh position={[0, -0.965, 0]}>
        <cylinderGeometry args={[0.68, 0.68, 0.008, 64]} />
        <meshStandardMaterial color="#FBF5E8" roughness={0.35} />
      </mesh>

      {/* ── LÁMPARA colgante esférica ── */}
      <mesh position={[0, 2.78, 0.4]}>
        <cylinderGeometry args={[0.004, 0.004, 0.32, 6]} />
        <meshStandardMaterial color="#7A6A55" />
      </mesh>
      <mesh position={[0, 2.45, 0.4]} castShadow>
        <sphereGeometry args={[0.14, 24, 24]} />
        <meshStandardMaterial
          color="#F4EADA"
          emissive="#E8DAC0"
          emissiveIntensity={0.3}
          roughness={0.45}
        />
      </mesh>

      {/* ── Espejo de pie lateral ── */}
      <group position={[2.55, 0.10, 1.2]} rotation={[0, -0.42, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.58, 1.6, 0.05]} />
          <meshStandardMaterial color={COL.oroSuave} roughness={0.3} metalness={0.85} />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[0.50, 1.50]} />
          <meshStandardMaterial color="#E8DAC1" roughness={0.06} metalness={0.5} />
        </mesh>
      </group>

      {/* ── Banco bajo / otomano frente ── */}
      <group position={[-2.0, -0.78, 1.0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.32, 0.32, 0.38, 24]} />
          <meshStandardMaterial color="#D4AB7B" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.20, 0]} castShadow>
          <cylinderGeometry args={[0.33, 0.32, 0.04, 24]} />
          <meshStandardMaterial color="#E5BFA0" roughness={0.7} />
        </mesh>
      </group>

      {/* ── Planta decorativa ── */}
      <group position={[-2.4, -0.78, -0.4]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.11, 0.13, 0.22, 24]} />
          <meshStandardMaterial color="#BD9876" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.32, 0]} castShadow>
          <sphereGeometry args={[0.22, 20, 20]} />
          <meshStandardMaterial color="#9DAB87" roughness={0.85} />
        </mesh>
      </group>
    </group>
  )
}
