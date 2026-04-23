// Hook personalizado que monitoriza la salud de los componentes del SIEM
// Comprueba periódicamente Elasticsearch, Filebeat y el motor Python
// Devuelve el estado de cada uno para mostrar indicadores visuales

import { useState, useEffect } from 'react'
import { checkElasticsearch, checkFilebeat, checkMotorPython } from '../services/elasticsearch'

// Intervalo de comprobación de salud (15 segundos)
// Un poco más lento que REFRESH_INTERVAL porque no cambia tanto
const HEALTH_CHECK_INTERVAL = 15000

export const useHealth = () => {
  // Estado de salud de cada componente
  const [health, setHealth] = useState({
    elasticsearch: null,  // null = comprobando, true = ok, false = ko
    filebeat: null,
    motorPython: null
  })

  /**
   * Comprueba el estado de los tres componentes en paralelo
   */
  const checkHealth = async () => {
    try {
      const [es, fb, motor] = await Promise.all([
        checkElasticsearch(),
        checkFilebeat(),
        checkMotorPython()
      ])

      setHealth({
        elasticsearch: es,
        filebeat: fb,
        motorPython: motor
      })
    } catch (err) {
      console.error('Error checking health:', err)
    }
  }

  // Comprobación inicial + periódica
  useEffect(() => {
    const init = async () => {
      await checkHealth()
    }
    init()

    const interval = setInterval(() => {
      checkHealth()
    }, HEALTH_CHECK_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  return health
}