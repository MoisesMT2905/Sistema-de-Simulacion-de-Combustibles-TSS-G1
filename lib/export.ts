import { Evento, EstadisticasGlobales, SimulationParameters } from './types';
import { utils, write } from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatNumberES, formatCurrencyES, formatTimeES } from './utils';

/**
 * Exporta la tabla de eventos a Excel
 */
export function exportarEventosExcel(
  eventos: Evento[],
  parametros: SimulationParameters
): void {
  const worksheet = utils.json_to_sheet(
    eventos.map((e) => ({
      'ID Evento': e.id,
      'Vehículo ID': e.vehiculoId,
      'Minuto Arribo': formatNumberES(e.minutoArribo, 2),
      'Perfil': e.perfil === 'pesado' ? 'Transporte Pesado' : 'Vehículo Particular',
      'Volumen (L)': formatNumberES(e.volumen, 2),
      'Tiempo Servicio Est. (min)': formatNumberES(e.tiempoServicioEstimado, 2),
      'Espera Estimada (min)': formatNumberES(e.esperaEstimada, 2),
      'Costo Sub. (Bs)': formatNumberES(e.costoSubvencionado, 2),
      'Costo Int. (Bs)': formatNumberES(e.costoInternacional, 2),
      'Surtidor Asignado': e.surtidorAsignado === 'subvencionado' ? 'Subvencionado' : 'Internacional',
      'Número Surtidor': e.numerSurtidor,
      'Minuto Inicio Servicio': formatNumberES(e.minutoInicioServicio, 2),
      'Minuto Fin Servicio': formatNumberES(e.minutoFinServicio, 2),
      'Tiempo Real en Cola (min)': formatNumberES(e.tiempoRealEnCola, 2),
      'Precio Utilizado (Bs/L)': formatNumberES(e.precioUtilizado, 2),
      'Costo Total Final (Bs)': formatNumberES(e.costoTotalFinal, 2),
      'Costo Oportunidad (Bs)': formatNumberES(e.costoOportunidadTotal, 2),
      'Trimestre': e.trimestre,
    }))
  );

  // Ajustar ancho de columnas
  const columnWidths = [
    { wch: 10 }, // ID
    { wch: 20 }, // Vehículo ID
    { wch: 15 }, // Minuto Arribo
    { wch: 20 }, // Perfil
    { wch: 12 }, // Volumen
    { wch: 18 }, // Tiempo Servicio
    { wch: 18 }, // Espera
    { wch: 15 }, // Costo Sub
    { wch: 15 }, // Costo Int
    { wch: 18 }, // Surtidor
    { wch: 15 }, // Número Surtidor
    { wch: 20 }, // Inicio Servicio
    { wch: 18 }, // Fin Servicio
    { wch: 20 }, // Tiempo Cola
    { wch: 18 }, // Precio Utilizado
    { wch: 18 }, // Costo Total
    { wch: 18 }, // Costo Oportunidad
    { wch: 10 }, // Trimestre
  ];

  worksheet['!cols'] = columnWidths;

  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Eventos');

  // Hoja de resumen
  const resumenSheet = utils.json_to_sheet(
    [
      { 'Métrica': 'Total Eventos', 'Valor': eventos.length },
      { 'Métrica': 'Volumen Total (L)', 'Valor': formatNumberES(eventos.reduce((a, e) => a + e.volumen, 0), 2) },
      { 'Métrica': 'Ingreso Total (Bs)', 'Valor': formatNumberES(eventos.reduce((a, e) => a + e.costoTotalFinal, 0), 2) },
      { 'Métrica': 'Tiempo Promedio Espera (min)', 'Valor': formatNumberES(eventos.reduce((a, e) => a + e.tiempoRealEnCola, 0) / eventos.length, 2) },
      { 'Métrica': 'Migración a Internacional (%)', 'Valor': formatNumberES((eventos.filter(e => e.surtidorAsignado === 'internacional').length / eventos.length) * 100, 2) },
    ]
  );

  utils.book_append_sheet(workbook, resumenSheet, 'Resumen');

  write(workbook, { bookType: 'xlsx', type: 'base64' });

  // Descargar archivo
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `simulacion_eventos_${timestamp}.xlsx`;
  const link = document.createElement('a');
  link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${write(workbook, { bookType: 'xlsx', type: 'base64' })}`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exporta análisis de un evento individual a PDF
 */
export async function exportarEventoPDF(
  evento: Evento,
  parametros: SimulationParameters,
  elementoHTML: HTMLElement
): Promise<void> {
  try {
    // Convertir HTML a canvas
    const canvas = await html2canvas(elementoHTML, {
      scale: 2,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Crear PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    // Ancho y alto del contenido
    const contentWidth = pageWidth - 2 * margin;
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    // Agregar contenido
    let yPosition = margin;

    // Título
    pdf.setFontSize(16);
    pdf.text('Análisis de Evento de Simulación', margin, yPosition);
    yPosition += 10;

    // Información del evento
    pdf.setFontSize(11);
    pdf.text(`Evento ID: ${evento.id}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Vehículo: ${evento.vehiculoId}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Perfil: ${evento.perfil === 'pesado' ? 'Transporte Pesado' : 'Vehículo Particular'}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Volumen: ${formatNumberES(evento.volumen, 2)} L`, margin, yPosition);
    yPosition += 10;

    // Detalles de costos
    pdf.setFontSize(12);
    pdf.text('Análisis de Costos:', margin, yPosition);
    yPosition += 7;

    pdf.setFontSize(10);
    pdf.text(
      `Costo Subvencionado: ${formatNumberES(evento.costoSubvencionado, 2)} Bs`,
      margin + 5,
      yPosition
    );
    yPosition += 6;
    pdf.text(
      `Costo Internacional: ${formatNumberES(evento.costoInternacional, 2)} Bs`,
      margin + 5,
      yPosition
    );
    yPosition += 6;
    pdf.text(
      `Surtidor Seleccionado: ${evento.surtidorAsignado === 'subvencionado' ? 'Subvencionado' : 'Internacional'} (Surtidor #${evento.numerSurtidor})`,
      margin + 5,
      yPosition
    );
    yPosition += 6;
    pdf.text(
      `Costo Total Final: ${formatNumberES(evento.costoTotalFinal, 2)} Bs`,
      margin + 5,
      yPosition
    );
    yPosition += 10;

    // Detalles temporales
    pdf.setFontSize(12);
    pdf.text('Detalles Temporales:', margin, yPosition);
    yPosition += 7;

    pdf.setFontSize(10);
    pdf.text(`Minuto Arribo: ${formatNumberES(evento.minutoArribo, 2)}`, margin + 5, yPosition);
    yPosition += 6;
    pdf.text(
      `Espera Estimada: ${formatTimeES(evento.esperaEstimada)}`,
      margin + 5,
      yPosition
    );
    yPosition += 6;
    pdf.text(
      `Tiempo Servicio: ${formatTimeES(evento.tiempoServicioEstimado)}`,
      margin + 5,
      yPosition
    );
    yPosition += 6;
    pdf.text(
      `Tiempo Real en Cola: ${formatTimeES(evento.tiempoRealEnCola)}`,
      margin + 5,
      yPosition
    );
    yPosition += 10;

    // Agregar gráfico si hay espacio
    if (yPosition + contentHeight < pageHeight - margin) {
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        margin,
        yPosition,
        contentWidth,
        contentHeight
      );
    }

    // Descargar
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `evento_${evento.id}_${timestamp}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error('Error exportando PDF:', error);
  }
}

/**
 * Exporta resumen general con estadísticas a PDF
 */
export function exportarResumenPDF(
  eventos: Evento[],
  estadisticas: EstadisticasGlobales,
  parametros: SimulationParameters
): void {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 10;
  let yPosition = margin;

  // Título
  pdf.setFontSize(16);
  pdf.text('Resumen General de Simulación', margin, yPosition);
  yPosition += 15;

  // Parámetros utilizados
  pdf.setFontSize(12);
  pdf.text('Parámetros de Simulación:', margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  const paramsText = [
    `Número de Eventos: ${eventos.length}`,
    `Precio Subvencionado Inicial: ${formatNumberES(parametros.precioSubvencionadoInicial, 2)} Bs/L`,
    `Precio Internacional: ${formatNumberES(parametros.precioInternacional, 2)} Bs/L`,
    `Incremento Trimestral: ${formatNumberES(parametros.incrementoTrimestral, 2)} Bs/L`,
    `Surtidores Subvencionados: ${parametros.surtidoresSubvencionados}`,
    `Surtidores Internacionales: ${parametros.surtidoresInternacionales}`,
  ];

  for (const text of paramsText) {
    pdf.text(text, margin + 5, yPosition);
    yPosition += 6;
  }

  yPosition += 8;

  // Estadísticas globales
  pdf.setFontSize(12);
  pdf.text('Estadísticas Globales:', margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  const statsText = [
    `Total Eventos: ${estadisticas.totalEventos}`,
    `Volumen Total: ${formatNumberES(estadisticas.totalVolumen, 2)} L`,
    `Ingreso Total: ${formatNumberES(estadisticas.totalIngreso, 2)} Bs`,
    `Tiempo Promedio Espera: ${formatTimeES(estadisticas.tiempoPromedioEsperaGlobal)}`,
    `Proporción Transporte Pesado: ${formatNumberES(estadisticas.proporcionPesadoReal, 2)}%`,
    `Migración a Internacional: ${formatNumberES(estadisticas.migracionAlInternacional, 2)}%`,
  ];

  for (const text of statsText) {
    pdf.text(text, margin + 5, yPosition);
    yPosition += 6;
  }

  yPosition += 8;

  // Estadísticas por surtidor
  pdf.setFontSize(12);
  pdf.text('Estadísticas por Surtidor:', margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(9);
  for (const stat of estadisticas.estadisticasPorSurtidor) {
    const tipo = stat.surtidorTipo === 'subvencionado' ? 'Subvencionado' : 'Internacional';
    pdf.text(
      `Surtidor #${stat.numeroSurtidor} (${tipo}): ${stat.totalEventos} eventos, ${formatNumberES(stat.ingresoTotal, 2)} Bs`,
      margin + 5,
      yPosition
    );
    yPosition += 5;
  }

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `resumen_simulacion_${timestamp}.pdf`;
  pdf.save(filename);
}

/**
 * Exporta parámetros a JSON
 */
export function exportarParametrosJSON(parametros: SimulationParameters): void {
  const json = JSON.stringify(parametros, null, 2);
  const datastr = `data:text/json;charset=utf-8,${encodeURIComponent(json)}`;
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `parametros_simulacion_${timestamp}.json`;
  
  const link = document.createElement('a');
  link.setAttribute('href', datastr);
  link.setAttribute('download', filename);
  link.click();
}
