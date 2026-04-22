// Constantes globales del dashboard SIEM

// URL del servidor Elasticsearch al que se conecta el dashboard
export const ES_URL = 'http://192.168.57.5:9200'

// Índice principal donde Filebeat envía los logs del sistema
export const ES_INDEX = 'filebeat-*'

// Índice donde el motor Python guarda las alertas generadas
export const ES_ALERTAS_INDEX = 'alertas-siem'

// Intervalo de refresco automático del dashboard (en milisegundos)
export const REFRESH_INTERVAL = 10000

// Rango de tiempo para la lista de eventos recientes (última hora)
// Usa sintaxis de Elasticsearch: now-1h, now-5m, now-24h, etc.
export const TIME_RANGE = 'now-1h'

// Rango de tiempo para las tarjetas de estadísticas (últimos 5 minutos)
// Estas tarjetas reflejan actividad reciente para vigilancia en tiempo real
export const STATS_TIME_RANGE = 'now-5m'

// Número máximo de eventos mostrados en la lista del dashboard
export const MAX_EVENTS_DISPLAY = 20