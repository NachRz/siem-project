import styles from './Header.module.css'

/**
 * Cabecera principal del dashboard
 * Muestra el título del SIEM y un indicador de estado de conexión
 */
const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.icon}>🛡️</span>
        <div>
          <h1 className={styles.title}>SIEM Dashboard</h1>
          <p className={styles.subtitle}>Monitorización en tiempo real de siem-target</p>
        </div>
      </div>
      {/* Indicador visual de conexión activa */}
      <div className={styles.status}>
        <span className={styles.dot}></span>
        <span>Conectado</span>
      </div>
    </header>
  )
}

export default Header