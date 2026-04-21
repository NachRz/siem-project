// Componente que muestra la lista de alertas generadas por el motor de detección
// A diferencia de EventsList, aquí solo aparecen las alertas procesadas, no los logs crudos

import AlertaItem from './AlertaItem'
import styles from './AlertasList.module.css'

const AlertasList = ({ alertas, total, loading, error }) => {
  // Estado de carga inicial
  if (loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Alertas de seguridad</h2>
        <p className={styles.empty}>Cargando alertas...</p>
      </div>
    )
  }

  // Estado de error cuando falla la conexión con Elasticsearch
  if (error) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Alertas de seguridad</h2>
        <p className={styles.error}>Error al cargar alertas: {error}</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        Alertas de seguridad
        <span className={styles.count}>{total}</span>
      </h2>
      <div className={styles.list}>
        {alertas.length === 0 ? (
          <p className={styles.empty}>No hay alertas generadas todavía</p>
        ) : (
          alertas.map((alerta) => (
            <AlertaItem key={alerta._id} alerta={alerta} />
          ))
        )}
      </div>
    </div>
  )
}

export default AlertasList