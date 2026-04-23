// Hook personalizado que gestiona la obtención y actualización de alertas
// Las alertas antiguas sin campo 'estado' se tratan como 'nueva' por defecto

import { useState, useEffect } from 'react'
import { fetchAlertas, actualizarEstadoAlerta } from '../services/elasticsearch'
import { REFRESH_INTERVAL } from '../config/constants'

export const useAlertas = () => {
  // Lista de alertas recuperadas del índice alertas-siem
  const [alertas, setAlertas] = useState([])
  // Total de alertas existentes en Elasticsearch
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /**
   * Carga las alertas desde Elasticsearch y normaliza el campo 'estado'
   * Las alertas sin estado (creadas antes del sistema de gestión) se tratan como 'nueva'
   */
  const loadAlertas = async () => {
    try {
      const hits = await fetchAlertas()

      // Normalizamos las alertas añadiendo 'nueva' a las que no tienen estado
      const alertasNormalizadas = hits.hits.map(alerta => ({
        ...alerta,
        _source: {
          ...alerta._source,
          estado: alerta._source.estado || 'nueva'
        }
      }))

      setAlertas(alertasNormalizadas)
      setTotal(hits.total.value)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching alertas:', err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Cambia el estado de una alerta en Elasticsearch y refresca la lista
   * Se actualiza también localmente para que la UI responda inmediatamente
   */
  const cambiarEstado = async (alertaId, nuevoEstado) => {
    try {
      // Actualizamos optimistamente la UI sin esperar a Elasticsearch
      setAlertas(alertas.map(alerta =>
        alerta._id === alertaId
          ? { ...alerta, _source: { ...alerta._source, estado: nuevoEstado } }
          : alerta
      ))

      // Persistimos el cambio en Elasticsearch
      await actualizarEstadoAlerta(alertaId, nuevoEstado)
    } catch (err) {
      console.error('Error actualizando estado:', err)
      // Si falla, recargamos para restaurar el estado correcto desde el servidor
      await loadAlertas()
    }
  }

  // Carga inicial + refresco periódico automático
  useEffect(() => {
    const init = async () => {
      await loadAlertas()
    }
    init()

    const interval = setInterval(() => {
      loadAlertas()
    }, REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  return { alertas, total, loading, error, refresh: loadAlertas, cambiarEstado }
}