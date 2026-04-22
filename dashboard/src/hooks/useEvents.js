// Hook personalizado que gestiona eventos y estadísticas del dashboard
// Los eventos se leen de la última hora y se deduplican por PID
// Las stats se calculan sobre una ventana más corta (5 minutos)

import { useState, useEffect } from 'react'
import { fetchEvents, fetchStatsEvents } from '../services/elasticsearch'
import { calculateStats } from '../utils/severity'
import { REFRESH_INTERVAL } from '../config/constants'

// Patrón para extraer PID de sshd (solo SSH tiene duplicados en el log)
const PATRON_PID_SSHD = /sshd\[(\d+)\]/

/**
 * Deduplica eventos SSH por PID para que cada intento real aparezca una sola vez
 * Los eventos de sudo no se deduplican porque no generan duplicados en el log
 */
const deduplicarEventos = (hits) => {
  const pidsVistos = new Set()
  const resultado = []

  for (const hit of hits) {
    const mensaje = hit._source.message
    const matchPid = PATRON_PID_SSHD.exec(mensaje)

    // Si es un evento SSH, aplicamos deduplicación por PID
    if (matchPid) {
      const pid = matchPid[1]
      // Creamos una clave que combina PID + tipo para poder distinguir
      // varios eventos de la misma conexión SSH
      let tipo = 'otro'
      if (mensaje.includes('Failed password')) tipo = 'fallido'
      else if (mensaje.includes('Accepted password')) tipo = 'exitoso'
      else if (mensaje.includes('Invalid user')) tipo = 'invalid'

      const clave = `${pid}-${tipo}`
      if (pidsVistos.has(clave)) continue
      pidsVistos.add(clave)
    }

    resultado.push(hit)
  }

  return resultado
}

export const useEvents = () => {
  const [events, setEvents] = useState([])
  const [stats, setStats] = useState({ total: 0, failed: 0, accepted: 0, sudo: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /**
   * Carga eventos y estadísticas en paralelo desde Elasticsearch
   * Aplica deduplicación a los eventos SSH para evitar duplicados del log
   */
  const loadEvents = async () => {
    try {
      const [eventsData, statsData] = await Promise.all([
        fetchEvents(),
        fetchStatsEvents()
      ])

      // Deduplicamos los eventos SSH antes de mostrarlos
      const eventosLimpios = deduplicarEventos(eventsData.hits)

      setEvents(eventosLimpios)
      setStats({
        total: statsData.total.value,
        ...calculateStats(statsData.hits)
      })
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  // Carga inicial + refresco periódico automático
  useEffect(() => {
    const init = async () => {
      await loadEvents()
    }
    init()

    const interval = setInterval(() => {
      loadEvents()
    }, REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  return { events, stats, loading, error, refresh: loadEvents }
}