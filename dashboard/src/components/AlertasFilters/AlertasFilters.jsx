// Componente de filtros para las alertas
// Permite filtrar por severidad, estado, tipo y búsqueda de texto
// Los filtros se aplican en el cliente sobre las alertas ya cargadas

import styles from './AlertasFilters.module.css'

const AlertasFilters = ({ filtros, onCambiarFiltro }) => {
  /**
   * Handler genérico que actualiza un filtro concreto
   * Mantiene el resto de filtros intactos
   */
  const handleCambio = (campo, valor) => {
    onCambiarFiltro({
      ...filtros,
      [campo]: valor
    })
  }

  /**
   * Limpia todos los filtros y los pone en su estado inicial (todos activos)
   */
  const limpiarFiltros = () => {
    onCambiarFiltro({
      busqueda: '',
      severidad: 'todas',
      estado: 'todos',
      tipo: 'todos'
    })
  }

  return (
    <div className={styles.filtros}>
      {/* Campo de búsqueda libre por texto */}
      <div className={styles.campo}>
        <label className={styles.label}>Buscar</label>
        <input
          type="text"
          className={styles.input}
          placeholder="Buscar en mensajes..."
          value={filtros.busqueda}
          onChange={(e) => handleCambio('busqueda', e.target.value)}
        />
      </div>

      {/* Selector de severidad */}
      <div className={styles.campo}>
        <label className={styles.label}>Severidad</label>
        <select
          className={styles.select}
          value={filtros.severidad}
          onChange={(e) => handleCambio('severidad', e.target.value)}
        >
          <option value="todas">Todas</option>
          <option value="ALTA">Alta</option>
          <option value="MEDIA">Media</option>
          <option value="BAJA">Baja</option>
        </select>
      </div>

      {/* Selector de estado */}
      <div className={styles.campo}>
        <label className={styles.label}>Estado</label>
        <select
          className={styles.select}
          value={filtros.estado}
          onChange={(e) => handleCambio('estado', e.target.value)}
        >
          <option value="todos">Todos</option>
          <option value="nueva">Nueva</option>
          <option value="investigando">Investigando</option>
          <option value="resuelta">Resuelta</option>
          <option value="falso_positivo">Falso positivo</option>
        </select>
      </div>

      {/* Botón para limpiar todos los filtros */}
      <button className={styles.limpiar} onClick={limpiarFiltros}>
        Limpiar filtros
      </button>
    </div>
  )
}

export default AlertasFilters