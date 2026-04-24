// Constantes globales del dashboard SIEM
// La URL de Elasticsearch se puede sobrescribir con una variable de entorno
// durante el build de Vite (VITE_ES_URL), útil para Docker o producción

// URL del servidor Elasticsearch
// Por defecto apunta a localhost:9200 (útil con Docker)
// Se puede sobrescribir definiendo VITE_ES_URL en el build
export const ES_URL = import.meta.env.VITE_ES_URL || 'http://localhost:9200'

// Índice principal donde Filebeat envía los logs del sistema
export const ES_INDEX = 'filebeat-*'

// Índice donde el motor Python guarda las alertas generadas
export const ES_ALERTAS_INDEX = 'alertas-siem'

// Intervalo de refresco automático del dashboard (en milisegundos)
export const REFRESH_INTERVAL = 10000

// Rango de tiempo para la lista de eventos recientes (última hora)
export const TIME_RANGE = 'now-1h'

// Rango de tiempo para las tarjetas de estadísticas (últimos 5 minutos)
export const STATS_TIME_RANGE = 'now-5m'

// Número máximo de eventos mostrados en la lista del dashboard
export const MAX_EVENTS_DISPLAY = 20