// Utilidades de severidad y estadísticas
// Aplica deduplicación por PID solo en eventos SSH

/**
 * Extrae el PID del proceso sshd del mensaje de log
 * Solo sshd genera duplicados, sudo no los genera
 */
const PATRON_PID_SSHD = /sshd\[(\d+)\]/

/**
 * Clasifica un evento por severidad según su contenido
 */
export const getSeverity = (message) => {
  if (!message) return 'info'
  if (message.includes('Failed password')) return 'alta'
  if (message.toLowerCase().includes('sudo')) return 'media'
  if (message.includes('Accepted password')) return 'baja'
  return 'info'
}

/**
 * Calcula las estadísticas agregadas de eventos
 * - SSH: deduplica por PID para evitar contar duplicados del log
 * - Sudo: cuenta directamente cada ejecución (COMMAND=)
 */
export const calculateStats = (hits) => {
  const pidsFallidos = new Set()
  const pidsAceptados = new Set()
  let contadorSudo = 0

  for (const hit of hits) {
    const mensaje = hit._source.message
    if (!mensaje) continue

    // Sudo no tiene PID, lo contamos directamente
    if (mensaje.includes('COMMAND=')) {
      contadorSudo++
      continue
    }

    // SSH sí tiene PID y puede duplicarse
    const match = PATRON_PID_SSHD.exec(mensaje)
    if (!match) continue
    const pid = match[1]

    if (mensaje.includes('Failed password')) {
      pidsFallidos.add(pid)
    } else if (mensaje.includes('Accepted password')) {
      pidsAceptados.add(pid)
    }
  }

  return {
    failed: pidsFallidos.size,
    accepted: pidsAceptados.size,
    sudo: contadorSudo
  }
}