// Componente que renderiza una alerta individual generada por el motor Python
// Incluye badge de severidad, estado actual y botones para cambiar el estado

import { useState } from 'react'
import styles from './AlertasList.module.css'

const AlertaItem = ({ alerta, onCambiarEstado }) => {
  // Estado local para mostrar u ocultar el menú de cambio de estado
  const [menuAbierto, setMenuAbierto] = useState(false)

  // Extraemos los campos del documento indexado en Elasticsearch
  const { tipo, mensaje, severidad, estado } = alerta._source
  const timestamp = new Date(alerta._source['@timestamp'])

  // Formateamos la fecha y hora en formato legible español
  const fechaFormatted = timestamp.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  // Severidad en minúsculas para las clases CSS
  const severidadClase = severidad.toLowerCase()

  /**
   * Cambia el estado de la alerta y cierra el menú
   */
  const handleCambiarEstado = (nuevoEstado) => {
    onCambiarEstado(alerta._id, nuevoEstado)
    setMenuAbierto(false)
  }

  // Diccionario de estados con su etiqueta legible y clase CSS
  const estadosDisponibles = {
    nueva: { label: 'Nueva', clase: 'estado_nueva' },
    investigando: { label: 'Investigando', clase: 'estado_investigando' },
    resuelta: { label: 'Resuelta', clase: 'estado_resuelta' },
    falso_positivo: { label: 'Falso positivo', clase: 'estado_falso' }
  }

  // Información del estado actual para mostrar el badge
  const estadoActual = estadosDisponibles[estado] || estadosDisponibles.nueva

  return (
    <div className={`${styles.alerta} ${styles[severidadClase]}`}>
      <div className={styles.header}>
        <span className={styles.tipo}>{tipo}</span>
        <div className={styles.badges}>
          {/* Badge de severidad (ALTA, MEDIA, BAJA) */}
          <span className={`${styles.badge} ${styles[`badge_${severidadClase}`]}`}>
            {severidad}
          </span>
          {/* Badge de estado que abre el menú de cambio al hacer clic */}
          <button
            className={`${styles.estado} ${styles[estadoActual.clase]}`}
            onClick={() => setMenuAbierto(!menuAbierto)}
          >
            {estadoActual.label}
          </button>
        </div>
      </div>

      <p className={styles.mensaje}>{mensaje}</p>
      <span className={styles.timestamp}>{fechaFormatted}</span>

      {/* Menú desplegable con las opciones de cambio de estado */}
      {menuAbierto && (
        <div className={styles.menuEstados}>
          {Object.entries(estadosDisponibles).map(([clave, info]) => (
            <button
              key={clave}
              className={`${styles.opcionEstado} ${styles[info.clase]}`}
              onClick={() => handleCambiarEstado(clave)}
              disabled={clave === estado}
            >
              {info.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default AlertaItem