// Componente de filtros para las alertas
// Permite filtrar por severidad, estado, tipo y búsqueda de texto
// También incluye el botón de exportación a PDF del informe filtrado

import styles from './AlertasFilters.module.css'
import { generarInformePDF } from '../../utils/pdfExport'

const AlertasFilters = ({ filtros, onCambiarFiltro, alertas }) => {
  /**
   * Handler genérico que actualiza un filtro concreto
   */
  const handleCambio = (campo, valor) => {
    onCambiarFiltro({
      ...filtros,
      [campo]: valor
    })
  }

  /**
   * Limpia todos los filtros y los pone en su estado inicial
   */
  const limpiarFiltros = () => {
    onCambiarFiltro({
      busqueda: '',
      severidad: 'todas',
      estado: 'todos',
      tipo: 'todos'
    })
  }

  /**
   * Genera un PDF con las alertas actualmente visibles (ya filtradas)
   * Si no hay alertas que mostrar, no hace nada
   */
  const handleExportarPDF = () => {
    if (alertas && alertas.length > 0) {
      generarInformePDF(alertas)
    }
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

      {/* Botón para exportar las alertas visibles a PDF */}
      <button
        className={styles.exportar}
        onClick={handleExportarPDF}
        disabled={!alertas || alertas.length === 0}
        title="Exportar las alertas actuales a PDF"
      >
        Exportar PDF
      </button>
    </div>
  )
}

export default AlertasFilters