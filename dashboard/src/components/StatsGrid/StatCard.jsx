import styles from './StatsGrid.module.css'

/**
 * Tarjeta individual de estadística
 * Muestra un valor numérico con una etiqueta y un color según la severidad
 *
 * @param {string} label - Texto descriptivo de la métrica
 * @param {number} value - Valor numérico a mostrar
 * @param {string} severity - Nivel de severidad: alta, media, baja, neutral
 */
const StatCard = ({ label, value, severity = 'neutral' }) => {
  return (
    <div className={`${styles.card} ${styles[severity]}`}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
    </div>
  )
}

export default StatCard