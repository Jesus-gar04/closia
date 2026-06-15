import * as THREE from 'three'

// Sistema de coordenadas: avatar de 1.7m con pies en Y=0 (el grupo se desplaza a los
// pies reales del avatar en AvatarScene). Referencias verticales:
// Pies 0.00 | Rodillas 0.48 | Cintura 0.95 | Pecho 1.20 | Hombros 1.40 | Cuello 1.48
//
// Enfoque "puesta encima" (panel plano frontal): cada prenda es UN plano encarado a la
// cámara que muestra la foto del recorte. ANCHO y ALTO son dimensiones FÍSICAS definidas
// por silueta (ver ZONAS) — NO se derivan del aspect ratio de la foto, porque las imágenes
// procesadas tienen cantidades distintas de espacio transparente y eso producía tamaños
// inconsistentes entre prendas iguales. La textura solo pinta el material. Se ancla por
// arriba (cuelga desde hombros/cintura) salvo el calzado.
//
// Ajuste fino por prenda (opcional): un objeto `fit` { scaleX, scaleY, offsetX, offsetY }
// escala/desplaza el plano sobre su layout base, permitiendo calibrar una prenda concreta
// sin tocar el preset de su silueta.

function crearMesh(geometria, color = '#EAE2F4') {
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.72,
    metalness: 0.0,
    side: THREE.DoubleSide,
    transparent: false,
  })
  const mesh = new THREE.Mesh(geometria, material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

// Distancia al frente del cuerpo donde se sitúa el plano (algo por delante de la piel).
const Z_FRENTE = 0.20

// Reposiciona/escala el plano a partir de su layout de zona y del ajuste fino por prenda.
function ajustarPlano(mesh) {
  const lay = mesh.userData.layout
  if (!lay) return

  const fit = mesh.userData.fit ?? {}
  const sx = fit.scaleX ?? 1
  const sy = fit.scaleY ?? 1
  const ox = fit.offsetX ?? 0
  const oy = fit.offsetY ?? 0

  const ancho = lay.ancho * sx
  const alto = lay.altoBase * sy

  mesh.scale.set(ancho, alto, 1)

  const baseOffsetY = lay.offsetY ?? 0
  mesh.position.x = ox

  if (lay.dir === 'arriba') {
    mesh.position.y = lay.anclaY + alto / 2 + baseOffsetY + oy
  } else {
    mesh.position.y = lay.anclaY - alto / 2 + baseOffsetY + oy
  }
}

// Recorta la textura al bounding box de los píxeles opacos (canal alpha) ajustando
// repeat/offset, de modo que la prenda LLENE el plano de su silueta sin importar cuánto
// margen transparente traiga el PNG procesado. Sin esto, una prenda recortada con mucho
// espacio vacío aparece diminuta y descolocada dentro del plano.
function recortarABBoxAlpha(textura) {
  const img = textura.image
  if (!img || !img.width || !img.height) return
  try {
    // Submuestreo: el bbox no necesita resolución completa y así es barato.
    const escala = Math.min(1, 256 / Math.max(img.width, img.height))
    const w = Math.max(1, Math.round(img.width * escala))
    const h = Math.max(1, Math.round(img.height * escala))

    const cv = document.createElement('canvas')
    cv.width = w
    cv.height = h
    const ctx = cv.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(img, 0, 0, w, h)
    const data = ctx.getImageData(0, 0, w, h).data

    const UMBRAL = 12 // alpha mínimo para considerar un píxel parte de la prenda
    let minX = w, minY = h, maxX = -1, maxY = -1
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] > UMBRAL) {
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
      }
    }
    if (maxX < minX || maxY < minY) return // imagen totalmente transparente

    const u0 = minX / w
    const u1 = (maxX + 1) / w
    const v0 = minY / h // borde superior del bbox (coords de imagen)
    const v1 = (maxY + 1) / h // borde inferior
    // flipY=true ⇒ el alto de la imagen está en V=1. Mapeamos el bbox a [0,1] del plano.
    textura.repeat.set(u1 - u0, v1 - v0)
    textura.offset.set(u0, 1 - v1)
    textura.needsUpdate = true
  } catch (e) {
    // Canvas "tainted" (sin CORS) u otro fallo: la prenda se muestra sin recortar.
    console.warn('[CLOSIA] No se pudo recortar al bbox alpha:', e)
  }
}

