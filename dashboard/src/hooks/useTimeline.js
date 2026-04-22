// Hook personalizado que obtiene los eventos y los procesa para la gráfica temporal
// Aplica deduplicación por PID en el cliente para evitar contar duplicados del log

import { useState, useEffect } from 'react'
import { fetchTimeline } from '../services/elasticsearch'
import { procesarTimeline } from '../utils/timeline'
import { REFRESH_INTERVAL } from '../config/constants'

export const useTimeline = () => {
  // Puntos procesados listos para pasar a Chart.js
  const [puntos, setPuntos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /**
   * Consulta los eventos a Elasticsearch y los procesa en el cliente
   * para deduplicar y agrupar por minuto
   */
  const loadTimeline = async () => {
    try {
      const hits = await fetchTimeline()
      const puntosLimpios = procesarTimeline(hits)
      setPuntos(puntosLimpios)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching timeline:', err)
    } finally {
      setLoading(false)
    }
  }

  // Carga inicial + refresco periódico automático
  useEffect(() => {
    const init = async () => {
      await loadTimeline()
    }
    init()

    const interval = setInterval(() => {
      loadTimeline()
    }, REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  return { puntos, loading, error, refresh: loadTimeline }
}