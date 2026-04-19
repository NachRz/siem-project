import { useState, useEffect } from 'react'
import { fetchEvents } from '../services/elasticsearch'
import { calculateStats } from '../utils/severity'
import { REFRESH_INTERVAL } from '../config/constants'

/**
 * Hook personalizado para gestionar los eventos del SIEM
 * Se encarga de:
 * - Cargar eventos desde Elasticsearch
 * - Calcular estadísticas agregadas
 * - Refrescar automáticamente cada X segundos
 * - Manejar estados de carga y error
 *
 * @returns {object} Estado del hook: eventos, estadísticas, loading, error y función de refresco
 */
export const useEvents = () => {
  const [events, setEvents] = useState([])
  const [stats, setStats] = useState({ total: 0, failed: 0, accepted: 0, sudo: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Función que carga los eventos y actualiza el estado
  const loadEvents = async () => {
    try {
      const hits = await fetchEvents()
      setEvents(hits.hits)
      setStats({
        total: hits.total.value,
        ...calculateStats(hits.hits)
      })
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  // Efecto que inicia la carga y programa el refresco automático
  useEffect(() => {
    loadEvents()
    const interval = setInterval(loadEvents, REFRESH_INTERVAL)
    // Limpieza al desmontar el componente
    return () => clearInterval(interval)
  }, [])

  return { events, stats, loading, error, refresh: loadEvents }
}