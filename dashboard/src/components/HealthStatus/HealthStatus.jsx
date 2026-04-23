// Componente que muestra el estado de salud de los componentes del SIEM
// Indicadores: verde (activo), rojo (caído), gris (comprobando)

import styles from './HealthStatus.module.css'

const HealthStatus = ({ health }) => {
  /**
   * Determina la clase CSS del indicador según el estado del componente
   * - null: comprobando (gris con animación)
   * - true: activo (verde)
   * - false: caído (rojo)
   */
  const getEstadoClase = (estado) => {
    if (estado === null) return styles.checking
    if (estado === true) return styles.ok
    return styles.ko
  }

  /**
   * Texto informativo del estado del componente
   */
  const getEstadoTexto = (estado) => {
    if (estado === null) return 'Comprobando'
    if (estado === true) return 'Activo'
    return 'Inactivo'
  }

  // Lista de componentes con su nombre visible y su clave en el objeto health
  const componentes = [
    { clave: 'elasticsearch', nombre: 'Elasticsearch' },
    { clave: 'filebeat', nombre: 'Filebeat' },
    { clave: 'motorPython', nombre: 'Motor Python' }
  ]

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Salud del sistema</h3>
      <div className={styles.grid}>
        {componentes.map(({ clave, nombre }) => {
          const estado = health[clave]
          return (
            <div key={clave} className={styles.componente}>
              <span className={`${styles.dot} ${getEstadoClase(estado)}`}></span>
              <div className={styles.info}>
                <span className={styles.nombre}>{nombre}</span>
                <span className={styles.estado}>{getEstadoTexto(estado)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default HealthStatus