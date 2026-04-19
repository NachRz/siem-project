import EventItem from './EventItem'
import styles from './EventsList.module.css'
import { MAX_EVENTS_DISPLAY } from '../../config/constants'

// Componente que muestra la lista de últimos eventos recibidos de Elasticsearch
const EventsList = ({ events, loading, error }) => {
  // Estado de carga inicial
  if (loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Últimos eventos</h2>
        <p className={styles.empty}>Cargando eventos...</p>
      </div>
    )
  }

  // Estado de error al conectar con Elasticsearch
  if (error) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Últimos eventos</h2>
        <p className={styles.error}>Error al conectar con Elasticsearch: {error}</p>
      </div>
    )
  }

  // Limitamos el número de eventos mostrados para no saturar la interfaz
  const eventsToShow = events.slice(0, MAX_EVENTS_DISPLAY)

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        Últimos eventos
        <span className={styles.count}>{events.length}</span>
      </h2>
      <div className={styles.list}>
        {eventsToShow.length === 0 ? (
          <p className={styles.empty}>No hay eventos recientes</p>
        ) : (
          eventsToShow.map((event) => (
            <EventItem key={event._id} event={event} />
          ))
        )}
      </div>
    </div>
  )
}

export default EventsList