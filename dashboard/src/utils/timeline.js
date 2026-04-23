// Utilidades para procesar los eventos de la gráfica temporal
// Deduplica eventos SSH por PID y los agrupa por minuto para Chart.js

/**
 * Extrae el PID del proceso sshd del mensaje
 * Solo sshd tiene duplicados en el log, los eventos de sudo no
 */
const PATRON_PID_SSHD = /sshd\[(\d+)\]/

/**
 * Clasifica el tipo de evento según el contenido del mensaje
 * - Failed password  → login fallido SSH
 * - Accepted password → login exitoso SSH
 * - COMMAND=         → ejecución real de sudo (no session opened/closed)
 */
const clasificarTipo = (mensaje) => {
  if (!mensaje) return null
  if (mensaje.includes('Failed password')) return 'fallidos'
  if (mensaje.includes('Accepted password')) return 'exitosos'
  if (mensaje.includes('COMMAND=')) return 'sudo'
  return null
}

/**
 * Procesa los hits de Elasticsearch para generar los datos de la gráfica
 * - SSH: deduplica por PID porque el log a veces duplica líneas
 * - Sudo: no deduplica, cada COMMAND= es un evento único
 * - Agrupa todos los eventos en intervalos de 1 minuto de la última hora
 */
export const procesarTimeline = (hits) => {
  const buckets = new Map()
  const pidsSSHVistos = new Set()

  for (const hit of hits) {
    const mensaje = hit._source.message
    const timestamp = new Date(hit._source['@timestamp'])

    const tipo = clasificarTipo(mensaje)
    if (!tipo) continue

    // Deduplicación solo para eventos de SSH (fallidos y exitosos)
    if (tipo === 'fallidos' || tipo === 'exitosos') {
      const matchPid = PATRON_PID_SSHD.exec(mensaje)
      if (!matchPid) continue

      const pidClave = `${matchPid[1]}-${tipo}`
      if (pidsSSHVistos.has(pidClave)) continue
      pidsSSHVistos.add(pidClave)
    }
    // Los eventos sudo no necesitan deduplicación

    // Redondeamos el timestamp al minuto exacto
    const minuto = new Date(timestamp)
    minuto.setSeconds(0, 0)
    const claveMinuto = minuto.getTime()

    // Incrementamos el contador para ese minuto y tipo
    const clave = `${claveMinuto}-${tipo}`
    buckets.set(clave, (buckets.get(clave) || 0) + 1)
  }

  // Generamos los 60 puntos de la última hora para que la gráfica tenga continuidad
  const ahora = new Date()
  ahora.setSeconds(0, 0)
  const puntos = []

  for (let i = 59; i >= 0; i--) {
    const minuto = new Date(ahora)
    minuto.setMinutes(minuto.getMinutes() - i)
    const claveMinuto = minuto.getTime()

    puntos.push({
      timestamp: minuto,
      fallidos: buckets.get(`${claveMinuto}-fallidos`) || 0,
      exitosos: buckets.get(`${claveMinuto}-exitosos`) || 0,
      sudo: buckets.get(`${claveMinuto}-sudo`) || 0
    })
  }

  return puntos
}