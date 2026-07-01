import { SimulationParameters, Evento } from './types';
import { redondear } from './utils';

/**
 * Calcula el precio de la gasolina para un trimestre específico
 */
export function calcularPrecioTrimestre(
  parametros: SimulationParameters,
  trimestre: number
): number {
  const incrementoTotal = parametros.incrementoTrimestral * (trimestre - 1);
  return redondear(parametros.precioSubvencionadoInicial + incrementoTotal, 2);
}

/**
 * Calcula el costo total incluyendo oportunidad
 */
export function calcularCostoTotal(
  precioUnitario: number,
  volumen: number,
  tiempoEspera: number,
  costoOportunidad: number
): number {
  const costoCombustible = precioUnitario * volumen;
  const costoEsperaTotal = (tiempoEspera / 60) * costoOportunidad; // Convertir minutos a horas
  return redondear(costoCombustible + costoEsperaTotal, 2);
}

/**
 * Determina el surtidor más económico
 */
export function determinarMejorSurtidor(
  costoSubvencionado: number,
  costoInternacional: number,
  margenDecision: number,
  preferencia: 'cualquiera' | 'subvencionado' | 'internacional'
): 'subvencionado' | 'internacional' {
  
  if (preferencia === 'subvencionado') {
    // Solo cambia si la diferencia es significativa
    if (costoInternacional < costoSubvencionado - margenDecision) {
      return 'internacional';
    }
    return 'subvencionado';
  }
  
  if (preferencia === 'internacional') {
    if (costoSubvencionado < costoInternacional - margenDecision) {
      return 'subvencionado';
    }
    return 'internacional';
  }
  
  // Preferencia 'cualquiera': elegir el más barato
  return costoSubvencionado <= costoInternacional ? 'subvencionado' : 'internacional';
}

/**
 * Calcula la duración estimada del servicio basada en volumen
 */
export function calcularTiempoServicio(
  volumen: number,
  tiempoPromedioPorLitro: number
): number {
  return redondear(volumen * tiempoPromedioPorLitro, 1);
}

/**
 * Calcula la espera según ocupación del surtidor
 */
export function calcularEspera(
  colas: Map<number, Evento[]>,
  numeroSurtidor: number,
  tiempoServicio: number
): number {
  const cola = colas.get(numeroSurtidor) || [];
  let tiempoEsperaTotal = 0;
  
  for (const evento of cola) {
    tiempoEsperaTotal += evento.tiempoServicioEstimado;
  }
  
  return tiempoEsperaTotal;
}

/**
 * Obtiene trimestre basado en minuto actual
 */
export function obtenerTrimestre(
  minutoActual: number,
  minutosPorTrimestre: number
): number {
  return Math.floor(minutoActual / minutosPorTrimestre) + 1;
}

/**
 * Calcula el tiempo real en cola (diferencia entre fin de servicio y arribo)
 */
export function calcularTiempoRealEnCola(
  minutoFinServicio: number,
  minutoArribo: number,
  tiempoServicio: number
): number {
  return redondear(minutoFinServicio - minutoArribo - tiempoServicio, 1);
}

/**
 * Valida si un evento debe rechazarse (cola llena)
 */
export function validarCapacidadCola(
  colaActual: Evento[],
  capacidadMaxima: number
): boolean {
  return colaActual.length < capacidadMaxima;
}

/**
 * Calcula longitud promedio de cola
 */
export function calcularLongitudPromedioCola(
  tiemposColaEventos: number[]
): number {
  if (tiemposColaEventos.length === 0) return 0;
  const suma = tiemposColaEventos.reduce((a, b) => a + b, 0);
  return redondear(suma / tiemposColaEventos.length, 2);
}

/**
 * Calcula tasa de ocupación de un surtidor
 */
export function calcularTasaOcupacion(
  tiempoTotalServicio: number,
  tiempoSimulacionTotal: number
): number {
  if (tiempoSimulacionTotal === 0) return 0;
  return redondear((tiempoTotalServicio / tiempoSimulacionTotal) * 100, 2);
}

/**
 * Calcula número óptimo de surtidor asignado (round-robin)
 */
export function seleccionarSurtidorOptimo(
  tipo: 'subvencionado' | 'internacional',
  colas: Map<number, Evento[]>,
  numeroSurtidores: number,
  rangoInicio: number = 1
): number {
  // Buscar surtidor con menor cola
  let mejorSurtidor = rangoInicio;
  let menorCola = colas.get(mejorSurtidor)?.length || 0;
  
  for (let i = rangoInicio + 1; i < rangoInicio + numeroSurtidores; i++) {
    const longitudCola = colas.get(i)?.length || 0;
    if (longitudCola < menorCola) {
      menorCola = longitudCola;
      mejorSurtidor = i;
    }
  }
  
  return mejorSurtidor;
}

/**
 * Simula "what-if" para análisis de evento
 */
export function calcularEscenarioAlternativo(
  eventoActual: Evento,
  parametros: SimulationParameters,
  precioActual: number
): { costo: number; diferencia: number } {
  
  const tipoBuscado = eventoActual.surtidorAsignado === 'subvencionado' 
    ? 'internacional' 
    : 'subvencionado';
  
  const precioAlternativo = tipoBuscado === 'internacional' 
    ? parametros.precioInternacional 
    : precioActual;
  
  const costoOportunidadAlternativo = tipoBuscado === 'internacional'
    ? parametros.costoOportunidadParticular
    : (eventoActual.perfil === 'pesado' 
      ? parametros.costoOportunidadPesado 
      : parametros.costoOportunidadParticular);
  
  const costoAlternativo = calcularCostoTotal(
    precioAlternativo,
    eventoActual.volumen,
    eventoActual.esperaEstimada,
    costoOportunidadAlternativo
  );
  
  return {
    costo: costoAlternativo,
    diferencia: redondear(costoAlternativo - eventoActual.costoTotalFinal, 2)
  };
}