export function aplicarTextura(grupo, texturaUrl) {
  if (!texturaUrl || !grupo) return

  const loader = new THREE.TextureLoader()

  loader.setCrossOrigin('anonymous')

  loader.load(texturaUrl, (textura) => {
    textura.flipY = true
    textura.colorSpace = THREE.SRGBColorSpace
    textura.wrapS = THREE.ClampToEdgeWrapping
    textura.wrapT = THREE.ClampToEdgeWrapping
    textura.anisotropy = 8

    recortarABBoxAlpha(textura)

    grupo.traverse((hijo) => {
      if (!hijo.isMesh) return

      hijo.material = new THREE.MeshStandardMaterial({
        map: textura,
        color: '#FFFFFF',
        transparent: true,
        alphaTest: 0.04,
        roughness: 0.72,
        metalness: 0.0,
        side: THREE.DoubleSide,
      })

      ajustarPlano(hijo)
    })
  })
}

// Plano frontal unitario; su tamaño y posición se fijan por layout + fit (ver ajustarPlano).
function crearPanelPrenda(layout, fit) {
  const g = new THREE.Group()

  const panel = crearMesh(
    new THREE.PlaneGeometry(1, 1)
  )

  panel.position.z = Z_FRENTE
  panel.userData.layout = layout
  panel.userData.fit = fit ?? {}

  ajustarPlano(panel)

  g.add(panel)

  return g
}

// Layout por silueta. Dimensiones FÍSICAS (no derivadas de la foto):
//   ancho    — ancho del plano ≈ ancho del cuerpo + holgura en esa zona
//   altoBase — alto del plano = distancia vertical que cubre la prenda
//   anclaY   — Y del borde por el que cuelga/sube (espacio "pies en Y=0")
//   dir      — 'abajo' cuelga desde anclaY hacia los pies; 'arriba' sube desde anclaY
//   offsetY  — micro-ajuste vertical del preset (el ajuste por prenda usa fit.offsetY)
// Referencias MEDIDAS sobre avatar.glb (verificado con las guías de AvatarScene):
//   Pies 0.00 | Tobillos 0.45 | Rodillas 0.70 | Cadera 0.98 | Cintura 1.13 |
//   Pecho 1.28 | Hombros 1.40 | Cuello 1.48.
// (El mapa original 0.48/0.95/1.20 era de otro cuerpo y descolocaba las prendas.)
// Afinar con las guías temporales de AvatarScene y/o el ajuste fino por prenda (fit_*).
const HOMBROS = 1.40 // arranque de tops, vestidos y abrigos
const CINTURA = 1.10 // pretina de pantalones y faldas

