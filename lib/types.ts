// Tipos para el sistema de simulación

export type DistributionType = 'poisson' | 'exponencial' | 'normal' | 'uniforme';
export type UserProfile = 'pesado' | 'particular';

export interface SimulationParameters {
  // Precios
  precioSubvencionadoInicial: number; // Bs/L
  incrementoTrimestral: number; // Bs/L
  precioInternacional: number; // Bs/L
  
  // Surtidores
  surtidoresSubvencionados: number; // 1-5
  surtidoresInternacionales: number; // 1-5
  
  // Simulación
  numeroEventos: number; // 1 - 1,000,000
  periodoSimulacionMinutos: number; // minutos totales
  numeroTrimestres: number; // trimestres a simular
  
  // Perfiles de Usuarios
  proporcionPesado: number; // 0-100 %
  volumenMinimoPesado: number; // litros
  volumenMaximoPesado: number; // litros
  volumenMinimoParticular: number; // litros
  volumenMaximoParticular: number; // litros
  
  // Costos de Oportunidad
  costoOportunidadPesado: number; // Bs/hora
  costoOportunidadParticular: number; // Bs/hora
  
  // Distribuciones
  tipoDistribucionArribos: DistributionType;
  parametroArribosLambda: number; // para Poisson/Exponencial
  parametroArribosMean: number; // para Exponencial/Normal
  
  tipoDistribucionServicio: DistributionType;
  parametroServicioMean: number; // minutos
  parametroServicioDevEst: number; // desv estándar
  
  // Capacidades
  capacidadMaximaColaPorSurtidor: number;
  tiempoServicioPromedioPorLitro: number; // minutos/L
  factorCongestión: number;
  
  // Umbrales
  margenDecisionSurtidor: number; // Bs
  preferenciaAlternativa: 'cualquiera' | 'subvencionado' | 'internacional';
}

export interface Evento {
  id: number;
  vehiculoId: string;
  minutoArribo: number;
  perfil: UserProfile;
  volumen: number; // litros
  tiempoServicioEstimado: number; // minutos
  esperaEstimada: number; // minutos
  
  costoSubvencionado: number; // Bs (incluye espera)
  costoInternacional: number; // Bs (incluye espera)
  
  surtidorAsignado: 'subvencionado' | 'internacional';
  numerSurtidor: number; // 1-5
  minutoInicioServicio: number;
  minutoFinServicio: number;
  tiempoRealEnCola: number; // minutos
  
  precioUtilizado: number; // Bs/L
  costoTotalFinal: number; // Bs
  costoOportunidadTotal: number; // Bs
  
  trimestre: number; // 1, 2, 3 o 4
}

export interface EstadisticasSurtidor {
  surtidorTipo: 'subvencionado' | 'internacional';
  numeroSurtidor: number;
  totalEventos: number;
  volumenTotal: number; // litros
  ingresoTotal: number; // Bs
  tiempoPromedioEspera: number; // minutos
  longitudPromedioColaMax: number;
  tasaOcupacion: number; // %
}

export interface EstadisticasGlobales {
  totalEventos: number;
  totalVolumen: number;
  totalIngreso: number;
  tiempoPromedioEsperaGlobal: number;
  proporcionPesadoReal: number; // %
  proporcionParticularReal: number; // %
  migracionAlInternacional: number; // %
  
  estadisticasPorSurtidor: EstadisticasSurtidor[];
  estadisticasPorTrimestre: EstadisticasTrimestre[];
  ingresoPorTrimestre: Record<number, number>; // trimestre -> Bs
  demandaPorTrimestre: Record<number, number>; // trimestre -> volumen en L
}

export interface EstadisticasTrimestre {
  trimestre: number;
  totalEventos: number;
  volumenTotal: number;
  ingresoTotal: number;
  precioPromedio: number;
  migracionAlInternacional: number;
}

export interface AnalisisEvento {
  evento: Evento;
  razonDecision: string;
  ahorroOPerdida: number; // Si hubiera elegido otro surtidor
  simulacionAlternativa: {
    costoAlternativo: number;
    diferencia: number;
  };
}

export interface EstadoSimulacion {
  parametros: SimulationParameters;
  eventos: Evento[];
  estadisticas: EstadisticasGlobales;
  enProgreso: boolean;
  progreso: number; // 0-100
  tiempo: number; // milisegundos
}
