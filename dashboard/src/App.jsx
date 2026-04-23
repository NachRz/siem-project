// Componente raíz del dashboard SIEM
// Orquesta los bloques principales:
// cabecera, salud del sistema, estadísticas, gráfica temporal,
// filtros + alertas generadas y lista de eventos crudos

import { useState, useMemo } from 'react'
import Header from './components/Header/Header'
import HealthStatus from './components/HealthStatus/HealthStatus'
import StatsGrid from './components/StatsGrid/StatsGrid'
import Timeline from './components/Timeline/Timeline'
import AlertasFilters from './components/AlertasFilters/AlertasFilters'
import AlertasList from './components/AlertasList/AlertasList'
import EventsList from './components/EventsList/EventsList'
import { useEvents } from './hooks/useEvents'
import { useAlertas } from './hooks/useAlertas'
import { useTimeline } from './hooks/useTimeline'
import { useHealth } from './hooks/useHealth'
import './styles/global.css'

function App() {
  // Hook que gestiona los eventos crudos provenientes de Filebeat
  const { events, stats, loading: loadingEvents, error: errorEvents } = useEvents()

  // Hook que gestiona las alertas procesadas por el motor de detección Python
  const {
    alertas,
    loading: loadingAlertas,
    error: errorAlertas,
    cambiarEstado
  } = useAlertas()

  // Hook que gestiona los puntos procesados por minuto para la gráfica temporal
  const { puntos, loading: loadingTimeline, error: errorTimeline } = useTimeline()

  // Hook que monitoriza la salud de los componentes del SIEM
  const health = useHealth()

  // Estado de los filtros aplicados sobre las alertas
  const [filtros, setFiltros] = useState({
    busqueda: '',
    severidad: 'todas',
    estado: 'todos',
    tipo: 'todos'
  })

  /**
   * Filtra las alertas según los criterios seleccionados por el usuario
   * Usamos useMemo para no recalcular en cada render si los inputs no cambian
   */
  const alertasFiltradas = useMemo(() => {
    return alertas.filter(alerta => {
      const { tipo, mensaje, severidad, estado } = alerta._source

      // Filtro por búsqueda de texto (busca en mensaje y tipo)
      if (filtros.busqueda) {
        const textoBusqueda = filtros.busqueda.toLowerCase()
        const enMensaje = mensaje?.toLowerCase().includes(textoBusqueda)
        const enTipo = tipo?.toLowerCase().includes(textoBusqueda)
        if (!enMensaje && !enTipo) return false
      }

      // Filtro por severidad
      if (filtros.severidad !== 'todas' && severidad !== filtros.severidad) {
        return false
      }

      // Filtro por estado
      if (filtros.estado !== 'todos' && estado !== filtros.estado) {
        return false
      }

      return true
    })
  }, [alertas, filtros])

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      {/* Cabecera con logo y estado de conexión */}
      <Header />

      {/* Panel de salud con indicadores de los componentes del SIEM */}
      <HealthStatus health={health} />

      {/* Grid de 4 tarjetas con contadores globales de eventos */}
      <StatsGrid stats={stats} />

      {/* Gráfica temporal con la actividad de la última hora */}
      <Timeline
        puntos={puntos}
        loading={loadingTimeline}
        error={errorTimeline}
      />

      {/* Sección de alertas con filtros y gestión de estados */}
      <div style={{ background: '#1e293b', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
        <AlertasFilters
          filtros={filtros}
          onCambiarFiltro={setFiltros}
          alertas={alertasFiltradas}
        />
        <AlertasList
          alertas={alertasFiltradas}
          total={alertasFiltradas.length}
          loading={loadingAlertas}
          error={errorAlertas}
          onCambiarEstado={cambiarEstado}
        />
      </div>

      {/* Lista en tiempo real de los últimos eventos recibidos del sistema */}
      <EventsList events={events} loading={loadingEvents} error={errorEvents} />
    </div>
  )
}

export default App