const ZONAS = {
  // TOPS — cuelgan desde la línea de hombros (1.40)
  crop_top: {
    ancho: 0.40,
    altoBase: 0.22, // hombros → bajo el pecho (~1.18)
    anclaY: HOMBROS,
    offsetY: 0,
    dir: 'abajo',
  },

  blusa_corta: {
    ancho: 0.40,
    altoBase: 0.28, // hombros → cintura (~1.12)
    anclaY: HOMBROS,
    offsetY: 0,
    dir: 'abajo',
  },

  blusa_larga: {
    ancho: 0.42,
    altoBase: 0.45, // hombros → cadera (~0.95)
    anclaY: HOMBROS,
    offsetY: 0,
    dir: 'abajo',
  },

  oversize: {
    ancho: 0.50,
    altoBase: 0.48, // hombros → bajo cadera (~0.92)
    anclaY: HOMBROS,
    offsetY: 0,
    dir: 'abajo',
  },

  sin_mangas: {
    ancho: 0.36,
    altoBase: 0.28, // hombros → cintura
    anclaY: HOMBROS,
    offsetY: 0,
    dir: 'abajo',
  },

  off_shoulder: {
    ancho: 0.44,
    altoBase: 0.22, // hombros descubiertos → cintura
    anclaY: 1.34, // arranca algo más abajo que los hombros
    offsetY: 0,
    dir: 'abajo',
  },

  manga_larga: {
    ancho: 0.50, // ensancha por las mangas
    altoBase: 0.30, // hombros → cintura (~1.10)
    anclaY: HOMBROS,
    offsetY: 0,
    dir: 'abajo',
  },

  // BOTTOMS — cuelgan desde la pretina (1.10)
  short: {
    ancho: 0.40,
    altoBase: 0.26, // pretina → medio muslo (~0.84)
    anclaY: CINTURA,
    offsetY: 0,
    dir: 'abajo',
  },

  bermuda: {
    ancho: 0.40,
    altoBase: 0.40, // pretina → rodilla (~0.70)
    anclaY: CINTURA,
    offsetY: 0,
    dir: 'abajo',
  },

  leggings: {
    ancho: 0.32,
    altoBase: 0.65, // pretina → tobillo (~0.45), ceñido
    anclaY: CINTURA,
    offsetY: 0,
    dir: 'abajo',
  },

  pantalon_recto: {
    ancho: 0.38,
    altoBase: 0.70, // pretina → tobillo (~0.40)
    anclaY: CINTURA,
    offsetY: 0,
    dir: 'abajo',
  },

  pantalon_ancho: {
    ancho: 0.48,
    altoBase: 0.70,
    anclaY: CINTURA,
    offsetY: 0,
    dir: 'abajo',
  },

  pantalon_acampanado: {
    ancho: 0.44,
    altoBase: 0.70,
    anclaY: CINTURA,
    offsetY: 0,
    dir: 'abajo',
  },

  falda_mini: {
    ancho: 0.44,
    altoBase: 0.26, // pretina → sobre rodilla (~0.84)
    anclaY: CINTURA,
    offsetY: 0,
    dir: 'abajo',
  },

  falda_midi: {
    ancho: 0.48,
    altoBase: 0.52, // pretina → bajo rodilla (~0.58)
    anclaY: CINTURA,
    offsetY: 0,
    dir: 'abajo',
  },

  falda_larga: {
    ancho: 0.52,
    altoBase: 0.70, // pretina → tobillo
    anclaY: CINTURA,
    offsetY: 0,
    dir: 'abajo',
  },

  // DRESSES — cuelgan desde los hombros (1.40)
  vestido_mini: {
    ancho: 0.42,
    altoBase: 0.55, // hombros → medio muslo (~0.85)
    anclaY: HOMBROS,
    offsetY: 0,
    dir: 'abajo',
  },

  vestido_midi: {
    ancho: 0.44,
    altoBase: 0.82, // hombros → bajo rodilla (~0.58)
    anclaY: HOMBROS,
    offsetY: 0,
    dir: 'abajo',
  },

  vestido_largo: {
    ancho: 0.48,
    altoBase: 1.00, // hombros → tobillo (~0.40)
    anclaY: HOMBROS,
    offsetY: 0,
    dir: 'abajo',
  },

  vestido_entallado: {
    ancho: 0.38, // bodycon: ceñido
    altoBase: 0.82, // hombros → bajo rodilla
    anclaY: HOMBROS,
    offsetY: 0,
    dir: 'abajo',
  },

  vestido_suelto: {
    ancho: 0.52,
    altoBase: 0.85, // hombros → media pantorrilla
    anclaY: HOMBROS,
    offsetY: 0,
    dir: 'abajo',
  },

  // OUTER — cuelgan desde los hombros (1.40)
  chaqueta: {
    ancho: 0.50,
    altoBase: 0.45, // hombros → cadera (~0.95)
    anclaY: HOMBROS,
    offsetY: 0,
    dir: 'abajo',
  },

  cardigan: {
    ancho: 0.50,
    altoBase: 0.55, // hombros → bajo cadera (~0.85)
    anclaY: HOMBROS,
    offsetY: 0,
    dir: 'abajo',
  },

  abrigo: {
    ancho: 0.56,
    altoBase: 0.95, // hombros → bajo rodilla (~0.45)
    anclaY: HOMBROS,
    offsetY: 0,
    dir: 'abajo',
  },

  // FEET — suben desde el suelo
  sneakers: {
    ancho: 0.30,
    altoBase: 0.12,
    anclaY: 0.01,
    offsetY: 0,
    dir: 'arriba',
  },

  tacones: {
    ancho: 0.28,
    altoBase: 0.14,
    anclaY: 0.01,
    offsetY: 0,
    dir: 'arriba',
  },

  sandalias: {
    ancho: 0.30,
    altoBase: 0.10,
    anclaY: 0.01,
    offsetY: 0,
    dir: 'arriba',
  },

  botas: {
    ancho: 0.30,
    altoBase: 0.50, // suelo → bajo la rodilla (media caña)
    anclaY: 0.01,
    offsetY: 0,
    dir: 'arriba',
  },
}

