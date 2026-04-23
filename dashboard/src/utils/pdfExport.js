// Utilidad para generar informes PDF del SIEM
// Usa jsPDF + autotable para crear documentos profesionales exportables

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * Colores corporativos del informe (coherentes con el dashboard)
 */
const COLORES = {
  primario: [30, 41, 59],       // Azul oscuro (cabecera)
  texto: [51, 65, 85],          // Gris oscuro (texto)
  alta: [239, 68, 68],          // Rojo (severidad alta)
  media: [245, 158, 11],        // Naranja (severidad media)
  baja: [16, 185, 129],         // Verde (severidad baja)
  textoClaro: [148, 163, 184]   // Gris claro (subtítulos)
}

/**
 * Convierte un estado técnico a su etiqueta legible
 */
const formatearEstado = (estado) => {
  const mapa = {
    nueva: 'Nueva',
    investigando: 'Investigando',
    resuelta: 'Resuelta',
    falso_positivo: 'Falso positivo'
  }
  return mapa[estado] || 'Nueva'
}

/**
 * Calcula las estadísticas globales de un conjunto de alertas
 */
const calcularEstadisticas = (alertas) => {
  const stats = {
    total: alertas.length,
    alta: 0,
    media: 0,
    baja: 0,
    nueva: 0,
    investigando: 0,
    resuelta: 0,
    falso_positivo: 0
  }

  alertas.forEach(alerta => {
    const { severidad, estado } = alerta._source
    const sev = severidad?.toLowerCase()
    if (sev in stats) stats[sev]++

    const est = estado || 'nueva'
    if (est in stats) stats[est]++
  })

  return stats
}

/**
 * Dibuja la cabecera del informe con título, subtítulo y fecha
 */
const dibujarCabecera = (doc) => {
  // Banda superior de color primario
  doc.setFillColor(...COLORES.primario)
  doc.rect(0, 0, 210, 35, 'F')

  // Título principal
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('Informe de Seguridad SIEM', 14, 15)

  // Subtítulo
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Sistema de detección de anomalías y amenazas', 14, 23)

  // Fecha del informe (alineada a la derecha)
  const fecha = new Date().toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  doc.setFontSize(9)
  doc.text(`Generado: ${fecha}`, 196, 15, { align: 'right' })
}

/**
 * Dibuja la sección de resumen ejecutivo con tarjetas de estadísticas
 */
const dibujarResumen = (doc, stats) => {
  doc.setTextColor(...COLORES.primario)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumen ejecutivo', 14, 50)

  // Tarjetas de severidad (3 columnas)
  const tarjetas = [
    { label: 'Severidad alta', valor: stats.alta, color: COLORES.alta },
    { label: 'Severidad media', valor: stats.media, color: COLORES.media },
    { label: 'Severidad baja', valor: stats.baja, color: COLORES.baja }
  ]

  const anchoTarjeta = 60
  const gap = 5
  let x = 14
  const y = 58

  tarjetas.forEach(tarjeta => {
    // Fondo de la tarjeta
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(x, y, anchoTarjeta, 25, 2, 2, 'F')

    // Borde lateral de color
    doc.setFillColor(...tarjeta.color)
    doc.rect(x, y, 3, 25, 'F')

    // Etiqueta
    doc.setTextColor(...COLORES.textoClaro)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(tarjeta.label, x + 7, y + 8)

    // Valor
    doc.setTextColor(...COLORES.primario)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text(String(tarjeta.valor), x + 7, y + 20)

    x += anchoTarjeta + gap
  })

  // Subtítulo total
  doc.setTextColor(...COLORES.textoClaro)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Total de alertas en el informe: ${stats.total}`, 14, 95)

  // Desglose por estado
  doc.setTextColor(...COLORES.texto)
  doc.setFontSize(9)
  const estadosTexto =
    `Nuevas: ${stats.nueva}  |  ` +
    `Investigando: ${stats.investigando}  |  ` +
    `Resueltas: ${stats.resuelta}  |  ` +
    `Falsos positivos: ${stats.falso_positivo}`
  doc.text(estadosTexto, 14, 101)
}

/**
 * Dibuja la tabla detallada de alertas usando autoTable
 */
const dibujarTablaAlertas = (doc, alertas) => {
  doc.setTextColor(...COLORES.primario)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Detalle de alertas', 14, 115)

  // Preparamos los datos de la tabla
  const filas = alertas.map(alerta => {
    const { tipo, mensaje, severidad, estado } = alerta._source
    const timestamp = new Date(alerta._source['@timestamp'])
    const fecha = timestamp.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })

    return [
      fecha,
      severidad || '-',
      tipo || '-',
      mensaje || '-',
      formatearEstado(estado)
    ]
  })

  // Generamos la tabla
  autoTable(doc, {
    startY: 120,
    head: [['Fecha', 'Severidad', 'Tipo', 'Mensaje', 'Estado']],
    body: filas,
    headStyles: {
      fillColor: COLORES.primario,
      textColor: 255,
      fontSize: 9,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: COLORES.texto,
      cellPadding: 3
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 28 },       // Fecha
      1: { cellWidth: 20, halign: 'center' },  // Severidad
      2: { cellWidth: 40 },       // Tipo
      3: { cellWidth: 'auto' },   // Mensaje (flexible)
      4: { cellWidth: 25, halign: 'center' }   // Estado
    },
    // Coloreamos la celda de severidad según el valor
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 1) {
        const sev = data.cell.raw?.toLowerCase()
        if (sev === 'alta') {
          data.cell.styles.fillColor = [254, 226, 226]
          data.cell.styles.textColor = COLORES.alta
          data.cell.styles.fontStyle = 'bold'
        } else if (sev === 'media') {
          data.cell.styles.fillColor = [254, 243, 199]
          data.cell.styles.textColor = COLORES.media
          data.cell.styles.fontStyle = 'bold'
        } else if (sev === 'baja') {
          data.cell.styles.fillColor = [209, 250, 229]
          data.cell.styles.textColor = COLORES.baja
          data.cell.styles.fontStyle = 'bold'
        }
      }
    },
    // Pie con numeración de páginas
    didDrawPage: () => {
      const paginaActual = doc.internal.getNumberOfPages()
      doc.setTextColor(...COLORES.textoClaro)
      doc.setFontSize(8)
      doc.text(
        `Página ${paginaActual}`,
        196,
        doc.internal.pageSize.height - 10,
        { align: 'right' }
      )
      doc.text(
        'SIEM — Proyecto Final Bastionado de Redes',
        14,
        doc.internal.pageSize.height - 10
      )
    }
  })
}

/**
 * Genera y descarga un informe PDF con las alertas pasadas como parámetro
 *
 * @param {Array} alertas - Array de alertas de Elasticsearch
 */
export const generarInformePDF = (alertas) => {
  // Creamos el documento en formato A4
  const doc = new jsPDF('portrait', 'mm', 'a4')

  // Calculamos las estadísticas del informe
  const stats = calcularEstadisticas(alertas)

  // Componemos las secciones del documento
  dibujarCabecera(doc)
  dibujarResumen(doc, stats)
  dibujarTablaAlertas(doc, alertas)

  // Nombre del fichero con fecha actual
  const fechaFichero = new Date().toISOString().split('T')[0]
  const nombreFichero = `informe-siem-${fechaFichero}.pdf`

  // Descargamos el PDF
  doc.save(nombreFichero)
}