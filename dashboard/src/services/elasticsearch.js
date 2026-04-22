// Capa de acceso a Elasticsearch
// Centraliza todas las peticiones HTTP al motor de búsqueda

import axios from 'axios'
import {
  ES_URL,
  ES_INDEX,
  ES_ALERTAS_INDEX,
  TIME_RANGE,
  STATS_TIME_RANGE
} from '../config/constants'

/**
 * Consulta eventos de seguridad recientes para la lista del dashboard
 * Solo devuelve eventos relevantes: logins SSH (éxito/fallo), sudo y usuarios
 *
 * @param {number} size - Número de eventos a recuperar (por defecto 100)
 * @returns {object} Objeto con los hits y el total
 */
export const fetchEvents = async (size = 100) => {
  const response = await axios.post(`${ES_URL}/${ES_INDEX}/_search`, {
    size,
    sort: [{ '@timestamp': 'desc' }],
    query: {
      bool: {
        should: [
          { match_phrase: { message: 'Failed password' } },
          { match_phrase: { message: 'Accepted password' } },
          { match_phrase: { message: 'COMMAND=' } },
          { match_phrase: { message: 'Invalid user' } },
          { match_phrase: { message: 'new user' } },
          { match_phrase: { message: 'useradd' } }
        ],
        minimum_should_match: 1,
        must: [
          {
            range: {
              '@timestamp': {
                gte: TIME_RANGE
              }
            }
          }
        ]
      }
    }
  })
  return response.data.hits
}

/**
 * Consulta eventos para las estadísticas en tiempo real
 * Usa un rango más corto (STATS_TIME_RANGE) para reflejar actividad reciente
 */
export const fetchStatsEvents = async () => {
  const response = await axios.post(`${ES_URL}/${ES_INDEX}/_search`, {
    size: 5000,
    query: {
      bool: {
        should: [
          { match_phrase: { message: 'Failed password' } },
          { match_phrase: { message: 'Accepted password' } },
          { match_phrase: { message: 'COMMAND=' } }
        ],
        minimum_should_match: 1,
        must: [
          {
            range: {
              '@timestamp': {
                gte: STATS_TIME_RANGE
              }
            }
          }
        ]
      }
    }
  })
  return response.data.hits
}

/**
 * Consulta las alertas generadas por el motor de detección Python
 */
export const fetchAlertas = async (size = 30) => {
  const response = await axios.post(`${ES_URL}/${ES_ALERTAS_INDEX}/_search`, {
    size,
    sort: [{ '@timestamp': 'desc' }],
    query: {
      match_all: {}
    }
  })
  return response.data.hits
}

/**
 * Recupera los eventos de la última hora sin agregar
 * Se procesan en el cliente para deduplicar y agruparlos por minuto
 */
export const fetchTimeline = async () => {
  const response = await axios.post(`${ES_URL}/${ES_INDEX}/_search`, {
    size: 5000,
    sort: [{ '@timestamp': 'desc' }],
    query: {
      bool: {
        should: [
          { match_phrase: { message: 'Failed password' } },
          { match_phrase: { message: 'Accepted password' } },
          { match_phrase: { message: 'COMMAND=' } }
        ],
        minimum_should_match: 1,
        must: [
          {
            range: {
              '@timestamp': {
                gte: 'now-1h'
              }
            }
          }
        ]
      }
    }
  })
  return response.data.hits.hits
}