// Silueta por defecto por zona del cuerpo: garantiza que una prenda guardada sin
// silueta (datos antiguos o flujo incompleto) igual se renderice en una posición
// razonable en vez de desaparecer del avatar.
const SILUETA_DEFECTO = {
  torso: 'blusa_corta',
  legs:  'pantalon_recto',
  dress: 'vestido_midi',
  outer: 'chaqueta',
  feet:  'sneakers',
}

export function construirMesh(tipoSilueta, bodyZone, fit) {
  let layout = ZONAS[tipoSilueta]
  if (!layout && bodyZone) {
    const fallback = SILUETA_DEFECTO[bodyZone]
    layout = ZONAS[fallback]
    if (layout) console.warn(`[CLOSIA] Silueta "${tipoSilueta || '∅'}" no reconocida — usando "${fallback}" por zona "${bodyZone}".`)
  }
  if (!layout) {
    console.warn(`[CLOSIA] Sin layout para silueta "${tipoSilueta}" / zona "${bodyZone}".`)
    return null
  }
  return crearPanelPrenda(layout, fit)
}

// Siluetas disponibles por zona — usadas en el Step3 del flujo de subida
export const SILUETAS_POR_ZONA = {
  torso: [
    { valor: 'crop_top',     etiqueta: 'Crop top' },
    { valor: 'blusa_corta',  etiqueta: 'Blusa corta' },
    { valor: 'blusa_larga',  etiqueta: 'Blusa larga' },
    { valor: 'oversize',     etiqueta: 'Oversize / Camiseta holgada' },
    { valor: 'sin_mangas',   etiqueta: 'Sin mangas / Tirantes' },
    { valor: 'off_shoulder', etiqueta: 'Off shoulder' },
    { valor: 'manga_larga',  etiqueta: 'Manga larga ceñida' },
  ],
  legs: [
    { valor: 'short',               etiqueta: 'Short (sobre el muslo)' },
    { valor: 'bermuda',             etiqueta: 'Bermuda (hasta la rodilla)' },
    { valor: 'leggings',            etiqueta: 'Leggings / Pantalón ceñido' },
    { valor: 'pantalon_recto',      etiqueta: 'Pantalón recto' },
    { valor: 'pantalon_ancho',      etiqueta: 'Pantalón ancho / Palazzo' },
    { valor: 'pantalon_acampanado', etiqueta: 'Pantalón acampanado / Bootcut' },
    { valor: 'falda_mini',          etiqueta: 'Falda mini (sobre rodilla)' },
    { valor: 'falda_midi',          etiqueta: 'Falda midi (bajo rodilla)' },
    { valor: 'falda_larga',         etiqueta: 'Falda larga / Maxi' },
  ],
  dress: [
    { valor: 'vestido_mini',      etiqueta: 'Vestido mini' },
    { valor: 'vestido_midi',      etiqueta: 'Vestido midi' },
    { valor: 'vestido_largo',     etiqueta: 'Vestido largo' },
    { valor: 'vestido_entallado', etiqueta: 'Vestido entallado / Bodycon' },
    { valor: 'vestido_suelto',    etiqueta: 'Vestido suelto / Casual' },
  ],
  outer: [
    { valor: 'chaqueta', etiqueta: 'Chaqueta / Blazer' },
    { valor: 'cardigan',  etiqueta: 'Cardigan' },
    { valor: 'abrigo',    etiqueta: 'Abrigo' },
  ],
  feet: [
    { valor: 'sneakers',  etiqueta: 'Sneakers / Zapatos planos' },
    { valor: 'tacones',   etiqueta: 'Tacones' },
    { valor: 'sandalias', etiqueta: 'Sandalias' },
    { valor: 'botas',     etiqueta: 'Botas' },
  ],
}
