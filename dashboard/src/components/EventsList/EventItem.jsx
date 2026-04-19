import styles from './EventsList.module.css'
import { getSeverity } from '../../utils/severity'

// Componente que renderiza un único evento de la lista
const EventItem = ({ event }) => {
  // Extraemos el mensaje y el timestamp del hit de Elasticsearch
  const message = event._source.message || 'Sin mensaje'
  const timestamp = new Date(event._source['@timestamp'])

  // Calculamos la severidad en base al contenido del mensaje
  const severity = getSeverity(message)

  // Formateamos la hora en formato HH:MM:SS local
  const timeFormatted = timestamp.toLocaleTimeString('es-ES')

  return (
    <div className={`${styles.item} ${styles[severity]}`}>
      <span className={styles.timestamp}>{timeFormatted}</span>
      <span className={styles.message}>{message}</span>
      <span className={`${styles.badge} ${styles[`badge_${severity}`]}`}>
        {severity}
      </span>
    </div>
  )
}

export default EventItem