// Hook personalizado que gestiona la obtención de eventos desde Elasticsearch
// Se actualiza automáticamente cada X segundos según la configuración global

import { useState, useEffect } from 'react'
import { fetchEvents } from '../services/elasticsearch'
import { calculateStats } from '../utils/severity'
import { REFRESH_INTERVAL } from '../config/constants'

export const useEvents = () => {
  // Lista de eventos recuperados del índice de Filebeat
  const [events, setEvents] = useState([])
  // Estadísticas agregadas calculadas a partir de los eventos
  const [stats, setStats] = useState({ total: 0, failed: 0, accepted: 0, sudo: 0 })
  // Estado de carga inicial
  const [loading, setLoading] = useState(true)
  // Posibles errores de conexión
  const [error, setError] = useState(null)

  /**
   * Función que realiza la petición a Elasticsearch
   * Se llama en el mount y en cada intervalo de refresco
   */
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

  // Al montar el componente carga los eventos y arranca el refresco automático
  useEffect(() => {
    // Función interna que envuelve la carga inicial
    const init = async () => {
      await loadEvents()
    }
    init()

    // Intervalo que refresca los eventos periódicamente
    const interval = setInterval(() => {
      loadEvents()
    }, REFRESH_INTERVAL)

    // Limpieza del intervalo al desmontar para evitar memory leaks
    return () => clearInterval(interval)
  }, [])

  return { events, stats, loading, error, refresh: loadEvents }
}