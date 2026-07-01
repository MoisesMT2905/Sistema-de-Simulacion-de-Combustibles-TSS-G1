import { DistributionType } from './types';
import { 
  uniformRandom, 
  exponentialRandom, 
  normalRandomTruncated, 
  poissonRandom 
} from './utils';

/**
 * Genera un número aleatorio según el tipo de distribución
 */
export function generarAleatorioSegunDistribucion(
  tipo: DistributionType,
  parametro1: number,
  parametro2: number = 0
): number {
  switch (tipo) {
    case 'uniforme':
      // parametro1 = min, parametro2 = max
      return uniformRandom(parametro1, parametro2);
    
    case 'exponencial':
      // parametro1 = lambda (tasa), parametro2 = ignorado
      return exponentialRandom(parametro1);
    
    case 'normal':
      // parametro1 = media, parametro2 = desv estándar
      return normalRandomTruncated(parametro1, parametro2, 0);
    
    case 'poisson':
      // parametro1 = lambda
      return poissonRandom(parametro1);
    
    default:
      return 0;
  }
}

/**
 * Genera el tiempo entre arribos
 */
export function generarTiempoEntreArribos(
  tipoDistribucion: DistributionType,
  parametroLambda: number,
  parametroMean: number
): number {
  switch (tipoDistribucion) {
    case 'poisson':
      return poissonRandom(parametroLambda);
    
    case 'exponencial':
      return exponentialRandom(1 / parametroMean); // mean = 1/lambda
    
    case 'uniforme':
      // Asumimos que parametroMean es la media, y generamos uniforme entre 0 y 2*mean
      return uniformRandom(0, 2 * parametroMean);
    
    case 'normal':
      // Usar parametroMean como media y 20% como desv estándar
      return normalRandomTruncated(parametroMean, parametroMean * 0.2, 0.1);
    
    default:
      return parametroMean;
  }
}

/**
 * Genera el volumen de combustible a cargar
 */
export function generarVolumen(
  esTransportePesado: boolean,
  volumenMinimoPesado: number,
  volumenMaximoPesado: number,
  volumenMinimoParticular: number,
  volumenMaximoParticular: number
): number {
  if (esTransportePesado) {
    return uniformRandom(volumenMinimoPesado, volumenMaximoPesado);
  } else {
    return uniformRandom(volumenMinimoParticular, volumenMaximoParticular);
  }
}

/**
 * Genera el tiempo de servicio
 */
export function generarTiempoServicio(
  tipoDistribucion: DistributionType,
  media: number,
  desvEstandar: number,
  tiempoPromedioPorLitro: number,
  volumen: number
): number {
  let tiempoBase = 0;
  
  switch (tipoDistribucion) {
    case 'exponencial':
      tiempoBase = exponentialRandom(1 / media);
      break;
    
    case 'normal':
      tiempoBase = normalRandomTruncated(media, desvEstandar, 0.1);
      break;
    
    case 'uniforme':
      tiempoBase = uniformRandom(media * 0.5, media * 1.5);
      break;
    
    case 'poisson':
      // Para Poisson usamos su valor directo como tiempo
      tiempoBase = poissonRandom(media);
      break;
    
    default:
      tiempoBase = media;
  }
  
  // Ajustar por volumen
  return tiempoBase + (volumen * tiempoPromedioPorLitro);
}

/**
 * Genera el tipo de perfil del usuario (Pesado o Particular)
 */
export function generarPerfil(
  proporcionPesado: number
): 'pesado' | 'particular' {
  const aleatorio = Math.random() * 100;
  return aleatorio < proporcionPesado ? 'pesado' : 'particular';
}
