/**
 * Determina el nivel de severidad de un evento basándose en su mensaje
 * Se usa para colorear los eventos en la interfaz según su criticidad
 *
 * @param {string} message - Mensaje del log
 * @returns {string} Nivel de severidad: alta, media, baja o info
 */
export const getSeverity = (message) => {
  if (!message) return 'info'
  // Intentos de login fallidos → posible ataque de fuerza bruta
  if (message.includes('Failed password')) return 'alta'
  // Uso de sudo → escalada de privilegios, requiere atención
  if (message.toLowerCase().includes('sudo')) return 'media'
  // Logins exitosos → actividad normal pero relevante
  if (message.includes('Accepted password')) return 'baja'
  return 'info'
}

/**
 * Calcula las estadísticas agregadas de una lista de eventos
 * Cuenta ocurrencias de cada tipo de evento relevante
 *
 * @param {array} hits - Array de eventos de Elasticsearch
 * @returns {object} Contadores de cada tipo de evento
 */
export const calculateStats = (hits) => {
  const failed = hits.filter(h => h._source.message?.includes('Failed password')).length
  const accepted = hits.filter(h => h._source.message?.includes('Accepted password')).length
  const sudo = hits.filter(h => h._source.message?.toLowerCase().includes('sudo')).length
  return { failed, accepted, sudo }
}