import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatos de números español
export function formatNumberES(num: number, decimales: number = 2): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(num);
}

export function formatCurrencyES(num: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'VES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatNumberESSimple(num: number): string {
  return num.toLocaleString('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function formatTimeES(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const mins = Math.round(minutos % 60);
  if (horas > 0) {
    return `${horas}h ${mins}min`;
  }
  return `${mins}min`;
}

// Generadores de números aleatorios
export function uniformRandom(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function exponentialRandom(lambda: number): number {
  const rand = Math.random();
  return -Math.log(1 - rand) / lambda;
}

export function normalRandom(mean: number, stdDev: number): number {
  // Box-Muller transform
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  
  const z0 = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + stdDev * z0;
}

// Poisson usando Knuth algorithm
export function poissonRandom(lambda: number): number {
  let L = Math.exp(-lambda);
  let k = 0;
  let p = Math.random();
  
  while (p > L) {
    k++;
    p *= Math.random();
  }
  
  return k;
}

// Truncar número normal si sale negativo
export function normalRandomTruncated(mean: number, stdDev: number, min: number = 0): number {
  let value = normalRandom(mean, stdDev);
  return Math.max(min, value);
}

// Generar ID único basado en timestamp
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Función para calcular porcentaje
export function calcularPorcentaje(parte: number, total: number): number {
  if (total === 0) return 0;
  return (parte / total) * 100;
}

// Función para redondear a N decimales
export function redondear(num: number, decimales: number = 2): number {
  return Math.round(num * Math.pow(10, decimales)) / Math.pow(10, decimales);
}
