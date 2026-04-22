// Componente que renderiza la gráfica temporal de eventos
// Recibe los puntos ya procesados y deduplicados del hook useTimeline

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import styles from './Timeline.module.css'

// Registramos los módulos de Chart.js que vamos a usar
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const Timeline = ({ puntos, loading, error }) => {
  // Estados de carga y error
  if (loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Actividad en la última hora</h2>
        <p className={styles.empty}>Cargando datos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Actividad en la última hora</h2>
        <p className={styles.error}>Error al cargar los datos: {error}</p>
      </div>
    )
  }

  // Etiquetas del eje X: formato HH:MM
  const labels = puntos.map(p =>
    p.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  )

  // Configuración de los datasets para Chart.js
  const data = {
    labels,
    datasets: [
      {
        label: 'Logins fallidos',
        data: puntos.map(p => p.fallidos),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        tension: 0.4,
        fill: true,
        pointRadius: 3
      },
      {
        label: 'Logins exitosos',
        data: puntos.map(p => p.exitosos),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        tension: 0.4,
        fill: true,
        pointRadius: 3
      },
      {
        label: 'Uso de sudo',
        data: puntos.map(p => p.sudo),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        tension: 0.4,
        fill: true,
        pointRadius: 3
      }
    ]
  }

  // Opciones de presentación de la gráfica
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e2e8f0',
          font: { size: 12 },
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#94a3b8',
          maxTicksLimit: 12
        },
        grid: { color: '#334155' }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#94a3b8',
          stepSize: 1
        },
        grid: { color: '#334155' }
      }
    }
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Actividad en la última hora</h2>
      <div className={styles.chart}>
        <Line data={data} options={options} />
      </div>
    </div>
  )
}

export default Timeline