// Componente que renderiza una alerta individual generada por el motor Python

import styles from './AlertasList.module.css'

const AlertaItem = ({ alerta }) => {
  // Extraemos los campos del documento indexado en Elasticsearch
  const { tipo, mensaje, severidad } = alerta._source
  const timestamp = new Date(alerta._source['@timestamp'])

  // Formateamos la fecha y hora en formato legible español
  const fechaFormatted = timestamp.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  // La severidad viene en mayúsculas desde Python, la pasamos a minúsculas para el CSS
  const severidadClase = severidad.toLowerCase()

  return (
    <div className={`${styles.alerta} ${styles[severidadClase]}`}>
      <div className={styles.header}>
        <span className={styles.tipo}>{tipo}</span>
        <span className={`${styles.badge} ${styles[`badge_${severidadClase}`]}`}>
          {severidad}
        </span>
      </div>
      <p className={styles.mensaje}>{mensaje}</p>
      <span className={styles.timestamp}>{fechaFormatted}</span>
    </div>
  )
}

export default AlertaItem