import StatCard from './StatCard'
import styles from './StatsGrid.module.css'

/**
 * Grid principal de estadísticas del dashboard
 * Muestra las métricas clave del SIEM en 4 tarjetas
 *
 * Métricas mostradas:
 * - Total de eventos en la última hora
 * - Intentos de login fallidos (severidad alta)
 * - Logins exitosos (severidad baja)
 * - Uso de sudo (severidad media)
 *
 * @param {object} stats - Objeto con los contadores de cada métrica
 */
const StatsGrid = ({ stats }) => {
  return (
    <div className={styles.grid}>
      <StatCard label="Total eventos (5m)" value={stats.total} severity="neutral" />
      <StatCard label="Logins fallidos" value={stats.failed} severity="alta" />
      <StatCard label="Logins exitosos" value={stats.accepted} severity="baja" />
      <StatCard label="Uso de sudo" value={stats.sudo} severity="media" />
    </div>
  )
}

export default StatsGrid