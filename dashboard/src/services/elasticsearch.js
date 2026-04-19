import axios from 'axios'
import { ES_URL, ES_INDEX, TIME_RANGE } from '../config/constants'

/**
 * Consulta eventos recientes a Elasticsearch
 * Obtiene los eventos más recientes del índice de Filebeat
 *
 * @param {number} size - Número de eventos a recuperar (por defecto 50)
 * @returns {object} Objeto con los hits y el total de eventos
 */
export const fetchEvents = async (size = 50) => {
  const response = await axios.post(`${ES_URL}/${ES_INDEX}/_search`, {
    size,
    // Ordenar por timestamp descendente (los más recientes primero)
    sort: [{ '@timestamp': 'desc' }],
    // Filtrar solo eventos dentro del rango de tiempo configurado
    query: {
      range: {
        '@timestamp': {
          gte: TIME_RANGE
        }
      }
    }
  })
  return response.data.hits
}