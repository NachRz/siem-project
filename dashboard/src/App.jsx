// Componente raíz del dashboard SIEM
// Orquesta los tres bloques principales: cabecera, estadísticas y lista de eventos

import Header from './components/Header/Header'
import StatsGrid from './components/StatsGrid/StatsGrid'
import EventsList from './components/EventsList/EventsList'
import { useEvents } from './hooks/useEvents'
import './styles/global.css'

function App() {
  // Hook personalizado que gestiona la conexión con Elasticsearch
  // Devuelve eventos, estadísticas calculadas y estados de carga/error
  const { events, stats, loading, error } = useEvents()

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      {/* Cabecera con logo y estado de conexión */}
      <Header />

      {/* Grid de 4 tarjetas con contadores globales */}
      <StatsGrid stats={stats} />

      {/* Lista en tiempo real de los últimos eventos recibidos */}
      <EventsList events={events} loading={loading} error={error} />
    </div>
  )
}

export default App