// Redimensiona, comprime y genera thumbnail usando Canvas API nativa

export async function procesarImagen(archivo) {
  const imagenOriginal = await cargarImagen(archivo)
  return {
    comprimida: await redimensionarYComprimir(imagenOriginal, 1024, 0.88, 'image/jpeg'),
    thumbnail:  await redimensionarYComprimir(imagenOriginal, 200,  0.80, 'image/jpeg'),
  }
}

// Convierte un Blob a data URL (persistible en localStorage)
export function blobADataUrl(blob) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(fr.result)
    fr.onerror = reject
    fr.readAsDataURL(blob)
  })
}

// Genera un thumbnail data URL a partir de un blob/imagen ya procesada (PNG transparente)
export async function thumbnailDesdeBlob(blob, tamanio = 320) {
  const img = await cargarImagen(blob)
  return redimensionarYComprimir(img, tamanio, 0.9, 'image/png')
    .then(blobADataUrl)
}

function cargarImagen(archivo) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(archivo)
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = reject
    img.src = url
  })
}

async function redimensionarYComprimir(img, tamanioMaximo, calidad, tipoMime) {
  const escala = Math.min(1, tamanioMaximo / Math.max(img.width, img.height))
  const ancho  = Math.round(img.width  * escala)
  const alto   = Math.round(img.height * escala)
  const canvas = document.createElement('canvas')
  canvas.width  = ancho
  canvas.height = alto
  canvas.getContext('2d').drawImage(img, 0, 0, ancho, alto)
  return new Promise((resolve) => canvas.toBlob(resolve, tipoMime, calidad))
}

export function extraerColorDominante(imageUrl) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = imageUrl
    img.onload = () => {
      const tamanio = 50
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = tamanio
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, tamanio, tamanio)
      const datos = ctx.getImageData(0, 0, tamanio, tamanio).data
      let r = 0, g = 0, b = 0, cantidad = 0
      for (let i = 0; i < datos.length; i += 4) {
        if (datos[i + 3] > 128) {
          r += datos[i]; g += datos[i + 1]; b += datos[i + 2]; cantidad++
        }
      }
      if (cantidad === 0) { resolve('#888888'); return }
      const aHex = (v) => Math.round(v / cantidad).toString(16).padStart(2, '0')
      resolve(`#${aHex(r)}${aHex(g)}${aHex(b)}`)
    }
    img.onerror = () => resolve('#888888')
  })
}
