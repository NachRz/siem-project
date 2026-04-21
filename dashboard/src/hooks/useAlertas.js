// Hook personalizado que gestiona la obtención de alertas desde Elasticsearch
// Se actualiza automáticamente cada X segundos según la configuración global

import { useState, useEffect } from 'react'
import { fetchAlertas } from '../services/elasticsearch'
import { REFRESH_INTERVAL } from '../config/constants'

export const useAlertas = () => {
  // Lista de alertas recuperadas del índice alertas-siem
  const [alertas, setAlertas] = useState([])
  // Total de alertas existentes en Elasticsearch
  const [total, setTotal] = useState(0)
  // Estado de carga inicial
  const [loading, setLoading] = useState(true)
  // Posibles errores de conexión
  const [error, setError] = useState(null)

  /**
   * Función que realiza la petición a Elasticsearch
   * Se llama en el mount y en cada intervalo de refresco
   */
  const loadAlertas = async () => {
    try {
      const hits = await fetchAlertas()
      setAlertas(hits.hits)
      setTotal(hits.total.value)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching alertas:', err)
    } finally {
      setLoading(false)
    }
  }

  // Al montar el componente carga las alertas y arranca el refresco automático
  useEffect(() => {
    // Función interna que envuelve la carga inicial
    const init = async () => {
      await loadAlertas()
    }
    init()

    // Intervalo que refresca las alertas periódicamente
    const interval = setInterval(() => {
      loadAlertas()
    }, REFRESH_INTERVAL)

    // Limpieza del intervalo al desmontar para evitar memory leaks
    return () => clearInterval(interval)
  }, [])

  return { alertas, total, loading, error, refresh: loadAlertas }
}