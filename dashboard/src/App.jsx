// Componente raíz del dashboard SIEM
// Orquesta los cinco bloques principales:
// cabecera, estadísticas, gráfica temporal, alertas generadas y lista de eventos crudos

import Header from './components/Header/Header'
import StatsGrid from './components/StatsGrid/StatsGrid'
import Timeline from './components/Timeline/Timeline'
import AlertasList from './components/AlertasList/AlertasList'
import EventsList from './components/EventsList/EventsList'
import { useEvents } from './hooks/useEvents'
import { useAlertas } from './hooks/useAlertas'
import { useTimeline } from './hooks/useTimeline'
import './styles/global.css'

function App() {
  // Hook que gestiona los eventos crudos provenientes de Filebeat
  const { events, stats, loading: loadingEvents, error: errorEvents } = useEvents()

  // Hook que gestiona las alertas procesadas por el motor de detección Python
  const { alertas, total: totalAlertas, loading: loadingAlertas, error: errorAlertas } = useAlertas()

  // Hook que gestiona los puntos procesados por minuto para la gráfica temporal
  const { puntos, loading: loadingTimeline, error: errorTimeline } = useTimeline()

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      {/* Cabecera con logo y estado de conexión */}
      <Header />

      {/* Grid de 4 tarjetas con contadores globales de eventos */}
      <StatsGrid stats={stats} />

      {/* Gráfica temporal con la actividad de la última hora */}
      <Timeline
        puntos={puntos}
        loading={loadingTimeline}
        error={errorTimeline}
      />

      {/* Sección destacada con las alertas generadas por el motor de detección */}
      <AlertasList
        alertas={alertas}
        total={totalAlertas}
        loading={loadingAlertas}
        error={errorAlertas}
      />

      {/* Lista en tiempo real de los últimos eventos recibidos del sistema */}
      <EventsList events={events} loading={loadingEvents} error={errorEvents} />
    </div>
  )
}

export default App