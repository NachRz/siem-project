// URL del servidor Elasticsearch (VM siem-server)
export const ES_URL = 'http://192.168.57.5:9200'

// Patrón de índice de Filebeat en Elasticsearch
export const ES_INDEX = 'filebeat-*'

// Intervalo de actualización del dashboard en milisegundos (10 segundos)
export const REFRESH_INTERVAL = 10000

// Rango de tiempo para las consultas (última hora)
export const TIME_RANGE = 'now-1h'

// Número máximo de eventos mostrados en la lista
export const MAX_EVENTS_DISPLAY = 20

// Índice donde el motor Python guarda las alertas generadas
export const ES_ALERTAS_INDEX = 'alertas-siem'